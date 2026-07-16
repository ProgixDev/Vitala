import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SupabaseService } from '../../supabase/supabase.service';
import { StripeService } from '../../integrations/stripe/stripe.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateIntentDto, RefundDto } from './dto/payment.dto';

/**
 * Presentment currency. Patients are in Montreal; the Stripe account settles in
 * EUR and converts. Stored uppercase on `payments`, lowercased for the Stripe
 * API.
 */
const CURRENCY = 'CAD';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger('Payments');

  constructor(
    private readonly supabase: SupabaseService,
    private readonly stripe: StripeService,
    private readonly notifications: NotificationsService,
    private readonly events: EventEmitter2,
  ) {}

  config() {
    return { publishableKey: this.stripe.publishableKey, enabled: this.stripe.isEnabled };
  }

  // ---- card on file -------------------------------------------------------

  /**
   * The patient's Stripe Customer, created on first use.
   *
   * Lazy rather than at signup: most Stripe Customers would sit empty forever,
   * and a customer with no payment method buys nothing. The id is written back
   * immediately, so this is create-once even though it's called on every card
   * operation.
   */
  private async ensureCustomer(user: AuthUser): Promise<string> {
    const admin = this.supabase.admin();
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id, full_name')
      .eq('id', user.id)
      .maybeSingle();
    if (profile?.stripe_customer_id) return profile.stripe_customer_id as string;

    const customer = await this.stripe.createCustomer(
      {
        name: (profile?.full_name as string) ?? undefined,
        metadata: { profile_id: user.id },
      },
      // One customer per profile even if two requests race.
      `customer_${user.id}`,
    );
    await admin
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', user.id);
    return customer.id;
  }

  /**
   * Start "add a card". The client drives Stripe's sheet with the returned
   * secret; no card data ever touches this server, which is the whole point —
   * it keeps the app out of PCI scope.
   */
  async createSetupIntent(user: AuthUser) {
    if (!this.stripe.isEnabled) throw new BadRequestException('Payments not configured');
    const customerId = await this.ensureCustomer(user);
    const si = await this.stripe.createSetupIntent({
      customer: customerId,
      // Consent to charge later without the patient present — what booking's
      // off-session authorisation relies on.
      usage: 'off_session',
      automatic_payment_methods: { enabled: true },
      metadata: { profile_id: user.id },
    });
    return { clientSecret: si.client_secret, setupIntentId: si.id };
  }

  /**
   * Finish "add a card": read the SetupIntent back and remember its result.
   *
   * The client tells us the sheet closed; Stripe tells us what actually got
   * attached. Same rule as activateIfAuthorised — the client triggers, Stripe
   * decides. A client claiming success for an intent that never succeeded gets
   * nothing.
   */
  async saveCardFromSetupIntent(user: AuthUser, setupIntentId: string) {
    if (!this.stripe.isEnabled) throw new BadRequestException('Payments not configured');

    let si: Stripe.SetupIntent;
    try {
      si = await this.stripe.retrieveSetupIntent(setupIntentId);
    } catch (err) {
      // An id Stripe doesn't recognise is bad input, not a server fault. Letting
      // the raw Stripe error escape would surface as an opaque 500 with no clue
      // for the caller — the same trap as a raw Supabase error.
      const e = err as Stripe.errors.StripeError;
      if (e?.type === 'StripeInvalidRequestError') {
        throw new BadRequestException(`Unknown setup intent: ${setupIntentId}`);
      }
      throw err;
    }

    if (si.metadata?.profile_id !== user.id) {
      throw new ForbiddenException('Not your setup intent');
    }
    if (si.status !== 'succeeded' || !si.payment_method) {
      throw new BadRequestException(`Card was not saved (setup intent is ${si.status})`);
    }
    const pm = typeof si.payment_method === 'string' ? si.payment_method : si.payment_method.id;
    await this.supabase
      .admin()
      .from('profiles')
      .update({ default_payment_method: pm })
      .eq('id', user.id);
    return this.listCards(user);
  }

  /**
   * Cards on file, straight from Stripe rather than a local copy.
   *
   * Stripe is the only source of truth for what is chargeable: a card can expire
   * or be detached without telling us, so a mirrored brand/last4 in our database
   * would drift into lying to the patient.
   */
  async listCards(user: AuthUser) {
    if (!this.stripe.isEnabled) return [];
    const admin = this.supabase.admin();
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id, default_payment_method')
      .eq('id', user.id)
      .maybeSingle();
    if (!profile?.stripe_customer_id) return [];

    const pms = await this.stripe.listPaymentMethods(profile.stripe_customer_id as string);
    return pms.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand ?? 'card',
      last4: pm.card?.last4 ?? '????',
      expMonth: pm.card?.exp_month ?? null,
      expYear: pm.card?.exp_year ?? null,
      isDefault: pm.id === profile.default_payment_method,
    }));
  }

  async deleteCard(user: AuthUser, paymentMethodId: string) {
    if (!this.stripe.isEnabled) throw new BadRequestException('Payments not configured');
    const admin = this.supabase.admin();
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id, default_payment_method')
      .eq('id', user.id)
      .maybeSingle();
    if (!profile?.stripe_customer_id) throw new NotFoundException('No cards on file');

    // Never detach on the client's say-so alone: confirm Stripe agrees this card
    // belongs to this customer, or one patient could remove another's.
    const pms = await this.stripe.listPaymentMethods(profile.stripe_customer_id as string);
    if (!pms.data.some((pm) => pm.id === paymentMethodId)) {
      throw new ForbiddenException('Not your card');
    }
    await this.stripe.detachPaymentMethod(paymentMethodId);

    // Promote another card rather than silently leaving the patient with none
    // selected — otherwise booking quietly falls back to the payment sheet and
    // nobody knows why.
    if (profile.default_payment_method === paymentMethodId) {
      const remaining = pms.data.find((pm) => pm.id !== paymentMethodId);
      await admin
        .from('profiles')
        .update({ default_payment_method: remaining?.id ?? null })
        .eq('id', user.id);
    }
    return this.listCards(user);
  }

  async setDefaultCard(user: AuthUser, paymentMethodId: string) {
    const admin = this.supabase.admin();
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();
    if (!profile?.stripe_customer_id) throw new NotFoundException('No cards on file');
    const pms = await this.stripe.listPaymentMethods(profile.stripe_customer_id as string);
    if (!pms.data.some((pm) => pm.id === paymentMethodId)) {
      throw new ForbiddenException('Not your card');
    }
    await admin
      .from('profiles')
      .update({ default_payment_method: paymentMethodId })
      .eq('id', user.id);
    return this.listCards(user);
  }

  /**
   * Create (or reuse) a Stripe PaymentIntent for a confirmed appointment.
   * Amount is derived from the appointment row — never trusted from the client.
   */
  async createIntent(user: AuthUser, dto: CreateIntentDto) {
    if (!this.stripe.isEnabled) throw new BadRequestException('Payments not configured');
    const admin = this.supabase.admin();

    const { data: appt, error } = await admin
      .from('appointments')
      .select('id, patient_id, price, status')
      .eq('id', dto.appointment_id)
      .maybeSingle();
    if (error) throw error;
    if (!appt) throw new NotFoundException('Appointment not found');
    if (appt.patient_id !== user.id) throw new ForbiddenException('Not your appointment');
    // `awaiting_payment` is the normal case: the request is not announced to any
    // nurse until this authorisation succeeds. Terminal states can't be paid.
    if (['cancelled', 'declined'].includes(appt.status)) {
      throw new BadRequestException('That appointment is no longer active');
    }

    const { data: existing } = await admin
      .from('payments')
      .select('*')
      .eq('appointment_id', appt.id)
      .maybeSingle();

    if (existing?.status === 'completed') {
      throw new BadRequestException('Payment already completed');
    }
    // Reuse a still-payable intent. `requires_capture` means the hold is already
    // in place — nothing left for the patient to do.
    if (existing?.stripe_payment_intent_id) {
      const pi = await this.stripe.retrievePaymentIntent(existing.stripe_payment_intent_id);
      if (pi.status === 'requires_capture') {
        throw new BadRequestException('This visit is already authorised');
      }
      if (['requires_payment_method', 'requires_confirmation'].includes(pi.status)) {
        return {
          clientSecret: pi.client_secret,
          amount: existing.amount,
          currency: existing.currency,
        };
      }
    }

    const amountCents = Math.round(Number(appt.price) * 100);
    const pi = await this.stripe.createPaymentIntent(
      {
        amount: amountCents,
        currency: CURRENCY.toLowerCase(),
        // Hold the funds now, take them when the visit is done. Cancelling before
        // capture releases the hold outright — no charge, no refund, no fee.
        capture_method: 'manual',
        metadata: { appointment_id: appt.id, user_id: user.id },
        automatic_payment_methods: { enabled: true },
      },
      // One authorisation per visit. The reuse checks above already catch the
      // common retry, but they lose a genuine race: two taps land together, both
      // read "no existing payment", and both create an intent — the upsert below
      // then keeps only one id and the other hold is orphaned on the patient's
      // card, invisible to us and released only when it expires. The key makes
      // Stripe return the FIRST intent instead of minting a second.
      `auth_${appt.id}`,
    );

    await admin.from('payments').upsert(
      {
        appointment_id: appt.id,
        user_id: user.id,
        amount: appt.price,
        currency: CURRENCY,
        method: 'stripe',
        status: 'processing',
        stripe_payment_intent_id: pi.id,
      },
      { onConflict: 'appointment_id' },
    );

    return { clientSecret: pi.client_secret, amount: appt.price, currency: CURRENCY };
  }

  /**
   * Authorise a visit against the patient's saved card, with nobody watching.
   *
   * This is what makes booking one tap: no payment sheet, no second screen —
   * the request is funded and open to nurses in the same call that created it.
   *
   * Returns whether the hold is now in place. NEVER THROWS: every failure here
   * is a normal, expected outcome, not an error. No card on file, a decline, an
   * expired card, a bank demanding 3DS — all of them just mean "we couldn't do
   * it silently", and the answer is the same in every case: leave the request at
   * `awaiting_payment` and let the patient finish on /pay/:id, which is exactly
   * the flow that existed before. Failing soft is what keeps this a shortcut
   * rather than a new way to lose a booking.
   */
  async authoriseOffSession(user: AuthUser, appointmentId: string): Promise<boolean> {
    if (!this.stripe.isEnabled) return false;
    const admin = this.supabase.admin();

    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id, default_payment_method')
      .eq('id', user.id)
      .maybeSingle();
    // The common case for a new patient — not worth a log line.
    if (!profile?.stripe_customer_id || !profile.default_payment_method) return false;

    const { data: appt } = await admin
      .from('appointments')
      .select('id, price, patient_id')
      .eq('id', appointmentId)
      .maybeSingle();
    if (!appt || appt.patient_id !== user.id) return false;

    try {
      const pi = await this.stripe.createPaymentIntent(
        {
          amount: Math.round(Number(appt.price) * 100),
          currency: CURRENCY.toLowerCase(),
          capture_method: 'manual',
          customer: profile.stripe_customer_id as string,
          payment_method: profile.default_payment_method as string,
          // `off_session` tells the bank the cardholder isn't here, which is what
          // makes the saved consent from the SetupIntent count. `confirm` does it
          // in one call rather than handing a secret to a client that isn't
          // listening.
          off_session: true,
          confirm: true,
          metadata: { appointment_id: appt.id, user_id: user.id },
        },
        // Same key as the on-session path: a visit gets one authorisation,
        // whichever route creates it.
        `auth_${appt.id}`,
      );

      await admin.from('payments').upsert(
        {
          appointment_id: appt.id,
          user_id: user.id,
          amount: appt.price,
          currency: CURRENCY,
          method: 'stripe',
          status: pi.status === 'requires_capture' ? 'processing' : 'pending',
          stripe_payment_intent_id: pi.id,
        },
        { onConflict: 'appointment_id' },
      );
      return pi.status === 'requires_capture';
    } catch (err) {
      // `authentication_required` lands here and is the interesting one: the
      // card is fine, the bank just wants the patient present. /pay/:id can
      // recover it — createIntent reuses an intent in `requires_payment_method`
      // or `requires_confirmation`.
      const code = (err as Stripe.errors.StripeError)?.code ?? 'unknown';
      this.logger.log(
        `Off-session authorisation declined for ${appointmentId} (${code}) — falling back to the payment sheet.`,
      );
      return false;
    }
  }

  /**
   * Is the money for this visit actually held right now?
   *
   * Asks Stripe rather than reading our own `payments.status`, because this is
   * the check that decides whether a nurse gets dispatched — the one place worth
   * paying a round-trip for the authoritative answer. Our row can lag: the
   * webhook may not have landed yet, or may never land.
   *
   * `requires_capture` is precisely "the card is held and we can take it later".
   * Any other state — still collecting, failed, already captured, cancelled —
   * is not a live hold.
   */
  async isAuthorised(appointmentId: string): Promise<boolean> {
    if (!this.stripe.isEnabled) return false;
    const { data: payment } = await this.supabase
      .admin()
      .from('payments')
      .select('stripe_payment_intent_id')
      .eq('appointment_id', appointmentId)
      .maybeSingle();
    if (!payment?.stripe_payment_intent_id) return false;
    try {
      const pi = await this.stripe.retrievePaymentIntent(payment.stripe_payment_intent_id);
      return pi.status === 'requires_capture';
    } catch (err) {
      // Fail closed: if we can't prove the money is held, it isn't held.
      this.logger.error(`Authorisation check failed for ${appointmentId}`, err as Error);
      return false;
    }
  }

  /**
   * Take the authorised money once the visit is done. No-op (rather than an
   * error) when there's nothing to capture — a visit shouldn't fail to complete
   * because of a payment edge case.
   */
  async captureForAppointment(appointmentId: string): Promise<void> {
    if (!this.stripe.isEnabled) return;
    const admin = this.supabase.admin();
    const { data: payment } = await admin
      .from('payments')
      .select('id, user_id, stripe_payment_intent_id, status')
      .eq('appointment_id', appointmentId)
      .maybeSingle();
    if (!payment?.stripe_payment_intent_id) return;

    try {
      const pi = await this.stripe.retrievePaymentIntent(payment.stripe_payment_intent_id);
      if (pi.status !== 'requires_capture') return; // never authorised, or already taken

      // Record the outcome from the capture response rather than waiting on the
      // webhook. The webhook is the safety net, not the only path: if it never
      // arrives (misconfigured endpoint, retries exhausted) a captured payment
      // would otherwise sit at 'processing' forever while the money is gone.
      const captured = await this.stripe.capturePaymentIntent(pi.id);
      await this.settle(
        payment.id,
        payment.user_id,
        appointmentId,
        captured.status === 'succeeded' ? 'completed' : 'processing',
        (captured.latest_charge as string) ?? null,
      );
    } catch (err) {
      this.logger.error(`Capture failed for appointment ${appointmentId}`, err as Error);
    }
  }

  /**
   * Write a payment's terminal state and tell the patient — exactly once.
   *
   * Both the capture call and the webhook land here, and Stripe retries webhooks
   * on any non-2xx, so the `neq` guard is what stops a patient being notified
   * twice for one payment.
   */
  private async settle(
    paymentId: string,
    userId: string,
    appointmentId: string | null,
    status: 'completed' | 'processing',
    chargeId: string | null,
  ): Promise<void> {
    const admin = this.supabase.admin();
    const { data: changed } = await admin
      .from('payments')
      .update({ status, stripe_charge_id: chargeId })
      .eq('id', paymentId)
      .neq('status', status)
      .select('id')
      .maybeSingle();

    if (changed && status === 'completed') {
      await this.notifications.create(userId, {
        titleKey: 'notif.payment.title',
        messageKey: 'notif.payment.message',
        type: 'payment',
        priority: 'medium',
        related_payment: paymentId,
        related_appointment: appointmentId ?? undefined,
      });
    }
  }

  /**
   * Release or refund the money for a cancelled visit.
   *
   * Before capture (the usual case — cancelled while pending) the hold is voided
   * and the patient is never charged. After capture we refund in full.
   */
  async releaseForAppointment(appointmentId: string, reason?: string): Promise<void> {
    if (!this.stripe.isEnabled) return;
    const admin = this.supabase.admin();
    const { data: payment } = await admin
      .from('payments')
      .select('id, stripe_payment_intent_id, status, amount')
      .eq('appointment_id', appointmentId)
      .maybeSingle();
    if (!payment?.stripe_payment_intent_id) return;

    try {
      const pi = await this.stripe.retrievePaymentIntent(payment.stripe_payment_intent_id);

      if (pi.status === 'succeeded') {
        await this.stripe.createRefund(
          {
            payment_intent: pi.id,
            reason: 'requested_by_customer',
          },
          // Always the full amount, at most once per visit — so the appointment
          // id is a safe key. (The admin refund below is deliberately NOT keyed:
          // partial refunds are legitimately repeatable.)
          `refund_${appointmentId}`,
        );
        await admin
          .from('payments')
          .update({
            status: 'refunded',
            refund_amount: payment.amount,
            refund_reason: reason ?? 'Appointment cancelled',
            refunded_at: new Date().toISOString(),
          })
          .eq('id', payment.id);
        return;
      }

      if (['requires_capture', 'requires_payment_method', 'requires_confirmation'].includes(pi.status)) {
        await this.stripe.cancelPaymentIntent(pi.id, 'abandoned');
        await admin.from('payments').update({ status: 'cancelled' }).eq('id', payment.id);
      }
    } catch (err) {
      this.logger.error(`Release failed for appointment ${appointmentId}`, err as Error);
    }
  }

  /** Stripe webhook — the source of truth for payment success/failure. */
  async handleWebhook(signature: string, rawBody: Buffer) {
    let event: Stripe.Event;
    try {
      event = this.stripe.constructEvent(rawBody, signature);
    } catch (err) {
      throw new BadRequestException(`Webhook signature failed: ${(err as Error).message}`);
    }

    const admin = this.supabase.admin();

    // Claim the event before doing anything with it. Stripe retries on any
    // non-2xx and can redeliver out of order, so the same event arrives more
    // than once as a matter of course — this is the one guard that covers every
    // branch below, including the ones that will move money later.
    if (!(await this.claimEvent(event))) {
      return { received: true };
    }

    // Under manual capture, `succeeded` fires at CAPTURE (visit complete), not
    // when the patient finishes the sheet. The authorisation lands as
    // `amount_capturable_updated` — that's the event that means "card held".
    const statusByEvent: Record<string, 'processing' | 'completed' | 'failed' | 'cancelled'> = {
      'payment_intent.amount_capturable_updated': 'processing',
      'payment_intent.succeeded': 'completed',
      'payment_intent.payment_failed': 'failed',
      'payment_intent.canceled': 'cancelled',
    };

    const next = statusByEvent[event.type];
    if (next) {
      const pi = event.data.object as Stripe.PaymentIntent;
      const { data: payment } = await admin
        .from('payments')
        .select('id, user_id, appointment_id, status')
        .eq('stripe_payment_intent_id', pi.id)
        .maybeSingle();
      if (!payment) return { received: true }; // not ours; ack so Stripe stops retrying

      if (next === 'completed') {
        // Shared with the capture path so only one of them notifies.
        await this.settle(
          payment.id,
          payment.user_id,
          payment.appointment_id,
          'completed',
          (pi.latest_charge as string) ?? null,
        );
      } else {
        // Never walk a captured payment backwards: `succeeded` can arrive before
        // `amount_capturable_updated` if Stripe redelivers out of order.
        if (payment.status === 'completed' || payment.status === 'refunded') {
          return { received: true };
        }
        await admin
          .from('payments')
          .update({ status: next, stripe_charge_id: (pi.latest_charge as string) ?? null })
          .eq('id', payment.id);

        // The hold is now in place. Say so, and let appointments decide what it
        // means — this is the BACKSTOP for a request whose patient closed the app
        // between the payment sheet succeeding and confirm-payment landing.
        // Without it that request sits unfunded-looking forever while the money
        // is actually held, and no nurse is ever told the job exists.
        if (event.type === 'payment_intent.amount_capturable_updated' && payment.appointment_id) {
          // AWAITED, deliberately. `emit()` would dispatch and return, leaving an
          // async listener running while we reply to Stripe — and on a
          // serverless host the function can be frozen the moment the response
          // goes out, so the activation would silently never finish. Exactly the
          // kind of thing that works on a long-lived local process and not in
          // production. emitAsync settles every listener before we answer.
          //
          // The listener swallows its own errors, so this cannot turn a handled
          // webhook into a retried one.
          await this.events.emitAsync('payment.authorised', {
            appointmentId: payment.appointment_id as string,
          });
        }
      }
    } else if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const intentId =
        typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;
      if (intentId) {
        await admin
          .from('payments')
          .update({
            status: 'refunded',
            refund_amount: charge.amount_refunded / 100,
            refunded_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', intentId);
      }
    }
    return { received: true };
  }

  /**
   * Record this event id, and report whether WE are the ones who claimed it.
   *
   * The primary key does the arbitration — insert and inspect the conflict,
   * rather than read-then-write, which would race two concurrent redeliveries
   * into both believing they were first.
   *
   * Fails OPEN, unlike isAuthorised(): if the dedupe table itself is unreachable
   * we process the event anyway. Processing twice is recoverable (the handlers
   * are individually idempotent — `settle()` has its own `neq` guard); dropping
   * a payment event silently is not.
   */
  private async claimEvent(event: Stripe.Event): Promise<boolean> {
    const { error } = await this.supabase
      .admin()
      .from('stripe_events')
      .insert({ event_id: event.id, type: event.type });

    if (!error) return true;
    // 23505 = unique_violation: someone already handled this one.
    if ((error as { code?: string }).code === '23505') {
      this.logger.log(`Duplicate webhook ${event.type} (${event.id}) — skipped.`);
      return false;
    }
    this.logger.error(
      `Could not record webhook ${event.id}; processing it anyway`,
      error as unknown as Error,
    );
    return true;
  }

  async listTransactions(user: AuthUser) {
    const { data, error } = await this.supabase
      .forUser(user.token)
      .from('payments')
      .select('*, appointment:appointments(service:services(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async statistics() {
    // Admin dashboard aggregate — service-role, guarded by @Roles('admin').
    const { data, error } = await this.supabase
      .admin()
      .from('payments')
      .select('amount, status');
    if (error) throw error;
    const completed = data.filter((p) => p.status === 'completed');
    const revenue = completed.reduce((sum, p) => sum + Number(p.amount), 0);
    return { totalPayments: data.length, completed: completed.length, revenue };
  }

  async refund(dto: RefundDto) {
    if (!this.stripe.isEnabled) throw new BadRequestException('Payments not configured');
    const admin = this.supabase.admin();
    const { data: payment } = await admin
      .from('payments')
      .select('*')
      .eq('id', dto.payment_id)
      .maybeSingle();
    if (!payment) throw new NotFoundException('Payment not found');
    if (!payment.stripe_payment_intent_id) throw new BadRequestException('No Stripe charge');

    const refund = await this.stripe.createRefund({
      payment_intent: payment.stripe_payment_intent_id,
      amount: dto.amount ? Math.round(dto.amount * 100) : undefined,
    });

    await admin
      .from('payments')
      .update({
        status: 'refunded',
        refund_amount: dto.amount ?? payment.amount,
        refund_reason: dto.reason ?? null,
        refunded_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    return { success: true, refundId: refund.id };
  }
}

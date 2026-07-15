import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
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
  ) {}

  config() {
    return { publishableKey: this.stripe.publishableKey, enabled: this.stripe.isEnabled };
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
    // Authorised at request time, so `pending` is the normal case — the card is
    // held before a nurse commits to travelling. Terminal states can't be paid.
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
    const pi = await this.stripe.createPaymentIntent({
      amount: amountCents,
      currency: CURRENCY.toLowerCase(),
      // Hold the funds now, take them when the visit is done. Cancelling before
      // capture releases the hold outright — no charge, no refund, no fee.
      capture_method: 'manual',
      metadata: { appointment_id: appt.id, user_id: user.id },
      automatic_payment_methods: { enabled: true },
    });

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
        title: 'Payment received',
        message: 'Your visit has been paid. Thank you!',
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
        await this.stripe.createRefund({
          payment_intent: pi.id,
          reason: 'requested_by_customer',
        });
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

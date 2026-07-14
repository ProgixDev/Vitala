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
    if (!['confirmed', 'in-progress', 'completed'].includes(appt.status)) {
      throw new BadRequestException('Appointment must be confirmed before payment');
    }

    const { data: existing } = await admin
      .from('payments')
      .select('*')
      .eq('appointment_id', appt.id)
      .maybeSingle();

    if (existing?.status === 'completed') {
      throw new BadRequestException('Payment already completed');
    }
    // Reuse a still-payable intent.
    if (existing?.stripe_payment_intent_id) {
      const pi = await this.stripe.retrievePaymentIntent(existing.stripe_payment_intent_id);
      if (['requires_payment_method', 'requires_confirmation'].includes(pi.status)) {
        return { clientSecret: pi.client_secret, amount: existing.amount, currency: existing.currency };
      }
    }

    const amountCents = Math.round(Number(appt.price) * 100);
    const pi = await this.stripe.createPaymentIntent({
      amount: amountCents,
      currency: 'usd',
      metadata: { appointment_id: appt.id, user_id: user.id },
      automatic_payment_methods: { enabled: true },
    });

    await admin.from('payments').upsert(
      {
        appointment_id: appt.id,
        user_id: user.id,
        amount: appt.price,
        currency: 'USD',
        method: 'stripe',
        status: 'processing',
        stripe_payment_intent_id: pi.id,
      },
      { onConflict: 'appointment_id' },
    );

    return { clientSecret: pi.client_secret, amount: appt.price, currency: 'USD' };
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
    if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const status = event.type === 'payment_intent.succeeded' ? 'completed' : 'failed';
      const { data: payment } = await admin
        .from('payments')
        .update({
          status,
          stripe_charge_id: (pi.latest_charge as string) ?? null,
        })
        .eq('stripe_payment_intent_id', pi.id)
        .select('id, user_id, appointment_id')
        .maybeSingle();

      if (payment && status === 'completed') {
        await this.notifications.create(payment.user_id, {
          title: 'Payment received',
          message: 'Your payment was successful. Thank you!',
          type: 'payment',
          priority: 'medium',
          related_payment: payment.id,
          related_appointment: payment.appointment_id,
        });
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

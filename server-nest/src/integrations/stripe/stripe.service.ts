import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import type { Env } from '../../config/env';

/**
 * Thin wrapper around the Stripe SDK. Boots lazily and stays inert if no key is
 * configured yet (keys are handed over separately), so the app still runs.
 */
@Injectable()
export class StripeService {
  private readonly logger = new Logger('Stripe');
  private readonly client: Stripe | null;
  readonly webhookSecret: string;
  readonly publishableKey: string;

  constructor(private readonly config: ConfigService<Env, true>) {
    const key = this.config.get('STRIPE_SECRET_KEY', { infer: true });
    this.webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET', { infer: true });
    this.publishableKey = this.config.get('STRIPE_PUBLISHABLE_KEY', { infer: true });
    this.client = key ? new Stripe(key) : null;
    if (!this.client) {
      this.logger.warn('STRIPE_SECRET_KEY not set — payment endpoints are disabled.');
    }
  }

  get isEnabled(): boolean {
    return this.client !== null;
  }

  private get stripe(): Stripe {
    if (!this.client) {
      throw new Error('Stripe is not configured (missing STRIPE_SECRET_KEY).');
    }
    return this.client;
  }

  createPaymentIntent(params: Stripe.PaymentIntentCreateParams) {
    return this.stripe.paymentIntents.create(params);
  }

  retrievePaymentIntent(id: string) {
    return this.stripe.paymentIntents.retrieve(id);
  }

  createRefund(params: Stripe.RefundCreateParams) {
    return this.stripe.refunds.create(params);
  }

  /** Verifies a webhook signature and returns the typed event. */
  constructEvent(payload: Buffer | string, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
  }
}

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
    // Pinned deliberately: unpinned, an SDK bump silently moves the API version
    // under us and can change webhook payloads. Keep this in step with the
    // version configured on the webhook endpoint in the Stripe dashboard.
    //
    // Note what this option does and does not do: it sets `Stripe-Version` on
    // OUTGOING requests only. Incoming webhook payloads are built with the
    // WEBHOOK ENDPOINT's own `api_version`, which this cannot influence, and
    // constructEvent() verifies the signature without checking the version. So
    // if the endpoint's version drifts from the SDK's, our types describe one
    // shape while the JSON is another — no error, just a field that is silently
    // undefined. Aligning that is an endpoint-side fix, not a code-side one.
    //
    // The SDK also hard-pins this literal to its own bundled version, so it
    // cannot be lowered without a cast; the endpoint is what has to move.
    // KNOWN DRIFT (2026-07): endpoint is 2026-05-27.dahlia, this is
    // 2026-06-24.dahlia. See docs/monetics-design.md §9.3.
    this.client = key ? new Stripe(key, { apiVersion: '2026-06-24.dahlia' }) : null;
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

  /**
   * `idempotencyKey` is not optional in spirit — pass one for anything that
   * moves money. Without it a retried request (a redeploy mid-flight, a socket
   * reset, the SDK's own automatic retries) creates a SECOND intent and the
   * patient is authorised twice.
   *
   * Stripe honours a key for 24h only, so it protects the retry window and
   * nothing longer. Anything that must never happen twice for the life of a
   * visit needs a database constraint as well — see the `payouts` table's
   * unique(appointment_id) in docs/monetics-design.md §9.1.
   */
  createPaymentIntent(params: Stripe.PaymentIntentCreateParams, idempotencyKey?: string) {
    return this.stripe.paymentIntents.create(
      params,
      idempotencyKey ? { idempotencyKey } : undefined,
    );
  }

  retrievePaymentIntent(id: string) {
    return this.stripe.paymentIntents.retrieve(id);
  }

  /**
   * Take the money that was authorised at request time. Only valid while the
   * intent is `requires_capture`.
   */
  capturePaymentIntent(id: string) {
    return this.stripe.paymentIntents.capture(id);
  }

  /**
   * Release an authorisation without charging. This is the cancel path — the
   * patient's hold disappears and no refund (or fee) is involved.
   */
  cancelPaymentIntent(id: string, reason?: Stripe.PaymentIntentCancelParams.CancellationReason) {
    return this.stripe.paymentIntents.cancel(id, reason ? { cancellation_reason: reason } : undefined);
  }

  /** See createPaymentIntent on why the key matters — a double refund is real money. */
  createRefund(params: Stripe.RefundCreateParams, idempotencyKey?: string) {
    return this.stripe.refunds.create(params, idempotencyKey ? { idempotencyKey } : undefined);
  }

  /** Verifies a webhook signature and returns the typed event. */
  constructEvent(payload: Buffer | string, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
  }
}

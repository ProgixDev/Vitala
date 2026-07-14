import { Global, Module } from '@nestjs/common';
import { StripeService } from './stripe/stripe.service';
import { TwilioService } from './twilio/twilio.service';
import { EmailService } from './email/email.service';
import { PushService } from './push/push.service';

/** Shared, cross-cutting third-party clients. Global so any module can inject. */
@Global()
@Module({
  providers: [StripeService, TwilioService, EmailService, PushService],
  exports: [StripeService, TwilioService, EmailService, PushService],
})
export class IntegrationsModule {}

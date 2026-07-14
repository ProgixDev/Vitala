import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio, { Twilio } from 'twilio';
import type { Env } from '../../config/env';

/** SMS via Twilio. No-ops with a warning when unconfigured. */
@Injectable()
export class TwilioService {
  private readonly logger = new Logger('Twilio');
  private readonly client: Twilio | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService<Env, true>) {
    const sid = this.config.get('TWILIO_ACCOUNT_SID', { infer: true });
    const token = this.config.get('TWILIO_AUTH_TOKEN', { infer: true });
    this.from = this.config.get('TWILIO_PHONE_NUMBER', { infer: true });
    this.client = sid && token ? twilio(sid, token) : null;
    if (!this.client) this.logger.warn('Twilio not configured — SMS disabled.');
  }

  async sendSms(to: string, body: string): Promise<void> {
    if (!this.client) {
      this.logger.warn(`SMS skipped (unconfigured): to=${to}`);
      return;
    }
    try {
      await this.client.messages.create({ to, from: this.from, body });
    } catch (err) {
      this.logger.error(`Failed to send SMS to ${to}`, err as Error);
    }
  }
}

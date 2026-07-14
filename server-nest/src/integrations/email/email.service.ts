import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { Env } from '../../config/env';

/** Transactional email via SMTP. No-ops with a warning when unconfigured. */
@Injectable()
export class EmailService {
  private readonly logger = new Logger('Email');
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService<Env, true>) {
    const user = this.config.get('EMAIL_USER', { infer: true });
    const pass = this.config.get('EMAIL_PASSWORD', { infer: true });
    this.from = this.config.get('EMAIL_FROM', { infer: true });
    this.transporter =
      user && pass
        ? nodemailer.createTransport({
            host: this.config.get('EMAIL_HOST', { infer: true }),
            port: this.config.get('EMAIL_PORT', { infer: true }),
            secure: false,
            auth: { user, pass },
          })
        : null;
    if (!this.transporter) this.logger.warn('Email not configured — email disabled.');
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Email skipped (unconfigured): to=${to} subject="${subject}"`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err as Error);
    }
  }
}

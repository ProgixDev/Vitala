import { Injectable, Logger } from '@nestjs/common';
// TYPE-ONLY: erased at compile time, so it never becomes a require().
import type { Expo, ExpoPushMessage } from 'expo-server-sdk';

export interface PushItem {
  token: string | null | undefined;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface PushOptions {
  /** 'high' wakes the device promptly — use for incoming jobs and SOS. */
  priority?: 'default' | 'normal' | 'high';
  /** Android channel; must match one created client-side. */
  channelId?: string;
  /** Drop the push if undelivered after this long. */
  ttlSeconds?: number;
}

/** Expo push notifications. Safe to call with invalid/absent tokens. */
@Injectable()
export class PushService {
  private readonly logger = new Logger('Push');
  private sdk?: typeof import('expo-server-sdk');
  private expo?: Expo;

  /**
   * Load the SDK lazily, on first push.
   *
   * expo-server-sdk v6 is ESM-only ("type": "module") while this service
   * compiles to CommonJS, so a top-level `import` becomes `require()` — which
   * throws ERR_REQUIRE_ESM on any runtime that can't require an ES module.
   * Node 22.12+ can, which is exactly why this passed locally (Node 26) and
   * crashed the whole Vercel function on boot: every route 500'd because one
   * import in one service couldn't resolve.
   *
   * A dynamic import() is preserved by tsc under `module: nodenext` and works
   * on every runtime, so it doesn't depend on the host's Node version. Keep it
   * this way even if Vercel's Node is later bumped.
   */
  private async load(): Promise<{
    Expo: typeof import('expo-server-sdk').Expo;
    expo: Expo;
  }> {
    if (!this.sdk) {
      this.sdk = await import('expo-server-sdk');
      this.expo = new this.sdk.Expo();
    }
    return { Expo: this.sdk.Expo, expo: this.expo! };
  }

  async send(
    expoToken: string | null | undefined,
    title: string,
    body: string,
    data?: Record<string, unknown>,
    opts?: PushOptions,
  ): Promise<void> {
    await this.sendMany([expoToken], title, body, data, opts);
  }

  /**
   * Fan-out where every recipient shares the same payload.
   */
  async sendMany(
    expoTokens: (string | null | undefined)[],
    title: string,
    body: string,
    data?: Record<string, unknown>,
    opts?: PushOptions,
  ): Promise<void> {
    await this.sendEach(
      expoTokens.map((token) => ({ token, title, body, data })),
      opts,
    );
  }

  /**
   * Fan-out where each recipient needs a DIFFERENT payload (e.g. their own
   * notification id). Batched into chunks of 100 by the Expo SDK, so this is
   * one HTTP call per 100 devices rather than one per device.
   *
   * Never throws: a failed push must not fail the request that triggered it.
   */
  async sendEach(items: PushItem[], opts?: PushOptions): Promise<void> {
    let Expo: typeof import('expo-server-sdk').Expo;
    let expo: Expo;
    try {
      ({ Expo, expo } = await this.load());
    } catch (err) {
      // Same contract as the send failure below: a push must never break the
      // request that triggered it — least of all by failing to load.
      this.logger.error('Failed to load expo-server-sdk', err as Error);
      return;
    }

    const isExpoToken = (t: string | null | undefined): t is string =>
      !!t && Expo.isExpoPushToken(t);

    const seen = new Set<string>();
    const messages: ExpoPushMessage[] = [];
    for (const it of items) {
      if (!isExpoToken(it.token) || seen.has(it.token)) continue;
      seen.add(it.token);
      messages.push({
        to: it.token,
        sound: 'default',
        title: it.title,
        body: it.body,
        data: it.data ?? {},
        // Urgent jobs must wake the device; Android needs the matching channel.
        priority: opts?.priority ?? 'default',
        ...(opts?.channelId ? { channelId: opts.channelId } : {}),
        ...(opts?.ttlSeconds !== undefined ? { ttl: opts.ttlSeconds } : {}),
      });
    }
    if (!messages.length) {
      this.logger.warn('Push skipped — no valid Expo tokens.');
      return;
    }
    try {
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        tickets.forEach((ticket, i) => {
          if (ticket.status === 'error') {
            // DeviceNotRegistered means the token is dead — worth pruning, but
            // that needs a receipts pass we don't have yet. Log it for now.
            this.logger.warn(
              `Push rejected for ${chunk[i]?.to as string}: ${ticket.message}`,
            );
          }
        });
      }
    } catch (err) {
      this.logger.error('Failed to send push notifications', err as Error);
    }
  }
}

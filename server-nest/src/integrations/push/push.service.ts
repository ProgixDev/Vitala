import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

/** Expo push notifications. Safe to call with an invalid/absent token. */
@Injectable()
export class PushService {
  private readonly logger = new Logger('Push');
  private readonly expo = new Expo();

  async send(
    expoToken: string | null | undefined,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    if (!expoToken || !Expo.isExpoPushToken(expoToken)) {
      this.logger.warn('Push skipped — missing or invalid Expo token.');
      return;
    }
    const message: ExpoPushMessage = {
      to: expoToken,
      sound: 'default',
      title,
      body,
      data: data ?? {},
    };
    try {
      const chunks = this.expo.chunkPushNotifications([message]);
      for (const chunk of chunks) {
        await this.expo.sendPushNotificationsAsync(chunk);
      }
    } catch (err) {
      this.logger.error('Failed to send push notification', err as Error);
    }
  }
}

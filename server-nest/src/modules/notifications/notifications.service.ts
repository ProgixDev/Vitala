import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { PushService } from '../../integrations/push/push.service';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

export interface CreateNotification {
  title: string;
  message: string;
  type:
    | 'appointment'
    | 'payment'
    | 'message'
    | 'emergency'
    | 'system'
    | 'promotion'
    | 'verification';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  related_appointment?: string;
  related_payment?: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, unknown>;
}

/** Row shape for a notification insert. */
const rowFor = (userId: string, n: CreateNotification) => ({
  user_id: userId,
  title: n.title,
  message: n.message,
  type: n.type,
  priority: n.priority ?? 'medium',
  related_appointment: n.related_appointment ?? null,
  related_payment: n.related_payment ?? null,
  action_url: n.action_url ?? null,
  action_label: n.action_label ?? null,
  metadata: n.metadata ?? {},
});

/**
 * Payload the app reads on notification tap. The client routes off
 * `appointmentId`/`emergencyId`, so `related_appointment` must be surfaced
 * under that key or the tap dead-ends.
 */
const dataFor = (n: CreateNotification, notificationId: string) => ({
  notificationId,
  type: n.type,
  ...(n.related_appointment ? { appointmentId: n.related_appointment } : {}),
});

/** 'urgent' should wake the phone; everything else can wait for a poll. */
const pushOptsFor = (n: CreateNotification) =>
  n.priority === 'urgent'
    ? { priority: 'high' as const, channelId: 'jobs' }
    : { priority: 'default' as const };

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger('Notifications');

  constructor(
    private readonly supabase: SupabaseService,
    private readonly push: PushService,
  ) {}

  /**
   * Server-initiated notification for any user. Persists the row (service-role,
   * since we're writing to someone else's inbox) and fires a push if the user
   * has a token and push enabled.
   */
  async create(userId: string, n: CreateNotification) {
    const admin = this.supabase.admin();
    const { data, error } = await admin
      .from('notifications')
      .insert(rowFor(userId, n))
      .select()
      .single();
    if (error) throw error;

    const { data: settings } = await admin
      .from('user_settings')
      .select('notify_push, expo_push_token')
      .eq('profile_id', userId)
      .maybeSingle();
    if (settings?.notify_push && settings.expo_push_token) {
      await this.push.send(
        settings.expo_push_token,
        n.title,
        n.message,
        dataFor(n, data.id),
        pushOptsFor(n),
      );
    }
    return data;
  }

  /**
   * Same as create(), but for many recipients at once — one insert, one batched
   * push. Used to broadcast an open job to every on-duty nurse.
   *
   * Deliberately never throws: a broadcast is a side-effect of booking, and a
   * push failure must not fail the patient's appointment. Returns the number of
   * inbox rows written.
   */
  async createMany(userIds: string[], n: CreateNotification): Promise<number> {
    const ids = [...new Set(userIds)].filter(Boolean);
    if (!ids.length) return 0;

    const admin = this.supabase.admin();
    const { data, error } = await admin
      .from('notifications')
      .insert(ids.map((id) => rowFor(id, n)))
      .select('id, user_id');
    if (error) {
      this.logger.error('Broadcast insert failed', error as unknown as Error);
      return 0;
    }

    const { data: settings } = await admin
      .from('user_settings')
      .select('profile_id, notify_push, expo_push_token')
      .in('profile_id', ids);

    // Each recipient's push carries their OWN notificationId, so marking one
    // read from a tap doesn't touch somebody else's row.
    const byProfile = new Map(data.map((r) => [r.user_id, r.id]));
    await this.push.sendEach(
      (settings ?? [])
        .filter((s) => s.notify_push && s.expo_push_token)
        .map((s) => ({
          token: s.expo_push_token,
          title: n.title,
          body: n.message,
          data: dataFor(n, byProfile.get(s.profile_id) as string),
        })),
      pushOptsFor(n),
    );
    return data.length;
  }

  async list(user: AuthUser, unreadOnly = false) {
    let q = this.supabase
      .forUser(user.token)
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (unreadOnly) q = q.eq('is_read', false);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  }

  async markRead(user: AuthUser, id: string) {
    const { data, error } = await this.supabase
      .forUser(user.token)
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async markAllRead(user: AuthUser) {
    const { error } = await this.supabase
      .forUser(user.token)
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false);
    if (error) throw error;
    return { success: true };
  }

  async remove(user: AuthUser, id: string) {
    const { error } = await this.supabase
      .forUser(user.token)
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
    return { success: true };
  }
}

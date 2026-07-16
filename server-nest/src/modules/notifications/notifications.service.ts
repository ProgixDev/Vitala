import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { PushService } from '../../integrations/push/push.service';
import {
  DEFAULT_LANGUAGE,
  resolveLanguage,
  translate,
} from '../../i18n/messages';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

export interface CreateNotification {
  /**
   * Copy is passed as catalogue keys, not literals: each recipient is told in
   * their own language, and a broadcast can reach nurses who don't share one.
   * Resolved per recipient against `user_settings.language`.
   */
  titleKey: string;
  messageKey: string;
  /** Interpolated as-is — names, addresses, anything already in final form. */
  vars?: Record<string, string | number>;
  /**
   * Interpolated after being translated themselves. For values that are our own
   * vocabulary rather than the user's data — a status name, say — and so have to
   * follow the recipient into their language.
   */
  varKeys?: Record<string, string>;
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

/** The rendered copy for one recipient, in their language. */
interface Rendered {
  title: string;
  message: string;
}

const renderFor = (n: CreateNotification, lang: string): Rendered => {
  const vars: Record<string, string | number> = { ...n.vars };
  for (const [name, key] of Object.entries(n.varKeys ?? {})) {
    vars[name] = translate(lang, key);
  }
  return {
    title: translate(lang, n.titleKey, vars),
    message: translate(lang, n.messageKey, vars),
  };
};

/** Row shape for a notification insert. */
const rowFor = (userId: string, n: CreateNotification, text: Rendered) => ({
  user_id: userId,
  title: text.title,
  message: text.message,
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

    // Settings are read before the insert, not after: the inbox row stores
    // rendered text, so we need the recipient's language to write it.
    const { data: settings } = await admin
      .from('user_settings')
      .select('notify_push, expo_push_token, language')
      .eq('profile_id', userId)
      .maybeSingle();
    const text = renderFor(
      n,
      resolveLanguage(settings?.language as string | null),
    );

    const { data, error } = await admin
      .from('notifications')
      .insert(rowFor(userId, n, text))
      .select()
      .single();
    if (error) throw error;

    if (settings?.notify_push && settings.expo_push_token) {
      await this.push.send(
        settings.expo_push_token,
        text.title,
        text.message,
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

    // One broadcast, many languages: read everyone's language up front and
    // render each row on its own. A nurse with no settings row still gets the
    // notification, in the default language.
    const { data: settings } = await admin
      .from('user_settings')
      .select('profile_id, notify_push, expo_push_token, language')
      .in('profile_id', ids);
    const langOf = new Map(
      (settings ?? []).map((s) => [
        s.profile_id as string,
        resolveLanguage(s.language as string | null),
      ]),
    );
    const textOf = new Map(
      ids.map((id) => [id, renderFor(n, langOf.get(id) ?? DEFAULT_LANGUAGE)]),
    );

    const { data, error } = await admin
      .from('notifications')
      .insert(ids.map((id) => rowFor(id, n, textOf.get(id) as Rendered)))
      .select('id, user_id');
    if (error) {
      this.logger.error('Broadcast insert failed', error as unknown as Error);
      return 0;
    }

    // Each recipient's push carries their OWN notificationId, so marking one
    // read from a tap doesn't touch somebody else's row.
    const byProfile = new Map(data.map((r) => [r.user_id, r.id]));
    await this.push.sendEach(
      (settings ?? [])
        .filter((s) => s.notify_push && s.expo_push_token)
        .map((s) => {
          const profileId = s.profile_id as string;
          const text = textOf.get(profileId) as Rendered;
          return {
            token: s.expo_push_token,
            title: text.title,
            body: text.message,
            data: dataFor(n, byProfile.get(profileId) as string),
          };
        }),
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

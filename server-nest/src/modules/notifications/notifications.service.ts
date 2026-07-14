import { Injectable } from '@nestjs/common';
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

@Injectable()
export class NotificationsService {
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
      .insert({
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
      })
      .select()
      .single();
    if (error) throw error;

    const { data: settings } = await admin
      .from('user_settings')
      .select('notify_push, expo_push_token')
      .eq('profile_id', userId)
      .maybeSingle();
    if (settings?.notify_push && settings.expo_push_token) {
      await this.push.send(settings.expo_push_token, n.title, n.message, {
        notificationId: data.id,
        type: n.type,
      });
    }
    return data;
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

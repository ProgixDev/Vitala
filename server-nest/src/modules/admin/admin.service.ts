import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

/**
 * Admin-only reads/writes. Everything uses the service-role client because an
 * admin legitimately reads across all users; the controller is guarded by
 * @Roles('admin') so only admins reach it.
 */
@Injectable()
export class AdminService {
  constructor(private readonly supabase: SupabaseService) {}

  /** Dashboard home: headline counts + revenue. */
  async overview() {
    const db = this.supabase.admin();
    const [users, nurses, appts, payments] = await Promise.all([
      db.from('profiles').select('role', { count: 'exact', head: false }),
      db
        .from('nurse_profiles')
        .select('verification_status', { count: 'exact', head: false }),
      db.from('appointments').select('status', { count: 'exact', head: false }),
      db.from('payments').select('amount, status'),
    ]);

    const profiles = users.data ?? [];
    const revenue = (payments.data ?? [])
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totals: {
        users: profiles.length,
        patients: profiles.filter((p) => p.role === 'patient').length,
        nurses: profiles.filter((p) => p.role === 'nurse').length,
        appointments: (appts.data ?? []).length,
        revenue,
      },
      nursesByStatus: this.countBy(nurses.data ?? [], 'verification_status'),
      appointmentsByStatus: this.countBy(appts.data ?? [], 'status'),
    };
  }

  async listUsers(role?: string) {
    let q = this.supabase
      .admin()
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (role) q = q.eq('role', role);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  }

  async listNurses() {
    const { data, error } = await this.supabase
      .admin()
      .from('nurse_profiles')
      .select('*, profile:profiles!inner(id, full_name, phone, avatar_url, status, created_at)')
      .order('created_at', { ascending: false, foreignTable: 'profiles' });
    if (error) throw error;
    return data;
  }

  async listAppointments(status?: string) {
    let q = this.supabase
      .admin()
      .from('appointments')
      .select(
        '*, service:services(name), patient:profiles!appointments_patient_id_fkey(full_name), nurse:profiles!appointments_nurse_id_fkey(full_name)',
      )
      .order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  }

  async listPayments() {
    const { data, error } = await this.supabase
      .admin()
      .from('payments')
      .select('*, user:profiles!payments_user_id_fkey(full_name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  /** Approve or reject a nurse's verification, syncing profile.status. */
  async setNurseVerification(
    nurseId: string,
    decision: 'approved' | 'rejected',
    reason?: string,
  ) {
    const admin = this.supabase.admin();
    const { data, error } = await admin
      .from('nurse_profiles')
      .update({
        verification_status: decision,
        rejection_reason: decision === 'rejected' ? (reason ?? null) : null,
      })
      .eq('profile_id', nurseId)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('Nurse not found');

    await admin
      .from('profiles')
      .update({ status: decision === 'approved' ? 'active' : 'rejected' })
      .eq('id', nurseId);
    return data;
  }

  private countBy<T extends Record<string, unknown>>(rows: T[], key: keyof T) {
    return rows.reduce<Record<string, number>>((acc, r) => {
      const k = String(r[key]);
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});
  }
}

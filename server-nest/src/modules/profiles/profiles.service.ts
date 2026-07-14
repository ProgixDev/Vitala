import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import {
  UpdateAvailabilityDto,
  UpdateMedicalDto,
  UpdateNurseDto,
  UpdateProfileDto,
  UpdateSettingsDto,
  UpsertLocationDto,
} from './dto/profile.dto';

/**
 * All reads/writes go through a per-request RLS-scoped client, so the database
 * itself guarantees a user can only touch their own rows.
 */
@Injectable()
export class ProfilesService {
  constructor(private readonly supabase: SupabaseService) {}

  /** Full "me" payload: profile + role-specific data + settings + locations. */
  async getMe(user: AuthUser) {
    const db = this.supabase.forUser(user.token);
    const { data: profile, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (error) throw error;
    if (!profile) throw new NotFoundException('Profile not found');

    const [settings, locations, medical, nurse] = await Promise.all([
      db.from('user_settings').select('*').eq('profile_id', user.id).maybeSingle(),
      db.from('locations').select('*').eq('profile_id', user.id),
      user.role === 'patient'
        ? db.from('medical_profiles').select('*').eq('profile_id', user.id).maybeSingle()
        : Promise.resolve({ data: null }),
      user.role === 'nurse'
        ? db.from('nurse_profiles').select('*').eq('profile_id', user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    return {
      ...profile,
      settings: settings.data,
      locations: locations.data ?? [],
      medicalProfile: medical.data,
      nurseProfile: nurse.data,
    };
  }

  async updateProfile(user: AuthUser, dto: UpdateProfileDto) {
    const db = this.supabase.forUser(user.token);
    const { data, error } = await db
      .from('profiles')
      .update(dto)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateMedical(user: AuthUser, dto: UpdateMedicalDto) {
    const db = this.supabase.forUser(user.token);
    const { data, error } = await db
      .from('medical_profiles')
      .update(dto)
      .eq('profile_id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateNurse(user: AuthUser, dto: UpdateNurseDto) {
    const db = this.supabase.forUser(user.token);
    const { data, error } = await db
      .from('nurse_profiles')
      .update(dto)
      .eq('profile_id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /** The nurse's weekly availability slots, ordered for display. */
  async getAvailability(user: AuthUser) {
    const db = this.supabase.forUser(user.token);
    const { data, error } = await db
      .from('nurse_availability')
      .select('*')
      .eq('nurse_id', user.id)
      .order('weekday', { ascending: true })
      .order('start_time', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  /** Replace the nurse's whole weekly availability set in one call. */
  async updateAvailability(user: AuthUser, dto: UpdateAvailabilityDto) {
    const db = this.supabase.forUser(user.token);
    const del = await db.from('nurse_availability').delete().eq('nurse_id', user.id);
    if (del.error) throw del.error;
    if (dto.slots.length === 0) return [];
    const rows = dto.slots.map((s) => ({
      nurse_id: user.id,
      weekday: s.weekday,
      start_time: s.start_time,
      end_time: s.end_time,
    }));
    const { data, error } = await db.from('nurse_availability').insert(rows).select();
    if (error) throw error;
    return data ?? [];
  }

  async updateSettings(user: AuthUser, dto: UpdateSettingsDto) {
    const db = this.supabase.forUser(user.token);
    const { data, error } = await db
      .from('user_settings')
      .update(dto)
      .eq('profile_id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async listLocations(user: AuthUser) {
    const db = this.supabase.forUser(user.token);
    const { data, error } = await db.from('locations').select('*').eq('profile_id', user.id);
    if (error) throw error;
    return data;
  }

  async addLocation(user: AuthUser, dto: UpsertLocationDto) {
    const db = this.supabase.forUser(user.token);
    const { data, error } = await db
      .from('locations')
      .insert({ ...dto, profile_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateLocation(user: AuthUser, id: string, dto: UpsertLocationDto) {
    const db = this.supabase.forUser(user.token);
    const { data, error } = await db
      .from('locations')
      .update(dto)
      .eq('id', id)
      .eq('profile_id', user.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('Location not found');
    return data;
  }

  async deleteLocation(user: AuthUser, id: string) {
    const db = this.supabase.forUser(user.token);
    const { error } = await db
      .from('locations')
      .delete()
      .eq('id', id)
      .eq('profile_id', user.id);
    if (error) throw error;
    return { success: true };
  }

  /** Public: browse verified, active nurses (used by the booking flow). */
  async listNurses() {
    const { data, error } = await this.supabase
      .admin()
      .from('nurse_profiles')
      .select('*, profile:profiles!inner(id, full_name, avatar_url, status)')
      .eq('verification_status', 'approved')
      .eq('profile.status', 'active');
    if (error) throw error;
    return data;
  }
}

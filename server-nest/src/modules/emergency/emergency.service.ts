import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { TwilioService } from '../../integrations/twilio/twilio.service';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateEmergencyDto, UpsertContactDto } from './dto/emergency.dto';

@Injectable()
export class EmergencyService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly twilio: TwilioService,
  ) {}

  /** Raise an SOS. For family-alerts, text every saved emergency contact. */
  async raise(user: AuthUser, dto: CreateEmergencyDto) {
    const db = this.supabase.forUser(user.token);
    const { data, error } = await db
      .from('emergency_requests')
      .insert({
        patient_id: user.id,
        type: dto.type,
        appointment_id: dto.appointment_id ?? null,
        description: dto.description,
        address: dto.address ?? null,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
      })
      .select()
      .single();
    if (error) throw error;

    if (dto.type === 'family-alert') {
      await this.alertFamily(user, dto);
    }
    return data;
  }

  async status(user: AuthUser, id: string) {
    const { data, error } = await this.supabase
      .forUser(user.token)
      .from('emergency_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('Emergency request not found');
    return data;
  }

  async listMine(user: AuthUser) {
    const { data, error } = await this.supabase
      .forUser(user.token)
      .from('emergency_requests')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  private async alertFamily(user: AuthUser, dto: CreateEmergencyDto) {
    const { data: contacts } = await this.supabase
      .forUser(user.token)
      .from('emergency_contacts')
      .select('name, phone')
      .eq('profile_id', user.id);
    const where = dto.address ? ` near ${dto.address}` : '';
    await Promise.all(
      (contacts ?? []).map((c) =>
        this.twilio.sendSms(
          c.phone,
          `Vitala emergency alert: your contact needs help${where}. ${dto.description}`,
        ),
      ),
    );
  }

  // -------- emergency contacts CRUD --------
  async listContacts(user: AuthUser) {
    const { data, error } = await this.supabase
      .forUser(user.token)
      .from('emergency_contacts')
      .select('*')
      .eq('profile_id', user.id);
    if (error) throw error;
    return data;
  }

  async addContact(user: AuthUser, dto: UpsertContactDto) {
    const { data, error } = await this.supabase
      .forUser(user.token)
      .from('emergency_contacts')
      .insert({ ...dto, profile_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateContact(user: AuthUser, id: string, dto: UpsertContactDto) {
    const { data, error } = await this.supabase
      .forUser(user.token)
      .from('emergency_contacts')
      .update(dto)
      .eq('id', id)
      .eq('profile_id', user.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('Contact not found');
    return data;
  }

  async deleteContact(user: AuthUser, id: string) {
    const { error } = await this.supabase
      .forUser(user.token)
      .from('emergency_contacts')
      .delete()
      .eq('id', id)
      .eq('profile_id', user.id);
    if (error) throw error;
    return { success: true };
  }
}

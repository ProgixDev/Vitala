import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import {
  AppointmentStatus,
  CreateAppointmentDto,
  NurseLocationDto,
  UpdateStatusDto,
} from './dto/appointment.dto';

/**
 * Legal status transitions. The old server let any status jump to any other;
 * here the state-machine is explicit and enforced, keyed by who is acting.
 */
const TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ['confirmed', 'declined', 'cancelled'],
  confirmed: ['on-the-way', 'cancelled'],
  'on-the-way': ['in-progress', 'cancelled'],
  'in-progress': ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  declined: [],
};

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly notifications: NotificationsService,
  ) {}

  private db(user: AuthUser) {
    return this.supabase.forUser(user.token);
  }

  /** Patient books. Price is copied from the service (never trusted from client). */
  async create(user: AuthUser, dto: CreateAppointmentDto) {
    const { data: service, error: svcErr } = await this.supabase
      .admin()
      .from('services')
      .select('id, price, duration_min')
      .eq('id', dto.service_id)
      .maybeSingle();
    if (svcErr) throw svcErr;
    if (!service) throw new BadRequestException('Unknown service');

    const { data, error } = await this.db(user)
      .from('appointments')
      .insert({
        patient_id: user.id,
        nurse_id: dto.nurse_id ?? null,
        service_id: dto.service_id,
        appointment_type: dto.appointment_type ?? 'normal',
        scheduled_date: dto.scheduled_date,
        scheduled_start: dto.scheduled_start,
        scheduled_end: dto.scheduled_end ?? null,
        address: dto.address,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        location_label: dto.location_label ?? null,
        symptoms: dto.symptoms ?? null,
        notes: dto.notes ?? null,
        price: service.price,
        duration_min: service.duration_min,
      })
      .select()
      .single();
    if (error) throw error;

    if (dto.nurse_id) {
      await this.notifications.create(dto.nurse_id, {
        title: 'New appointment request',
        message: 'A patient has requested you for an appointment.',
        type: 'appointment',
        priority: 'high',
        related_appointment: data.id,
      });
    }
    return data;
  }

  /** Role-aware listing: patients see theirs, nurses see assigned + open pool. */
  async list(user: AuthUser, status?: AppointmentStatus) {
    let query = this.db(user)
      .from('appointments')
      .select('*, service:services(name, category), nurse:profiles!appointments_nurse_id_fkey(full_name, avatar_url)')
      .order('scheduled_date', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /** Open pool of unassigned pending jobs (nurses only, enforced by RLS too). */
  async unassigned(user: AuthUser) {
    if (user.role !== 'nurse') throw new ForbiddenException('Nurses only');
    const { data, error } = await this.db(user)
      .from('appointments')
      .select('*, service:services(name, category)')
      .is('nurse_id', null)
      .eq('status', 'pending')
      .order('scheduled_date');
    if (error) throw error;
    return data;
  }

  async findOne(user: AuthUser, id: string) {
    const { data, error } = await this.db(user)
      .from('appointments')
      .select('*, service:services(*), payment:payments(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('Appointment not found');
    return data;
  }

  /** A nurse claims an open job. */
  async assignSelf(user: AuthUser, id: string) {
    if (user.role !== 'nurse') throw new ForbiddenException('Nurses only');
    const appt = await this.findOne(user, id);
    if (appt.nurse_id) throw new BadRequestException('Already assigned');

    const { data, error } = await this.db(user)
      .from('appointments')
      .update({ nurse_id: user.id, status: 'confirmed' })
      .eq('id', id)
      .is('nurse_id', null)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new BadRequestException('Appointment was just taken');

    await this.notifications.create(appt.patient_id, {
      title: 'Nurse assigned',
      message: 'A nurse has accepted your appointment.',
      type: 'appointment',
      priority: 'high',
      related_appointment: id,
    });
    return data;
  }

  /** Status transition with state-machine + role checks + side-effects. */
  async updateStatus(user: AuthUser, id: string, dto: UpdateStatusDto) {
    const appt = await this.findOne(user, id);
    const current = appt.status as AppointmentStatus;

    if (!TRANSITIONS[current].includes(dto.status)) {
      throw new BadRequestException(
        `Cannot move appointment from "${current}" to "${dto.status}"`,
      );
    }
    this.assertActorAllowed(user, appt, dto.status);

    const patch: Record<string, unknown> = { status: dto.status };
    if (dto.status === 'completed') {
      patch.completed_at = new Date().toISOString();
      patch.completion_notes = dto.completion_notes ?? null;
    }
    if (dto.status === 'cancelled' || dto.status === 'declined') {
      patch.cancellation_reason = dto.reason ?? null;
      patch.cancelled_by = user.id;
      patch.cancelled_at = new Date().toISOString();
    }

    const { data, error } = await this.db(user)
      .from('appointments')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    // Notify the counterparty.
    const notify = user.id === appt.patient_id ? appt.nurse_id : appt.patient_id;
    if (notify) {
      await this.notifications.create(notify, {
        title: 'Appointment updated',
        message: `Appointment is now "${dto.status}".`,
        type: 'appointment',
        priority: 'medium',
        related_appointment: id,
      });
    }
    return data;
  }

  /** Live nurse-location ping (broadcast via Supabase Realtime on the row). */
  async updateNurseLocation(user: AuthUser, id: string, dto: NurseLocationDto) {
    if (user.role !== 'nurse') throw new ForbiddenException('Nurses only');
    const { data, error } = await this.db(user)
      .from('appointments')
      .update({
        nurse_lat: dto.latitude,
        nurse_lng: dto.longitude,
        nurse_loc_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('nurse_id', user.id)
      .select('id, nurse_lat, nurse_lng, nurse_loc_at')
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('Appointment not found');
    return data;
  }

  private assertActorAllowed(
    user: AuthUser,
    appt: { patient_id: string; nurse_id: string | null },
    next: AppointmentStatus,
  ) {
    const isPatient = user.id === appt.patient_id;
    const isNurse = user.id === appt.nurse_id;
    if (user.role === 'admin') return;
    // Patients may cancel; nurses drive the fulfilment lifecycle.
    if (next === 'cancelled' && (isPatient || isNurse)) return;
    if (['confirmed', 'declined', 'on-the-way', 'in-progress', 'completed'].includes(next)) {
      if (!isNurse) throw new ForbiddenException('Only the assigned nurse can do that');
      return;
    }
    if (!isPatient && !isNurse) throw new ForbiddenException('Not a participant');
  }
}

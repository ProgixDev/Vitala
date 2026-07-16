import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentsService } from '../payments/payments.service';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import {
  AppointmentStatus,
  CreateAppointmentDto,
  NurseLocationDto,
  UpdateStatusDto,
} from './dto/appointment.dto';

/** The slice of a profile we're willing to show a nurse before they accept. */
export interface PersonRef {
  full_name: string;
  avatar_url: string | null;
}

/** The columns of `appointments` this service reads back after a write. */
interface AppointmentRow {
  id: string;
  patient_id: string;
  nurse_id: string | null;
  address: string;
  location_label: string | null;
  appointment_type: string;
  status: AppointmentStatus;
}

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

/**
 * Which statuses have copy written for the patient's eyes. Keyed by the status
 * being entered; the strings themselves live in the i18n catalogue, since the
 * patient may read them in either language.
 *
 * 'confirmed' is here because a hand-picked nurse confirms through updateStatus
 * rather than assignSelf — without it that patient gets the generic fallback.
 */
const PATIENT_STATUS_COPY: AppointmentStatus[] = [
  'confirmed',
  'on-the-way',
  'in-progress',
  'completed',
  'cancelled',
  'declined',
];

/**
 * Price for a patient-chosen duration, scaled from the service's base rate.
 *
 * Rounded to whole cents so the figure the patient authorises on their card is
 * exactly the figure stored on the appointment. Falls back to the flat price if
 * a service somehow has no base duration, rather than dividing by zero.
 */
function proRataPrice(basePrice: number, baseMinutes: number, minutes: number): number {
  if (!baseMinutes || baseMinutes <= 0) return basePrice;
  return Math.round(basePrice * (minutes / baseMinutes) * 100) / 100;
}

/** "10:30" + 90 -> "12:00". Wraps past midnight rather than overflowing. */
function endTime(start: string, minutes: number): string {
  const [h, m] = start.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return start;
  const total = (h * 60 + m + minutes) % (24 * 60);
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger('Appointments');

  constructor(
    private readonly supabase: SupabaseService,
    private readonly notifications: NotificationsService,
    private readonly payments: PaymentsService,
  ) {}

  private db(user: AuthUser) {
    return this.supabase.forUser(user.token);
  }

  /**
   * Profile ids of nurses currently taking work. `is_online` is the duty toggle
   * the nurse flips in the app; we also require an approved, active account so a
   * pending or suspended nurse is never offered a job.
   */
  private async onDutyNurseIds(): Promise<string[]> {
    const { data, error } = await this.supabase
      .admin()
      .from('nurse_profiles')
      .select('profile_id, profiles!inner(status)')
      .eq('is_online', true)
      .eq('verification_status', 'approved')
      .eq('profiles.status', 'active');
    if (error) throw error;
    return (data ?? []).map((r) => r.profile_id as string);
  }

  /**
   * Attach the patient's name/photo to open-pool rows.
   *
   * Deliberately NOT a PostgREST join: RLS gives nurses no read on patient
   * profiles (profiles_nurse_public covers nurse rows only), and adding one
   * would expose every column on the row — including the patient's phone —
   * since the client picks the column list. So we look the patients up with the
   * service-role client and hand back exactly two fields.
   */
  private async withPatients<T extends { patient_id: string }>(
    rows: T[],
  ): Promise<(T & { patient: PersonRef | null })[]> {
    if (!rows.length) return [];
    const ids = [...new Set(rows.map((r) => r.patient_id))];
    const { data, error } = await this.supabase
      .admin()
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', ids);
    if (error) throw error;
    const byId = new Map(
      (data ?? []).map((p) => [
        p.id as string,
        { full_name: p.full_name as string, avatar_url: p.avatar_url as string | null },
      ]),
    );
    return rows.map((r) => ({ ...r, patient: byId.get(r.patient_id) ?? null }));
  }

  /**
   * Display name for notification copy, or null if we haven't got one — the
   * caller supplies a translatable stand-in, since a hardcoded fallback would
   * put an English phrase inside a French sentence.
   */
  private async nameOf(profileId: string): Promise<string | null> {
    const { data } = await this.supabase
      .admin()
      .from('profiles')
      .select('full_name')
      .eq('id', profileId)
      .maybeSingle();
    return (data?.full_name as string) || null;
  }

  /**
   * Patient books. Price is always derived server-side from the service and the
   * requested duration — never taken from the client, which is why the DTO has
   * no price field at all.
   */
  async create(user: AuthUser, dto: CreateAppointmentDto) {
    const { data: service, error: svcErr } = await this.supabase
      .admin()
      .from('services')
      .select('id, name, price, duration_min')
      .eq('id', dto.service_id)
      .maybeSingle();
    if (svcErr) throw svcErr;
    if (!service) throw new BadRequestException('Unknown service');

    const duration = dto.duration_min ?? (service.duration_min as number);
    const price = proRataPrice(
      Number(service.price),
      service.duration_min as number,
      duration,
    );

    const { data, error } = await this.db(user)
      .from('appointments')
      .insert({
        patient_id: user.id,
        nurse_id: dto.nurse_id ?? null,
        service_id: dto.service_id,
        appointment_type: dto.appointment_type ?? 'normal',
        scheduled_date: dto.scheduled_date,
        scheduled_start: dto.scheduled_start,
        address: dto.address,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        location_label: dto.location_label ?? null,
        symptoms: dto.symptoms ?? null,
        notes: dto.notes ?? null,
        price,
        duration_min: duration,
        scheduled_end: dto.scheduled_end ?? endTime(dto.scheduled_start, duration),
      })
      .select()
      .single();
    if (error) throw error;

    await this.announce(data, service.name as string);
    return data;
  }

  /**
   * Tell nurses a new job exists. A hand-picked nurse gets it directly;
   * otherwise it goes to everyone on duty, first-come-first-served.
   *
   * Never throws — the patient's booking already succeeded by this point, and a
   * push failure must not turn that into an error response.
   */
  private async announce(appt: AppointmentRow, serviceName: string) {
    const urgent = appt.appointment_type === 'emergency';
    const n = {
      titleKey: urgent ? 'notif.job.emergencyTitle' : 'notif.job.title',
      messageKey: 'notif.job.message',
      vars: { service: serviceName, place: appt.location_label || appt.address },
      type: 'appointment' as const,
      // 'urgent' is what makes the push wake the device (see pushOptsFor).
      priority: urgent ? ('urgent' as const) : ('high' as const),
      related_appointment: appt.id,
    };
    try {
      if (appt.nurse_id) {
        await this.notifications.create(appt.nurse_id, {
          ...n,
          messageKey: 'notif.job.direct',
        });
        return;
      }
      const nurses = await this.onDutyNurseIds();
      const sent = await this.notifications.createMany(nurses, n);
      this.logger.log(
        `Job ${appt.id} announced to ${sent}/${nurses.length} on-duty nurses.`,
      );
    } catch (err) {
      this.logger.error(`Failed to announce job ${appt.id}`, err as Error);
    }
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

    const rows = (data ?? []) as unknown as { patient_id: string }[];
    return user.role === 'patient' ? rows : this.withPatients(rows);
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

    // Jobs this nurse already passed on stay in the pool for everyone else, but
    // must never be shown to them again. RLS scopes the read to their own rows.
    const { data: passed, error: passErr } = await this.db(user)
      .from('appointment_declines')
      .select('appointment_id');
    if (passErr) throw passErr;
    const skip = new Set((passed ?? []).map((d) => d.appointment_id as string));

    return this.withPatients(
      (data ?? []).filter((a) => !skip.has(a.id as string)),
    );
  }

  /**
   * A nurse passes on an open job. This is per-nurse: the appointment stays
   * pending and every other on-duty nurse still sees it. Distinct from the
   * `declined` status, which is terminal and only the assigned nurse may set.
   */
  async pass(user: AuthUser, id: string) {
    if (user.role !== 'nurse') throw new ForbiddenException('Nurses only');
    const appt = await this.findOne(user, id);
    if (appt.nurse_id)
      throw new BadRequestException('That job is already assigned');

    const { error } = await this.db(user)
      .from('appointment_declines')
      .upsert(
        { appointment_id: id, nurse_id: user.id },
        { onConflict: 'appointment_id,nurse_id' },
      );
    if (error) throw error;
    return { passed: true };
  }

  async findOne(user: AuthUser, id: string) {
    const { data, error } = await this.db(user)
      .from('appointments')
      .select(
        '*, service:services(*), payment:payments(*), review:reviews(id, rating, comment, created_at), nurse:profiles!appointments_nurse_id_fkey(full_name, avatar_url)',
      )
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('Appointment not found');
    return data;
  }

  /**
   * findOne plus the patient reference. Kept separate so the internal callers
   * (assignSelf/pass/updateStatus) don't pay for the admin profile lookup.
   */
  async detail(user: AuthUser, id: string) {
    const appt = await this.findOne(user, id);
    if (user.role === 'patient') return appt;
    const [withPatient] = await this.withPatients([
      appt as unknown as { patient_id: string },
    ]);
    return withPatient;
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

    const nurseName = await this.nameOf(user.id);
    await this.notifications.create(appt.patient_id, {
      titleKey: 'notif.confirmed.title',
      messageKey: 'notif.confirmed.message',
      ...(nurseName
        ? { vars: { nurse: nurseName } }
        : { varKeys: { nurse: 'notif.confirmed.fallbackNurse' } }),
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

    // Money follows the visit. Both of these swallow their own errors: the
    // status change has already been written, and a Stripe hiccup must not turn
    // a completed visit into a failed request.
    if (dto.status === 'completed') {
      await this.payments.captureForAppointment(id);
    } else if (dto.status === 'cancelled' || dto.status === 'declined') {
      await this.payments.releaseForAppointment(id, dto.reason);
    }

    // Notify the counterparty. When the nurse drives the change the patient gets
    // the tailored copy; a patient-driven change (only ever a cancel) falls back
    // to the generic line, since that copy is written for the patient's eyes.
    const notify = user.id === appt.patient_id ? appt.nurse_id : appt.patient_id;
    if (notify) {
      const tailored =
        notify === appt.patient_id && PATIENT_STATUS_COPY.includes(dto.status);
      await this.notifications.create(notify, {
        titleKey: tailored
          ? `notif.status.${dto.status}.title`
          : 'notif.status.fallback.title',
        messageKey: tailored
          ? `notif.status.${dto.status}.message`
          : 'notif.status.fallback.message',
        // The fallback names the status in words; the raw enum is ours, not theirs.
        varKeys: { status: `status.name.${dto.status}` },
        type: 'appointment',
        // Arrival and cancellation are the ones worth interrupting for.
        priority:
          dto.status === 'on-the-way' || dto.status === 'cancelled'
            ? 'high'
            : 'medium',
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

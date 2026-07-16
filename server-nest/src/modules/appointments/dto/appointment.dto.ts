import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export const APPOINTMENT_STATUSES = [
  'awaiting_payment',
  'pending',
  'confirmed',
  'on-the-way',
  'in-progress',
  'completed',
  'cancelled',
  'declined',
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/**
 * Statuses a client may ask for through PUT /appointments/:id/status.
 *
 * `awaiting_payment` is deliberately absent: it is the state a request is born
 * in, and it is left only by the server once Stripe confirms the hold (see
 * AppointmentsService.activateIfAuthorised). Letting a client name it directly
 * would be a way to hand itself a live job without paying.
 */
export const REQUESTABLE_STATUSES = APPOINTMENT_STATUSES.filter(
  (s) => s !== 'awaiting_payment',
);

/** Bounds for a patient-chosen visit length. */
export const MIN_DURATION_MIN = 15;
export const MAX_DURATION_MIN = 480; // 8h — beyond this it isn't a home visit

/**
 * How far ahead a visit may be booked.
 *
 * This is NOT a product preference — it is bounded by Stripe. A request is
 * authorised (`capture_method: 'manual'`) when it is made, and Stripe voids an
 * uncaptured authorisation after ~7 days. The money must still be capturable
 * when the visit happens, so the booking horizon has to stay inside the hold's
 * lifetime. 6 days leaves a day of slack for a late-running visit.
 *
 * Until now this held only by accident: the app's day strip is built with
 * `nextDays(7)` (app-mobile/app/booking/[id].tsx), so nothing further out could
 * be picked. Nothing connected that constant to Stripe's expiry, and nothing
 * enforced it server-side — a "let patients book a month ahead" change would
 * have silently started dispatching nurses against dead holds, with no error
 * pointing anywhere near payments.
 *
 * RAISING THIS REQUIRES the T-48h re-authorisation job first: keep a card on
 * file at booking, authorise ~48h before the visit, cancel + notify if that
 * fails. See docs/monetics-design.md §4.
 */
export const MAX_BOOKING_LEAD_DAYS = 6;

export class CreateAppointmentDto {
  @IsUUID() service_id!: string;
  @IsOptional() @IsUUID() nurse_id?: string;
  @IsOptional() @IsIn(['normal', 'emergency']) appointment_type?: string;
  @IsString() scheduled_date!: string; // YYYY-MM-DD
  @IsString() scheduled_start!: string; // HH:mm
  @IsOptional() @IsString() scheduled_end?: string;
  /**
   * How long the patient wants. Price is recomputed pro-rata from this on the
   * server — the client's own estimate is never trusted. Must be a multiple of
   * 5 so it lines up with the picker.
   */
  @IsOptional()
  @IsInt()
  @Min(MIN_DURATION_MIN)
  @Max(MAX_DURATION_MIN)
  duration_min?: number;
  @IsString() address!: string;
  /**
   * Required, not optional — coordinates are load-bearing three times over: the
   * nurse's in-app turn-by-turn falls back to an external maps hand-off without
   * them (app/appointment/[id].tsx), the arrival geofence can't verify a nurse
   * is where she says she is, and a dispute has no location evidence.
   *
   * They were optional, and `dto.latitude ?? null` meant a request that simply
   * omitted them was accepted in silence — which is how visits ended up in the
   * database with a null position and no way to route to them.
   */
  @IsNumber() @Min(-90) @Max(90) latitude!: number;
  @IsNumber() @Min(-180) @Max(180) longitude!: number;
  @IsOptional() @IsString() location_label?: string;
  @IsOptional() @IsString() symptoms?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateStatusDto {
  @IsIn(REQUESTABLE_STATUSES) status!: AppointmentStatus;
  @IsOptional() @IsString() reason?: string;
  @IsOptional() @IsString() completion_notes?: string;
}

export class NurseLocationDto {
  @IsNumber() latitude!: number;
  @IsNumber() longitude!: number;
}

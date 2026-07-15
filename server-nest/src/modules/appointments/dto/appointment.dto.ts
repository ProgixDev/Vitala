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
  'pending',
  'confirmed',
  'on-the-way',
  'in-progress',
  'completed',
  'cancelled',
  'declined',
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Bounds for a patient-chosen visit length. */
export const MIN_DURATION_MIN = 15;
export const MAX_DURATION_MIN = 480; // 8h — beyond this it isn't a home visit

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
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
  @IsOptional() @IsString() location_label?: string;
  @IsOptional() @IsString() symptoms?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateStatusDto {
  @IsIn(APPOINTMENT_STATUSES) status!: AppointmentStatus;
  @IsOptional() @IsString() reason?: string;
  @IsOptional() @IsString() completion_notes?: string;
}

export class NurseLocationDto {
  @IsNumber() latitude!: number;
  @IsNumber() longitude!: number;
}

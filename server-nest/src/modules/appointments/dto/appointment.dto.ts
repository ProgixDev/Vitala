import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
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

export class CreateAppointmentDto {
  @IsUUID() service_id!: string;
  @IsOptional() @IsUUID() nurse_id?: string;
  @IsOptional() @IsIn(['normal', 'emergency']) appointment_type?: string;
  @IsString() scheduled_date!: string; // YYYY-MM-DD
  @IsString() scheduled_start!: string; // HH:mm
  @IsOptional() @IsString() scheduled_end?: string;
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

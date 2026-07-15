import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { SERVICE_CATEGORIES } from '../../services/dto/service.dto';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional() @IsString() full_name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() avatar_url?: string;
}

export class UpdateMedicalDto {
  @IsOptional() @IsIn(['male', 'female', 'other']) gender?: string;
  @IsOptional() @IsString() date_of_birth?: string;
  @IsOptional() @IsString() blood_type?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) allergies?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) chronic_illnesses?: string[];
  @IsOptional() @IsNumber() height_cm?: number;
  @IsOptional() @IsNumber() weight_kg?: number;
}

export class UpdateNurseDto {
  @IsOptional() @IsString() license_number?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) specializations?: string[];
  @IsOptional() @IsNumber() experience_years?: number;
  @IsOptional() @IsString() id_doc_front_url?: string;
  @IsOptional() @IsString() id_doc_back_url?: string;
  @IsOptional() @IsString() selfie_url?: string;
  @IsOptional() @IsBoolean() is_online?: boolean;

  // ---- open-pool job filters ----
  /** Only offer jobs within this many km. */
  @IsOptional() @IsInt() @Min(1) @Max(200) max_radius_km?: number;
  /**
   * Service categories the nurse wants offered; empty means all. Validated
   * against the canonical slugs — unlike `specializations` above, which is
   * free-text and consequently holds a mix of labels and slugs.
   */
  @IsOptional()
  @IsArray()
  @IsIn(SERVICE_CATEGORIES, { each: true })
  job_categories?: string[];
}

export class AvailabilitySlotDto {
  @IsInt() @Min(0) @Max(6) weekday!: number; // 0 = Sunday
  @IsString() start_time!: string; // HH:mm
  @IsString() end_time!: string; // HH:mm
}

export class UpdateAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  slots!: AvailabilitySlotDto[];
}

export class UpsertLocationDto {
  @IsOptional() @IsString() label?: string;
  @IsString() address!: string;
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
  @IsOptional() @IsBoolean() is_default?: boolean;
}

export class UpdateSettingsDto {
  @IsOptional() @IsBoolean() notify_push?: boolean;
  @IsOptional() @IsBoolean() notify_email?: boolean;
  @IsOptional() @IsBoolean() notify_sms?: boolean;
  @IsOptional() @IsBoolean() share_location?: boolean;
  @IsOptional() @IsString() language?: string;
  @IsOptional() @IsBoolean() dark_mode?: boolean;
  @IsOptional() @IsBoolean() biometric_auth?: boolean;
  @IsOptional() @IsString() expo_push_token?: string;
}

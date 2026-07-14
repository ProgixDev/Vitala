import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEmergencyDto {
  @IsIn(['nurse-alert', 'ambulance', 'family-alert'])
  type!: 'nurse-alert' | 'ambulance' | 'family-alert';

  @IsString() description!: string;
  @IsOptional() @IsUUID() appointment_id?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
}

export class UpsertContactDto {
  @IsString() name!: string;
  @IsIn(['spouse', 'parent', 'child', 'sibling', 'friend', 'guardian', 'other'])
  relationship!: string;
  @IsString() phone!: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() address?: string;
  @IsOptional() notes?: string;
  @IsOptional() is_primary?: boolean;
}

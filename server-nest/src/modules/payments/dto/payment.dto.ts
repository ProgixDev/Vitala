import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateIntentDto {
  @IsUUID() appointment_id!: string;
}

export class RefundDto {
  @IsUUID() payment_id!: string;
  @IsOptional() @IsNumber() @Min(0) amount?: number;
  @IsOptional() @IsString() reason?: string;
}

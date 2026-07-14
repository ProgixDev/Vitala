import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsUUID() appointment_id!: string;
  @IsInt() @Min(1) @Max(5) rating!: number;
  @IsOptional() @IsString() comment?: string;
  @IsOptional() @IsInt() @Min(1) @Max(5) professionalism?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) punctuality?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) communication?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) care_quality?: number;
}

export class NurseResponseDto {
  @IsString() nurse_response!: string;
}

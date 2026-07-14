import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export const SERVICE_CATEGORIES = [
  'general-care',
  'wound-care',
  'elderly-care',
  'post-surgery',
  'medication-administration',
  'vital-monitoring',
  'emergency',
  'other',
] as const;

export class CreateServiceDto {
  @IsString() name!: string;
  @IsString() description!: string;
  @IsIn(SERVICE_CATEGORIES) category!: (typeof SERVICE_CATEGORIES)[number];
  @IsNumber() @Min(0) price!: number;
  @IsOptional() @IsNumber() @Min(1) duration_min?: number;
  @IsOptional() @IsBoolean() is_available?: boolean;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() image_url?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) requirements?: string[];
}

export class UpdateServiceDto extends CreateServiceDto {}

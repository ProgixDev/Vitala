import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateIntentDto {
  @IsUUID() appointment_id!: string;
}

export class RefundDto {
  @IsUUID() payment_id!: string;
  @IsOptional() @IsNumber() @Min(0) amount?: number;
  @IsOptional() @IsString() reason?: string;
}

export class SaveCardDto {
  /**
   * The SetupIntent the client just completed (seti_...). Only an identifier —
   * the server re-reads it from Stripe and trusts nothing the client says about
   * the outcome, so naming someone else's intent gets a 403, not a card.
   */
  @IsString() setup_intent_id!: string;
}

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateIntentDto, RefundDto } from './dto/payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Public()
  @Get('config')
  config() {
    return this.payments.config();
  }

  @Post('create-intent')
  createIntent(@CurrentUser() user: AuthUser, @Body() dto: CreateIntentDto) {
    return this.payments.createIntent(user, dto);
  }

  @Get('transactions')
  transactions(@CurrentUser() user: AuthUser) {
    return this.payments.listTransactions(user);
  }

  @Roles('admin')
  @Get('statistics')
  statistics() {
    return this.payments.statistics();
  }

  @Roles('admin')
  @Post('refund')
  refund(@Body() dto: RefundDto) {
    return this.payments.refund(dto);
  }

  /**
   * Stripe webhook. Public (Stripe can't send a bearer token) but authenticated
   * by signature verification against the raw request body.
   */
  @Public()
  @Post('webhook')
  webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: FastifyRequest & { rawBody?: Buffer },
  ) {
    if (!signature || !req.rawBody) {
      throw new BadRequestException('Missing Stripe signature or body');
    }
    return this.payments.handleWebhook(signature, req.rawBody);
  }
}

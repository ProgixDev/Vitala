import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  // Payments follow the visit's lifecycle: capture on completion, release on
  // cancellation.
  imports: [NotificationsModule, PaymentsModule],
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}

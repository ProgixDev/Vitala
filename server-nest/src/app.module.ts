import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { validateEnv } from './config/env';
import { SupabaseModule } from './supabase/supabase.module';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HealthController } from './health.controller';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ServicesModule } from './modules/services/services.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmergencyModule } from './modules/emergency/emergency.module';
import { AdminModule } from './modules/admin/admin.module';
import { StorageModule } from './modules/storage/storage.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    // Lets payments tell appointments "this visit's card is now held" without
    // the two modules depending on each other. Appointments already depends on
    // payments (capture on completion, release on cancel); making payments
    // depend back would need forwardRef and a circular graph. An event keeps the
    // arrow pointing one way — payments states a fact, appointments decides what
    // it means. Delivery is in-process and best-effort: it is a BACKSTOP, never
    // the only path (see AppointmentsService.activateIfAuthorised).
    EventEmitterModule.forRoot(),
    SupabaseModule,
    IntegrationsModule,
    StorageModule,
    ProfilesModule,
    ServicesModule,
    AppointmentsModule,
    PaymentsModule,
    ReviewsModule,
    NotificationsModule,
    EmergencyModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [
    // Auth first (populates req.user), then role enforcement. Global by default;
    // routes opt out with @Public().
    { provide: APP_GUARD, useClass: SupabaseAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

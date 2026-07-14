import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators/roles.decorator';

class VerifyNurseDto {
  @IsIn(['approved', 'rejected']) decision!: 'approved' | 'rejected';
  @IsOptional() @IsString() reason?: string;
}

@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('overview')
  overview() {
    return this.admin.overview();
  }

  @Get('users')
  users(@Query('role') role?: string) {
    return this.admin.listUsers(role);
  }

  @Get('nurses')
  nurses() {
    return this.admin.listNurses();
  }

  @Get('appointments')
  appointments(@Query('status') status?: string) {
    return this.admin.listAppointments(status);
  }

  @Get('payments')
  payments() {
    return this.admin.listPayments();
  }

  @Put('nurses/:id/verify')
  verifyNurse(@Param('id') id: string, @Body() dto: VerifyNurseDto) {
    return this.admin.setNurseVerification(id, dto.decision, dto.reason);
  }
}

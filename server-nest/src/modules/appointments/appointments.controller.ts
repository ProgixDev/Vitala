import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import {
  CreateAppointmentDto,
  NurseLocationDto,
  UpdateStatusDto,
} from './dto/appointment.dto';
import type { AppointmentStatus } from './dto/appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAppointmentDto) {
    return this.appointments.create(user, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('status') status?: AppointmentStatus) {
    return this.appointments.list(user, status);
  }

  @Get('unassigned')
  unassigned(@CurrentUser() user: AuthUser) {
    return this.appointments.unassigned(user);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.appointments.findOne(user, id);
  }

  @Put(':id/assign-self')
  assignSelf(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.appointments.assignSelf(user, id);
  }

  /** Pass on an open job: hides it from this nurse, leaves it in the pool. */
  @Put(':id/pass')
  pass(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.appointments.pass(user, id);
  }

  @Put(':id/status')
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.appointments.updateStatus(user, id, dto);
  }

  @Put(':id/location')
  updateLocation(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: NurseLocationDto,
  ) {
    return this.appointments.updateNurseLocation(user, id, dto);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  UpdateAvailabilityDto,
  UpdateMedicalDto,
  UpdateNurseDto,
  UpdateProfileDto,
  UpdateSettingsDto,
  UpsertLocationDto,
} from './dto/profile.dto';

@Controller()
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.profiles.getMe(user);
  }

  @Put('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.profiles.updateProfile(user, dto);
  }

  @Roles('patient')
  @Put('me/medical')
  updateMedical(@CurrentUser() user: AuthUser, @Body() dto: UpdateMedicalDto) {
    return this.profiles.updateMedical(user, dto);
  }

  @Roles('nurse')
  @Put('me/nurse')
  updateNurse(@CurrentUser() user: AuthUser, @Body() dto: UpdateNurseDto) {
    return this.profiles.updateNurse(user, dto);
  }

  @Roles('nurse')
  @Get('me/availability')
  getAvailability(@CurrentUser() user: AuthUser) {
    return this.profiles.getAvailability(user);
  }

  @Roles('nurse')
  @Put('me/availability')
  updateAvailability(@CurrentUser() user: AuthUser, @Body() dto: UpdateAvailabilityDto) {
    return this.profiles.updateAvailability(user, dto);
  }

  @Put('me/settings')
  updateSettings(@CurrentUser() user: AuthUser, @Body() dto: UpdateSettingsDto) {
    return this.profiles.updateSettings(user, dto);
  }

  @Get('me/locations')
  listLocations(@CurrentUser() user: AuthUser) {
    return this.profiles.listLocations(user);
  }

  @Post('me/locations')
  addLocation(@CurrentUser() user: AuthUser, @Body() dto: UpsertLocationDto) {
    return this.profiles.addLocation(user, dto);
  }

  @Put('me/locations/:id')
  updateLocation(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpsertLocationDto,
  ) {
    return this.profiles.updateLocation(user, id, dto);
  }

  @Delete('me/locations/:id')
  deleteLocation(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.profiles.deleteLocation(user, id);
  }

  @Public()
  @Get('nurses')
  listNurses() {
    return this.profiles.listNurses();
  }
}

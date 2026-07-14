import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateEmergencyDto, UpsertContactDto } from './dto/emergency.dto';

@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergency: EmergencyService) {}

  @Post()
  raise(@CurrentUser() user: AuthUser, @Body() dto: CreateEmergencyDto) {
    return this.emergency.raise(user, dto);
  }

  @Get()
  listMine(@CurrentUser() user: AuthUser) {
    return this.emergency.listMine(user);
  }

  @Get('status/:id')
  status(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.emergency.status(user, id);
  }

  // ---- emergency contacts ----
  @Get('contacts')
  listContacts(@CurrentUser() user: AuthUser) {
    return this.emergency.listContacts(user);
  }

  @Post('contacts')
  addContact(@CurrentUser() user: AuthUser, @Body() dto: UpsertContactDto) {
    return this.emergency.addContact(user, dto);
  }

  @Put('contacts/:id')
  updateContact(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpsertContactDto,
  ) {
    return this.emergency.updateContact(user, id, dto);
  }

  @Delete('contacts/:id')
  deleteContact(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.emergency.deleteContact(user, id);
  }
}

import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateReviewDto, NurseResponseDto } from './dto/review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Roles('patient')
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user, dto);
  }

  @Public()
  @Get('nurse/:nurseId')
  listForNurse(@Param('nurseId') nurseId: string) {
    return this.reviews.listForNurse(nurseId);
  }

  @Roles('nurse')
  @Put(':id/respond')
  respond(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: NurseResponseDto,
  ) {
    return this.reviews.respond(user, id, dto);
  }
}

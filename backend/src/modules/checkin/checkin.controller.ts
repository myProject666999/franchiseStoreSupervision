import { Controller, Get, Post, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { QueryCheckinDto } from './dto/query-checkin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('checkins')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post()
  @Roles('admin', 'area_manager', 'supervisor')
  create(@Body() createCheckinDto: CreateCheckinDto, @Request() req) {
    return this.checkinService.create(createCheckinDto, req.user.id);
  }

  @Get()
  @Roles('admin', 'area_manager', 'supervisor')
  findAll(@Query() queryCheckinDto: QueryCheckinDto) {
    return this.checkinService.findAll(queryCheckinDto);
  }

  @Get(':id')
  @Roles('admin', 'area_manager', 'supervisor')
  findOne(@Param('id') id: string) {
    return this.checkinService.findOne(+id);
  }
}

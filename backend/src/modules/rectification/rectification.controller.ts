import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { RectificationService } from './rectification.service';
import { SubmitRectificationDto } from './dto/submit-rectification.dto';
import { RecheckRectificationDto } from './dto/recheck-rectification.dto';
import { QueryRectificationDto } from './dto/query-rectification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('rectifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RectificationController {
  constructor(private readonly rectificationService: RectificationService) {}

  @Get()
  @Roles('admin', 'supervisor', 'store_manager', 'area_manager')
  findAll(@Query() queryDto: QueryRectificationDto) {
    return this.rectificationService.findAll(queryDto);
  }

  @Get(':id')
  @Roles('admin', 'supervisor', 'store_manager', 'area_manager')
  findOne(@Param('id') id: string) {
    return this.rectificationService.findOne(+id);
  }

  @Post(':id/submit')
  @Roles('admin', 'store_manager', 'supervisor')
  submitRectification(@Param('id') id: string, @Body() submitDto: SubmitRectificationDto, @Request() req) {
    return this.rectificationService.submitRectification(+id, submitDto, req.user.id);
  }

  @Post(':id/recheck')
  @Roles('admin', 'supervisor', 'area_manager')
  recheck(@Param('id') id: string, @Body() recheckDto: RecheckRectificationDto, @Request() req) {
    return this.rectificationService.recheck(+id, recheckDto, req.user.id);
  }
}

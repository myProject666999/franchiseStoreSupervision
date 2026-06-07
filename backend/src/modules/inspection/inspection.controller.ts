import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { InspectionService } from './inspection.service';
import { CreateInspectionReportDto } from './dto/create-inspection-report.dto';
import { SubmitInspectionReportDto } from './dto/submit-inspection-report.dto';
import { QueryInspectionReportDto } from './dto/query-inspection-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('inspections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InspectionController {
  constructor(private readonly inspectionService: InspectionService) {}

  @Post()
  @Roles('admin', 'supervisor')
  create(@Body() createDto: CreateInspectionReportDto, @Request() req) {
    return this.inspectionService.create(createDto, req.user.id);
  }

  @Put(':id')
  @Roles('admin', 'supervisor')
  updateDraft(@Param('id') id: string, @Body() updateDto: Partial<CreateInspectionReportDto>) {
    return this.inspectionService.updateDraft(+id, updateDto);
  }

  @Post(':id/submit')
  @Roles('admin', 'supervisor')
  submit(@Param('id') id: string, @Body() submitDto: SubmitInspectionReportDto, @Request() req) {
    return this.inspectionService.submit(+id, submitDto, req.user.id);
  }

  @Get()
  @Roles('admin', 'supervisor', 'store_manager', 'area_manager')
  findAll(@Query() queryDto: QueryInspectionReportDto) {
    return this.inspectionService.findAll(queryDto);
  }

  @Get(':id')
  @Roles('admin', 'supervisor', 'store_manager', 'area_manager')
  findOne(@Param('id') id: string) {
    return this.inspectionService.findOne(+id);
  }

  @Post(':id/confirm')
  @Roles('admin', 'area_manager')
  confirm(@Param('id') id: string, @Request() req) {
    return this.inspectionService.confirm(+id, req.user.id);
  }
}

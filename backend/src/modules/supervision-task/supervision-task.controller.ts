import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { SupervisionTaskService } from './supervision-task.service';
import { CreateSupervisionTaskDto } from './dto/create-supervision-task.dto';
import { UpdateSupervisionTaskDto } from './dto/update-supervision-task.dto';
import { QuerySupervisionTaskDto } from './dto/query-supervision-task.dto';
import { AssignStoresDto } from './dto/assign-stores.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('supervision-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupervisionTaskController {
  constructor(private readonly supervisionTaskService: SupervisionTaskService) {}

  @Post()
  @Roles('admin', 'area_manager')
  create(@Body() createSupervisionTaskDto: CreateSupervisionTaskDto, @Request() req) {
    return this.supervisionTaskService.create(createSupervisionTaskDto, req.user.id);
  }

  @Get('my-tasks')
  @Roles('admin', 'area_manager', 'supervisor')
  getMyTasks(@Request() req, @Query() querySupervisionTaskDto: QuerySupervisionTaskDto) {
    return this.supervisionTaskService.findMyTasks(req.user.id, querySupervisionTaskDto);
  }

  @Get()
  @Roles('admin', 'area_manager', 'supervisor')
  findAll(@Query() querySupervisionTaskDto: QuerySupervisionTaskDto) {
    return this.supervisionTaskService.findAll(querySupervisionTaskDto);
  }

  @Get(':id')
  @Roles('admin', 'area_manager', 'supervisor')
  findOne(@Param('id') id: string) {
    return this.supervisionTaskService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin', 'area_manager')
  update(@Param('id') id: string, @Body() updateSupervisionTaskDto: UpdateSupervisionTaskDto) {
    return this.supervisionTaskService.update(+id, updateSupervisionTaskDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.supervisionTaskService.remove(+id);
  }

  @Post(':id/stores')
  @Roles('admin', 'area_manager')
  assignStores(@Param('id') id: string, @Body() assignStoresDto: AssignStoresDto) {
    return this.supervisionTaskService.assignStores(+id, assignStoresDto);
  }

  @Patch(':id/status')
  @Roles('admin', 'area_manager', 'supervisor')
  changeStatus(@Param('id') id: string, @Body() changeStatusDto: ChangeStatusDto) {
    return this.supervisionTaskService.changeStatus(+id, changeStatusDto);
  }
}

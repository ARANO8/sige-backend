import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RegistroHorasService } from './registro-horas.service';
import { CreateRegistroHorasDto } from './dto/create-registro-horas.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('RRHH - Registro de Horas')
@Controller('registro-horas')
export class RegistroHorasController {
  constructor(private service: RegistroHorasService) {}

  @Post() @Roles('ADMINISTRADOR') @ApiOperation({ summary: 'Registrar horas trabajadas' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateRegistroHorasDto) { return this.service.create(idEmpresa, dto); }

  @Get() @Roles('ADMINISTRADOR') @ApiOperation({ summary: 'Listar registros de horas' })
  @ApiQuery({ name: 'idEmpleado', required: false })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string, @Query('idEmpleado') idEmpleado?: string) {
    return this.service.findAll(idEmpresa, idEmpleado);
  }
}

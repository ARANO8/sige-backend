import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmpleadoService } from './empleado.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('RRHH - Empleados')
@Controller('empleado')
export class EmpleadoController {
  constructor(private service: EmpleadoService) {}

  @Post() @Roles('ADMINISTRADOR') @ApiOperation({ summary: 'Crear empleado' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateEmpleadoDto) { return this.service.create(idEmpresa, dto); }

  @Get() @Roles('ADMINISTRADOR', 'GERENTE') @ApiOperation({ summary: 'Listar empleados' })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string) { return this.service.findAll(idEmpresa); }

  @Get(':id') @Roles('ADMINISTRADOR') @ApiOperation({ summary: 'Obtener empleado' })
  findOne(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) { return this.service.findOne(id, idEmpresa); }

  @Delete(':id') @Roles('ADMINISTRADOR') @ApiOperation({ summary: 'Eliminar empleado' })
  remove(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) { return this.service.remove(id, idEmpresa); }
}

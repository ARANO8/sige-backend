import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TurnoService } from './turno.service';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('RRHH - Turnos')
@Controller('turno')
export class TurnoController {
  constructor(private service: TurnoService) {}

  @Post() @Roles('ADMINISTRADOR') @ApiOperation({ summary: 'Crear turno' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateTurnoDto) { return this.service.create(idEmpresa, dto); }

  @Get() @Roles('ADMINISTRADOR') @ApiOperation({ summary: 'Listar turnos' })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string) { return this.service.findAll(idEmpresa); }

  @Delete(':id') @Roles('ADMINISTRADOR') @ApiOperation({ summary: 'Eliminar turno' })
  remove(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) { return this.service.remove(id, idEmpresa); }
}

import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CargoService } from './cargo.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('RRHH - Cargos')
@Controller('cargo')
export class CargoController {
  constructor(private service: CargoService) {}

  @Post() @Roles('ADMINISTRADOR') @ApiOperation({ summary: 'Crear cargo' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateCargoDto) { return this.service.create(idEmpresa, dto); }

  @Get() @Roles('ADMINISTRADOR') @ApiOperation({ summary: 'Listar cargos' })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string) { return this.service.findAll(idEmpresa); }

  @Get(':id') @Roles('ADMINISTRADOR') @ApiOperation({ summary: 'Obtener cargo' })
  findOne(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) { return this.service.findOne(id, idEmpresa); }

  @Delete(':id') @Roles('ADMINISTRADOR') @ApiOperation({ summary: 'Eliminar cargo' })
  remove(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) { return this.service.remove(id, idEmpresa); }
}

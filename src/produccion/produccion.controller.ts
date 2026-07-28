import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProduccionService } from './produccion.service';
import { CreateOrdenProduccionDto } from './dto/create-orden-produccion.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Órdenes de Producción')
@Controller('produccion')
export class ProduccionController {
  constructor(private service: ProduccionService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'JEFE_PRODUCCION')
  @ApiOperation({ summary: 'Crear orden de producción' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateOrdenProduccionDto) {
    return this.service.create(idEmpresa, dto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'JEFE_PRODUCCION', 'GERENTE')
  @ApiOperation({ summary: 'Listar órdenes de producción' })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.findAll(idEmpresa);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'JEFE_PRODUCCION')
  @ApiOperation({ summary: 'Obtener OP con consumos y producción terminada' })
  findOne(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.findOne(id, idEmpresa);
  }

  @Patch(':id/finalizar')
  @Roles('ADMINISTRADOR', 'JEFE_PRODUCCION')
  @ApiOperation({ summary: 'Finalizar OP: descuenta MP, ingresa PT, actualiza stock automáticamente' })
  finalizar(
    @Param('id') id: string,
    @CurrentUser('idEmpresa') idEmpresa: string,
    @Body('cantidadProducida') cantidadProducida?: number,
  ) {
    return this.service.finalizar(id, idEmpresa, cantidadProducida);
  }

  @Patch(':id/cancelar')
  @Roles('ADMINISTRADOR', 'JEFE_PRODUCCION')
  @ApiOperation({ summary: 'Cancelar orden de producción' })
  cancelar(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.cancelar(id, idEmpresa);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar OP (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.remove(id, idEmpresa);
  }
}

import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdenCompraService } from './orden-compra.service';
import { CreateOrdenCompraDto } from './dto/create-orden-compra.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Órdenes de Compra')
@Controller('orden-compra')
export class OrdenCompraController {
  constructor(private service: OrdenCompraService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_COMPRAS')
  @ApiOperation({ summary: 'Crear orden de compra con detalles' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateOrdenCompraDto) {
    return this.service.create(idEmpresa, dto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_COMPRAS', 'GERENTE')
  @ApiOperation({ summary: 'Listar órdenes de compra' })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.findAll(idEmpresa);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'RESPONSABLE_COMPRAS')
  @ApiOperation({ summary: 'Obtener OC con detalles y recepciones' })
  findOne(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.findOne(id, idEmpresa);
  }

  @Patch(':id/aprobar')
  @Roles('ADMINISTRADOR', 'RESPONSABLE_COMPRAS')
  @ApiOperation({ summary: 'Aprobar orden de compra' })
  aprobar(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.aprobar(id, idEmpresa);
  }

  @Patch(':id/recibir')
  @Roles('ADMINISTRADOR', 'RESPONSABLE_COMPRAS')
  @ApiOperation({ summary: 'Recibir OC: ingresa MP al inventario automáticamente' })
  recibir(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.recibir(id, idEmpresa);
  }

  @Patch(':id/cancelar')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Cancelar orden de compra' })
  cancelar(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.cancelar(id, idEmpresa);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar OC (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.remove(id, idEmpresa);
  }
}

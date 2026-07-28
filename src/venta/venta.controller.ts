import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Ventas')
@Controller('venta')
export class VentaController {
  constructor(private service: VentaService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_VENTAS')
  @ApiOperation({ summary: 'Crear venta: verifica stock, descuenta inventario, genera factura automáticamente' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateVentaDto) {
    return this.service.create(idEmpresa, dto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_VENTAS', 'GERENTE', 'CONTADOR')
  @ApiOperation({ summary: 'Listar ventas' })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string) { return this.service.findAll(idEmpresa); }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'RESPONSABLE_VENTAS')
  @ApiOperation({ summary: 'Obtener venta con detalles y factura' })
  findOne(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) { return this.service.findOne(id, idEmpresa); }

  @Patch(':id/anular')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Anular venta' })
  anular(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) { return this.service.anular(id, idEmpresa); }
}

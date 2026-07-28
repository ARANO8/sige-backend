import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MovimientoInventarioService } from './movimiento-inventario.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Movimientos de Inventario')
@Controller('movimiento-inventario')
export class MovimientoInventarioController {
  constructor(private service: MovimientoInventarioService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS')
  @ApiOperation({ summary: 'Registrar movimiento (entrada/salida/ajuste) - actualiza stock automáticamente' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateMovimientoDto) {
    return this.service.create(idEmpresa, dto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS', 'JEFE_PRODUCCION', 'GERENTE')
  @ApiOperation({ summary: 'Listar movimientos de inventario' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @CurrentUser('idEmpresa') idEmpresa: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll(idEmpresa, Number(page) || 1, Number(limit) || 50);
  }
}

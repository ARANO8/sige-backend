import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Stock')
@Controller('stock')
export class StockController {
  constructor(private service: StockService) {}

  @Get()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS', 'JEFE_PRODUCCION', 'RESPONSABLE_VENTAS')
  @ApiOperation({ summary: 'Consultar stock' })
  @ApiQuery({ name: 'idAlmacen', required: false })
  @ApiQuery({ name: 'idProducto', required: false })
  @ApiQuery({ name: 'idMateriaPrima', required: false })
  async findAll(
    @CurrentUser('idEmpresa') idEmpresa: string,
    @Query('idAlmacen') idAlmacen?: string,
    @Query('idProducto') idProducto?: string,
    @Query('idMateriaPrima') idMateriaPrima?: string,
  ) {
    if (idAlmacen) return this.service.findByAlmacen(idEmpresa, idAlmacen);
    if (idProducto) return this.service.findByProducto(idEmpresa, idProducto);
    if (idMateriaPrima) return this.service.findByMateriaPrima(idEmpresa, idMateriaPrima);
    return [];
  }
}

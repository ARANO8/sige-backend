import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Productos')
@Controller('producto')
export class ProductoController {
  constructor(private service: ProductoService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS')
  @ApiOperation({ summary: 'Crear producto terminado' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateProductoDto) {
    return this.service.create(idEmpresa, dto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS', 'RESPONSABLE_VENTAS', 'JEFE_PRODUCCION')
  @ApiOperation({ summary: 'Listar productos' })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.findAll(idEmpresa);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS', 'RESPONSABLE_VENTAS')
  @ApiOperation({ summary: 'Obtener producto con stock' })
  findOne(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.findOne(id, idEmpresa);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS')
  @ApiOperation({ summary: 'Actualizar producto' })
  update(
    @Param('id') id: string,
    @CurrentUser('idEmpresa') idEmpresa: string,
    @Body() dto: Partial<CreateProductoDto>,
  ) {
    return this.service.update(id, idEmpresa, dto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar producto (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.remove(id, idEmpresa);
  }
}

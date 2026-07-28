import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BomService } from './bom.service';
import { CreateBomDto } from './dto/create-bom.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('BOM - Listas de Materiales')
@Controller('bom')
export class BomController {
  constructor(private service: BomService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'JEFE_PRODUCCION')
  @ApiOperation({ summary: 'Crear BOM (lista de materiales) con versionado automático' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateBomDto) {
    return this.service.create(idEmpresa, dto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'JEFE_PRODUCCION', 'RESPONSABLE_INVENTARIOS')
  @ApiOperation({ summary: 'Listar BOMs' })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.findAll(idEmpresa);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'JEFE_PRODUCCION')
  @ApiOperation({ summary: 'Obtener BOM con detalles' })
  findOne(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.findOne(id, idEmpresa);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar BOM (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.remove(id, idEmpresa);
  }
}

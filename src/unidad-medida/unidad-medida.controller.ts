import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UnidadMedidaService } from './unidad-medida.service';
import { CreateUnidadMedidaDto } from './dto/create-unidad-medida.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Unidades de Medida')
@Controller('unidad-medida')
export class UnidadMedidaController {
  constructor(private service: UnidadMedidaService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS')
  @ApiOperation({ summary: 'Crear unidad de medida' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateUnidadMedidaDto) {
    return this.service.create(idEmpresa, dto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS', 'JEFE_PRODUCCION')
  @ApiOperation({ summary: 'Listar unidades de medida' })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.findAll(idEmpresa);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS')
  @ApiOperation({ summary: 'Actualizar unidad de medida' })
  update(
    @Param('id') id: string,
    @CurrentUser('idEmpresa') idEmpresa: string,
    @Body() dto: Partial<CreateUnidadMedidaDto>,
  ) {
    return this.service.update(id, idEmpresa, dto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar unidad de medida (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.remove(id, idEmpresa);
  }
}

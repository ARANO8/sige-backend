import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MateriaPrimaService } from './materia-prima.service';
import { CreateMateriaPrimaDto } from './dto/create-materia-prima.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Materias Primas')
@Controller('materia-prima')
export class MateriaPrimaController {
  constructor(private service: MateriaPrimaService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS')
  @ApiOperation({ summary: 'Crear materia prima' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateMateriaPrimaDto) {
    return this.service.create(idEmpresa, dto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS', 'JEFE_PRODUCCION', 'RESPONSABLE_COMPRAS')
  @ApiOperation({ summary: 'Listar materias primas' })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.findAll(idEmpresa);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS', 'JEFE_PRODUCCION')
  @ApiOperation({ summary: 'Obtener materia prima con stock y lotes' })
  findOne(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.findOne(id, idEmpresa);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS')
  @ApiOperation({ summary: 'Actualizar materia prima' })
  update(
    @Param('id') id: string,
    @CurrentUser('idEmpresa') idEmpresa: string,
    @Body() dto: Partial<CreateMateriaPrimaDto>,
  ) {
    return this.service.update(id, idEmpresa, dto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar materia prima (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.remove(id, idEmpresa);
  }
}

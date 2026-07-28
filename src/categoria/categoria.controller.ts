import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Categorías')
@Controller('categoria')
export class CategoriaController {
  constructor(private service: CategoriaService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS')
  @ApiOperation({ summary: 'Crear categoría' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateCategoriaDto) {
    return this.service.create(idEmpresa, dto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS', 'JEFE_PRODUCCION')
  @ApiOperation({ summary: 'Listar categorías' })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.findAll(idEmpresa);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS')
  @ApiOperation({ summary: 'Obtener categoría por ID' })
  findOne(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.findOne(id, idEmpresa);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS')
  @ApiOperation({ summary: 'Actualizar categoría' })
  update(
    @Param('id') id: string,
    @CurrentUser('idEmpresa') idEmpresa: string,
    @Body() dto: Partial<CreateCategoriaDto>,
  ) {
    return this.service.update(id, idEmpresa, dto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar categoría (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.remove(id, idEmpresa);
  }
}

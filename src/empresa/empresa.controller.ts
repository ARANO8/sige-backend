import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Empresa')
@Controller('empresa')
export class EmpresaController {
  constructor(private empresaService: EmpresaService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Crear empresa' })
  create(@Body() dto: CreateEmpresaDto) {
    return this.empresaService.create(dto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Listar empresas' })
  findAll() {
    return this.empresaService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Obtener empresa por ID' })
  findOne(@Param('id') id: string) {
    return this.empresaService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Actualizar empresa' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateEmpresaDto>) {
    return this.empresaService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar empresa (soft delete)' })
  remove(@Param('id') id: string) {
    return this.empresaService.remove(id);
  }
}

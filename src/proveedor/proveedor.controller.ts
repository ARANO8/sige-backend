import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Proveedores')
@Controller('proveedor')
export class ProveedorController {
  constructor(private service: ProveedorService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_COMPRAS')
  @ApiOperation({ summary: 'Crear proveedor' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateProveedorDto) {
    return this.service.create(idEmpresa, dto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_COMPRAS', 'GERENTE')
  @ApiOperation({ summary: 'Listar proveedores' })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.findAll(idEmpresa);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'RESPONSABLE_COMPRAS')
  @ApiOperation({ summary: 'Obtener proveedor con órdenes' })
  findOne(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.findOne(id, idEmpresa);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'RESPONSABLE_COMPRAS')
  @ApiOperation({ summary: 'Actualizar proveedor' })
  update(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: Partial<CreateProveedorDto>) {
    return this.service.update(id, idEmpresa, dto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar proveedor (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.remove(id, idEmpresa);
  }
}

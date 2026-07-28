import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolService } from './rol.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Roles')
@Controller('rol')
export class RolController {
  constructor(private rolService: RolService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Crear rol en el tenant actual' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateRolDto) {
    return this.rolService.create(idEmpresa, dto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Listar roles del tenant' })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string) {
    return this.rolService.findAll(idEmpresa);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Obtener rol por ID' })
  findOne(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.rolService.findOne(id, idEmpresa);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Actualizar rol' })
  update(
    @Param('id') id: string,
    @CurrentUser('idEmpresa') idEmpresa: string,
    @Body() dto: Partial<CreateRolDto>,
  ) {
    return this.rolService.update(id, idEmpresa, dto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar rol (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.rolService.remove(id, idEmpresa);
  }
}

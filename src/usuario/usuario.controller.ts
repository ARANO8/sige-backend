import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Usuario')
@Controller('usuario')
export class UsuarioController {
  constructor(private usuarioService: UsuarioService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Crear usuario en el tenant actual' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateUsuarioDto) {
    return this.usuarioService.create(idEmpresa, dto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Listar usuarios del tenant' })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string) {
    return this.usuarioService.findAll(idEmpresa);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  findOne(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.usuarioService.findOne(id, idEmpresa);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Actualizar usuario' })
  update(
    @Param('id') id: string,
    @CurrentUser('idEmpresa') idEmpresa: string,
    @Body() dto: Partial<CreateUsuarioDto>,
  ) {
    return this.usuarioService.update(id, idEmpresa, dto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar usuario (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.usuarioService.remove(id, idEmpresa);
  }
}

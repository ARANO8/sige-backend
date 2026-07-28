import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PermisoService } from './permiso.service';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Permisos')
@Controller('permiso')
export class PermisoController {
  constructor(private permisoService: PermisoService) {}

  @Get()
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Listar todos los permisos del sistema' })
  findAll() {
    return this.permisoService.findAll();
  }
}

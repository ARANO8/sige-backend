import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Clientes')
@Controller('cliente')
export class ClienteController {
  constructor(private service: ClienteService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_VENTAS')
  @ApiOperation({ summary: 'Crear cliente' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateClienteDto) {
    return this.service.create(idEmpresa, dto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_VENTAS')
  @ApiOperation({ summary: 'Listar clientes' })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string) { return this.service.findAll(idEmpresa); }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'RESPONSABLE_VENTAS')
  @ApiOperation({ summary: 'Obtener cliente' })
  findOne(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) { return this.service.findOne(id, idEmpresa); }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'RESPONSABLE_VENTAS')
  @ApiOperation({ summary: 'Actualizar cliente' })
  update(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: Partial<CreateClienteDto>) { return this.service.update(id, idEmpresa, dto); }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar cliente' })
  remove(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) { return this.service.remove(id, idEmpresa); }
}

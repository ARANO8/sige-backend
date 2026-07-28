import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CuentaContableService } from './cuenta-contable.service';
import { CreateCuentaContableDto } from './dto/create-cuenta.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Contabilidad - Cuentas')
@Controller('cuenta-contable')
export class CuentaContableController {
  constructor(private service: CuentaContableService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'CONTADOR')
  @ApiOperation({ summary: 'Crear cuenta contable' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateCuentaContableDto) { return this.service.create(idEmpresa, dto); }

  @Get()
  @Roles('ADMINISTRADOR', 'CONTADOR', 'GERENTE')
  @ApiOperation({ summary: 'Listar plan de cuentas' })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string) { return this.service.findAll(idEmpresa); }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'CONTADOR')
  @ApiOperation({ summary: 'Obtener cuenta contable' })
  findOne(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) { return this.service.findOne(id, idEmpresa); }
}

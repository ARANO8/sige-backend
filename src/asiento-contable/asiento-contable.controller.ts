import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AsientoContableService } from './asiento-contable.service';
import { CreateAsientoDto } from './dto/create-asiento.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Contabilidad - Asientos')
@Controller('asiento-contable')
export class AsientoContableController {
  constructor(private service: AsientoContableService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'CONTADOR')
  @ApiOperation({ summary: 'Crear asiento contable (debe = haber validado)' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateAsientoDto) { return this.service.create(idEmpresa, dto); }

  @Get()
  @Roles('ADMINISTRADOR', 'CONTADOR', 'GERENTE')
  @ApiOperation({ summary: 'Listar asientos contables' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@CurrentUser('idEmpresa') idEmpresa: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll(idEmpresa, Number(page) || 1, Number(limit) || 50);
  }
}

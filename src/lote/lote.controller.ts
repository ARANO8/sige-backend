import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LoteService } from './lote.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Lotes')
@Controller('lote')
export class LoteController {
  constructor(private service: LoteService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS')
  @ApiOperation({ summary: 'Crear lote' })
  create(@CurrentUser('idEmpresa') idEmpresa: string, @Body() dto: CreateLoteDto) {
    return this.service.create(idEmpresa, dto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS', 'JEFE_PRODUCCION')
  @ApiOperation({ summary: 'Listar lotes' })
  @ApiQuery({ name: 'idMateriaPrima', required: false })
  findAll(
    @CurrentUser('idEmpresa') idEmpresa: string,
    @Query('idMateriaPrima') idMateriaPrima?: string,
  ) {
    return this.service.findAll(idEmpresa, idMateriaPrima);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'RESPONSABLE_INVENTARIOS')
  @ApiOperation({ summary: 'Obtener lote por ID' })
  findOne(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.findOne(id, idEmpresa);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Eliminar lote (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.remove(id, idEmpresa);
  }
}

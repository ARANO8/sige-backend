import { Controller, Get, Put, Body, Param, Query, Res, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportesService } from './reportes.service';
import { ReportePdfService } from './reporte-pdf.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Reportes')
@Controller('reportes')
export class ReportesController {
  constructor(
    private service: ReportesService,
    private pdfService: ReportePdfService,
  ) {}

  @Get('dashboard')
  @Roles('ADMINISTRADOR', 'GERENTE', 'CONTADOR')
  @ApiOperation({ summary: 'KPIs del dashboard gerencial' })
  getDashboard(@CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.getDashboard(idEmpresa);
  }

  @Get('ventas-mensuales')
  @Roles('ADMINISTRADOR', 'GERENTE', 'CONTADOR')
  @ApiOperation({ summary: 'Ventas agrupadas por mes para gráfica de línea' })
  @ApiQuery({ name: 'meses', required: false })
  getVentasMensuales(@CurrentUser('idEmpresa') idEmpresa: string, @Query('meses') meses?: string) {
    return this.service.getVentasMensuales(idEmpresa, Number(meses) || 6);
  }

  @Get('compras-mensuales')
  @Roles('ADMINISTRADOR', 'GERENTE', 'CONTADOR')
  @ApiOperation({ summary: 'Compras agrupadas por mes para gráfica de barras' })
  @ApiQuery({ name: 'meses', required: false })
  getComprasMensuales(@CurrentUser('idEmpresa') idEmpresa: string, @Query('meses') meses?: string) {
    return this.service.getComprasMensuales(idEmpresa, Number(meses) || 6);
  }

  @Get('produccion-mensual')
  @Roles('ADMINISTRADOR', 'JEFE_PRODUCCION', 'GERENTE')
  @ApiOperation({ summary: 'Unidades producidas por mes' })
  @ApiQuery({ name: 'meses', required: false })
  getProduccionMensual(@CurrentUser('idEmpresa') idEmpresa: string, @Query('meses') meses?: string) {
    return this.service.getProduccionMensual(idEmpresa, Number(meses) || 6);
  }

  @Get('top-productos')
  @Roles('ADMINISTRADOR', 'GERENTE', 'RESPONSABLE_VENTAS')
  @ApiOperation({ summary: 'Top productos más vendidos' })
  @ApiQuery({ name: 'limite', required: false })
  getTopProductos(@CurrentUser('idEmpresa') idEmpresa: string, @Query('limite') limite?: string) {
    return this.service.getTopProductos(idEmpresa, Number(limite) || 5);
  }

  @Get('distribucion-inventario')
  @Roles('ADMINISTRADOR', 'GERENTE')
  @ApiOperation({ summary: 'Distribución del inventario para gráfica de pastel' })
  getDistribucionInventario(@CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.getDistribucionInventario(idEmpresa);
  }

  @Get('kpi-config')
  @Roles('ADMINISTRADOR', 'GERENTE')
  @ApiOperation({ summary: 'Obtener configuración de KPIs y gráficas de la empresa' })
  getKpiConfig(@CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.getKpiConfig(idEmpresa);
  }

  @Put('kpi-config')
  @Roles('ADMINISTRADOR', 'GERENTE')
  @ApiOperation({ summary: 'Actualizar configuración de KPIs y gráficas' })
  updateKpiConfig(@CurrentUser('idEmpresa') idEmpresa: string, @Body() data: { kpisConfig?: any; chartsConfig?: any }) {
    return this.service.updateKpiConfig(idEmpresa, data);
  }

  @Get('exportar-pdf')
  @Roles('ADMINISTRADOR', 'GERENTE', 'CONTADOR')
  @ApiOperation({ summary: 'Exportar reporte de inventario en PDF' })
  async exportarPdf(@CurrentUser('idEmpresa') idEmpresa: string, @Res({ passthrough: true }) res: Response) {
    const pdf = await this.pdfService.generarReporteInventario(idEmpresa);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reporte-inventario-${new Date().toISOString().slice(0, 10)}.pdf"`,
      'Content-Length': pdf.length.toString(),
    });
    return new StreamableFile(pdf);
  }
}

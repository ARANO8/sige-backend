import { Controller, Get, Res, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Obtener KPIs del dashboard gerencial' })
  getDashboard(@CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.getDashboard(idEmpresa);
  }

  @Get('exportar-pdf')
  @Roles('ADMINISTRADOR', 'GERENTE', 'CONTADOR')
  @ApiOperation({ summary: 'Exportar reporte de inventario en PDF' })
  async exportarPdf(
    @CurrentUser('idEmpresa') idEmpresa: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pdf = await this.pdfService.generarReporteInventario(idEmpresa);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reporte-inventario-${new Date().toISOString().slice(0, 10)}.pdf"`,
      'Content-Length': pdf.length.toString(),
    });
    return new StreamableFile(pdf);
  }
}

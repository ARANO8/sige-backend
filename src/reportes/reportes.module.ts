import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportePdfService } from './reporte-pdf.service';
import { ReportesController } from './reportes.controller';

@Module({
  controllers: [ReportesController],
  providers: [ReportesService, ReportePdfService],
  exports: [ReportesService],
})
export class ReportesModule {}

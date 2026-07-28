import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Reportes')
@Controller('reportes')
export class ReportesController {
  constructor(private service: ReportesService) {}

  @Get('dashboard')
  @Roles('ADMINISTRADOR', 'GERENTE', 'CONTADOR')
  @ApiOperation({ summary: 'Obtener KPIs del dashboard gerencial' })
  getDashboard(@CurrentUser('idEmpresa') idEmpresa: string) {
    return this.service.getDashboard(idEmpresa);
  }
}

import { Module } from '@nestjs/common';
import { UnidadMedidaService } from './unidad-medida.service';
import { UnidadMedidaController } from './unidad-medida.controller';

@Module({
  controllers: [UnidadMedidaController],
  providers: [UnidadMedidaService],
  exports: [UnidadMedidaService],
})
export class UnidadMedidaModule {}

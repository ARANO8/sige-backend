import { Module } from '@nestjs/common';
import { MovimientoInventarioService } from './movimiento-inventario.service';
import { MovimientoInventarioController } from './movimiento-inventario.controller';

@Module({
  controllers: [MovimientoInventarioController],
  providers: [MovimientoInventarioService],
  exports: [MovimientoInventarioService],
})
export class MovimientoInventarioModule {}

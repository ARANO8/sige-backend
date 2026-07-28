import { Module } from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';

@Module({ controllers: [VentaController], providers: [VentaService], exports: [VentaService] })
export class VentaModule {}

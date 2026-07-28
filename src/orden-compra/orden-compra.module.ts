import { Module } from '@nestjs/common';
import { OrdenCompraService } from './orden-compra.service';
import { OrdenCompraController } from './orden-compra.controller';

@Module({ controllers: [OrdenCompraController], providers: [OrdenCompraService], exports: [OrdenCompraService] })
export class OrdenCompraModule {}

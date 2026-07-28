import { Module } from '@nestjs/common';
import { CuentaContableService } from './cuenta-contable.service';
import { CuentaContableController } from './cuenta-contable.controller';

@Module({ controllers: [CuentaContableController], providers: [CuentaContableService], exports: [CuentaContableService] })
export class CuentaContableModule {}

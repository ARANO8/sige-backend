import { Module } from '@nestjs/common';
import { AsientoContableService } from './asiento-contable.service';
import { AsientoContableController } from './asiento-contable.controller';

@Module({ controllers: [AsientoContableController], providers: [AsientoContableService], exports: [AsientoContableService] })
export class AsientoContableModule {}

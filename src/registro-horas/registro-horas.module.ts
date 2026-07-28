import { Module } from '@nestjs/common';
import { RegistroHorasService } from './registro-horas.service';
import { RegistroHorasController } from './registro-horas.controller';

@Module({ controllers: [RegistroHorasController], providers: [RegistroHorasService], exports: [RegistroHorasService] })
export class RegistroHorasModule {}

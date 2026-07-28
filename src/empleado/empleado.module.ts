import { Module } from '@nestjs/common';
import { EmpleadoService } from './empleado.service';
import { EmpleadoController } from './empleado.controller';

@Module({ controllers: [EmpleadoController], providers: [EmpleadoService], exports: [EmpleadoService] })
export class EmpleadoModule {}

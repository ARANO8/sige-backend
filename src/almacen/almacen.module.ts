import { Module } from '@nestjs/common';
import { AlmacenService } from './almacen.service';
import { AlmacenController } from './almacen.controller';

@Module({
  controllers: [AlmacenController],
  providers: [AlmacenService],
  exports: [AlmacenService],
})
export class AlmacenModule {}

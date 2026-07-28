import { Module } from '@nestjs/common';
import { MateriaPrimaService } from './materia-prima.service';
import { MateriaPrimaController } from './materia-prima.controller';

@Module({
  controllers: [MateriaPrimaController],
  providers: [MateriaPrimaService],
  exports: [MateriaPrimaService],
})
export class MateriaPrimaModule {}

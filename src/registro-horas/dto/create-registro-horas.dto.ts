import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRegistroHorasDto {
  @IsString() idEmpleado: string;
  @IsString() idTurno: string;
  @IsDateString() fecha: string;
  @IsDateString() horaEntrada: string;
  @IsOptional() @IsDateString() horaSalida?: string;
  @IsOptional() @Type(() => Number) @IsNumber() horasTrabajadas?: number;
  @IsOptional() @IsString() observaciones?: string;
}

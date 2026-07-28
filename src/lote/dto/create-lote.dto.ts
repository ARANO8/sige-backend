import { IsString, IsOptional, IsNumber, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLoteDto {
  @IsString()
  idMateriaPrima: string;

  @IsString()
  numeroLote: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cantidadInicial: number;
}

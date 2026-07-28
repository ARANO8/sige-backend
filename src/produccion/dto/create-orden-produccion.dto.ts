import { IsString, IsNumber, IsOptional, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrdenProduccionDto {
  @IsString()
  idProducto: string;

  @IsOptional()
  @IsString()
  idBOM?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  cantidadPlanificada: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

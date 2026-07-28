import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class DetalleCompraDto {
  @IsString()
  idMateriaPrima: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  cantidad: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioUnitario: number;
}

export class CreateOrdenCompraDto {
  @IsString()
  idProveedor: string;

  @IsOptional()
  @IsDateString()
  fechaEntrega?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleCompraDto)
  detalles: DetalleCompraDto[];
}

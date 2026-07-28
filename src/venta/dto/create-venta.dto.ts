import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class DetalleVentaDto {
  @IsString() idProducto: string;
  @Type(() => Number) @IsNumber() @Min(1) cantidad: number;
  @Type(() => Number) @IsNumber() @Min(0) precioUnitario: number;
}

export class CreateVentaDto {
  @IsString() idCliente: string;
  @IsOptional() @IsString() observaciones?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleVentaDto)
  detalles: DetalleVentaDto[];
}

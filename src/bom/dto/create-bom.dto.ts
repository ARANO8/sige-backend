import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class BomDetalleDto {
  @IsString()
  idMateriaPrima: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cantidad: number;

  @IsOptional()
  @IsInt()
  secuencia?: number;
}

export class CreateBomDto {
  @IsString()
  idProducto: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BomDetalleDto)
  detalles: BomDetalleDto[];
}

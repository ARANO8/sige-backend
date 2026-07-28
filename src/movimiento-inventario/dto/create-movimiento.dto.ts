import { IsString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoMovimientoInventario } from '../../../generated/prisma/client';

export class CreateMovimientoDto {
  @IsString()
  idAlmacen: string;

  @IsEnum(TipoMovimientoInventario)
  tipo: TipoMovimientoInventario;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cantidad: number;

  @IsOptional()
  @IsString()
  idProducto?: string;

  @IsOptional()
  @IsString()
  idMateriaPrima?: string;

  @IsOptional()
  @IsString()
  idLote?: string;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

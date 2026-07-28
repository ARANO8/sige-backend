import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStockDto {
  @IsString()
  idAlmacen: string;

  @IsOptional()
  @IsString()
  idProducto?: string;

  @IsOptional()
  @IsString()
  idMateriaPrima?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cantidad: number;
}

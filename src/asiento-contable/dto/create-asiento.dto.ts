import { IsString, IsArray, ValidateNested, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoAsiento } from '../../../generated/prisma/client';

class DetalleAsientoDto {
  @IsString() idCuentaContable: string;
  @IsEnum(TipoAsiento) tipo: TipoAsiento;
  @Type(() => Number) @IsNumber() monto: number;
  @IsOptional() @IsString() descripcion?: string;
}

export class CreateAsientoDto {
  @IsOptional() @IsDateString() fecha?: string;
  @IsString() descripcion: string;
  @IsOptional() @IsString() referencia?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleAsientoDto)
  detalles: DetalleAsientoDto[];
}

import { IsString, IsOptional } from 'class-validator';

export class CreateUnidadMedidaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  abreviatura?: string;
}

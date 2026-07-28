import { IsString, IsOptional } from 'class-validator';

export class CreateAlmacenDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;
}

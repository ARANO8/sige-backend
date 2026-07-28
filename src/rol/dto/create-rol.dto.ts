import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateRolDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsArray()
  permisos?: string[];
}

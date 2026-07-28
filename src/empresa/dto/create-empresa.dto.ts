import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  nit: string;

  @IsString()
  razonSocial: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

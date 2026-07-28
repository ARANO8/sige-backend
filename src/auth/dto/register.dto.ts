import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  empresaNombre: string;

  @IsString()
  nit: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  nombreAdmin: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}

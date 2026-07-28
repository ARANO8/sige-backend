import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateClienteDto {
  @IsString() nombre: string;
  @IsOptional() @IsString() nit?: string;
  @IsOptional() @IsString() direccion?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsEmail() email?: string;
}

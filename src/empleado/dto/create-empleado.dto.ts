import { IsString, IsOptional, IsEmail, IsDateString } from 'class-validator';

export class CreateEmpleadoDto {
  @IsString() nombre: string;
  @IsString() apellido: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsString() idCargo?: string;
  @IsOptional() @IsDateString() fechaIngreso?: string;
}

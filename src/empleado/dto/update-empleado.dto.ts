import { IsString, IsOptional, IsEmail, IsDateString } from 'class-validator';

export class UpdateEmpleadoDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() apellido?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsString() idCargo?: string;
  @IsOptional() @IsDateString() fechaIngreso?: string;
}

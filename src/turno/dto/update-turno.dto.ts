import { IsString, IsOptional } from 'class-validator';

export class UpdateTurnoDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() horaInicio?: string;
  @IsOptional() @IsString() horaFin?: string;
}

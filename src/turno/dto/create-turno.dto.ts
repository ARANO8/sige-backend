import { IsString } from 'class-validator';

export class CreateTurnoDto {
  @IsString() nombre: string;
  @IsString() horaInicio: string;
  @IsString() horaFin: string;
}

import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateCuentaContableDto {
  @IsString() codigo: string;
  @IsString() nombre: string;
  @IsOptional() @IsString() tipo?: string;
  @IsOptional() @IsInt() nivel?: number;
  @IsOptional() @IsString() idPadre?: string;
}

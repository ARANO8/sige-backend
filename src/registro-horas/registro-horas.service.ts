import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistroHorasDto } from './dto/create-registro-horas.dto';

@Injectable()
export class RegistroHorasService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateRegistroHorasDto) {
    return this.prisma.registroHoras.create({
      data: {
        idEmpresa, ...dto,
        fecha: new Date(dto.fecha),
        horaEntrada: new Date(dto.horaEntrada),
        horaSalida: dto.horaSalida ? new Date(dto.horaSalida) : undefined,
      },
      include: { empleado: { select: { id: true, nombre: true, apellido: true } }, turno: true },
    });
  }

  async findAll(idEmpresa: string, idEmpleado?: string) {
    return this.prisma.registroHoras.findMany({
      where: { idEmpresa, ...(idEmpleado ? { idEmpleado } : {}) },
      include: { empleado: { select: { id: true, nombre: true, apellido: true } }, turno: true },
      orderBy: { fecha: 'desc' },
      take: 100,
    });
  }
}

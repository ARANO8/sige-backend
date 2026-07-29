import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Injectable()
export class EmpleadoService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateEmpleadoDto) {
    return this.prisma.empleado.create({
      data: { idEmpresa, ...dto, fechaIngreso: dto.fechaIngreso ? new Date(dto.fechaIngreso) : undefined },
      include: { cargo: true },
    });
  }

  async findAll(idEmpresa: string) {
    return this.prisma.empleado.findMany({
      where: { idEmpresa, deletedAt: null },
      include: { cargo: true },
    });
  }

  async findOne(id: string, idEmpresa: string) {
    const item = await this.prisma.empleado.findFirst({
      where: { id, idEmpresa, deletedAt: null },
      include: { cargo: true, registrosHoras: { take: 10, orderBy: { fecha: 'desc' } } },
    });
    if (!item) throw new NotFoundException('Empleado no encontrado');
    return item;
  }

  async update(id: string, idEmpresa: string, dto: UpdateEmpleadoDto) {
    await this.findOne(id, idEmpresa);
    return this.prisma.empleado.update({
      where: { id },
      data: { ...dto, fechaIngreso: dto.fechaIngreso ? new Date(dto.fechaIngreso) : undefined },
      include: { cargo: true },
    });
  }

  async remove(id: string, idEmpresa: string) {
    await this.findOne(id, idEmpresa);
    return this.prisma.empleado.update({ where: { id }, data: { deletedAt: new Date(), estado: 'INACTIVO' } });
  }
}

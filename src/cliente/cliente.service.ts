import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';

@Injectable()
export class ClienteService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateClienteDto) {
    return this.prisma.cliente.create({ data: { idEmpresa, ...dto } });
  }

  async findAll(idEmpresa: string) {
    return this.prisma.cliente.findMany({ where: { idEmpresa, deletedAt: null } });
  }

  async findOne(id: string, idEmpresa: string) {
    const item = await this.prisma.cliente.findFirst({
      where: { id, idEmpresa, deletedAt: null },
      include: { ventas: { take: 5, orderBy: { fecha: 'desc' } } },
    });
    if (!item) throw new NotFoundException('Cliente no encontrado');
    return item;
  }

  async update(id: string, idEmpresa: string, dto: Partial<CreateClienteDto>) {
    await this.findOne(id, idEmpresa);
    return this.prisma.cliente.update({ where: { id }, data: dto });
  }

  async remove(id: string, idEmpresa: string) {
    await this.findOne(id, idEmpresa);
    return this.prisma.cliente.update({ where: { id }, data: { deletedAt: new Date(), estado: 'INACTIVO' } });
  }
}

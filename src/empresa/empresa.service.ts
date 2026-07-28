import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';

@Injectable()
export class EmpresaService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmpresaDto) {
    return this.prisma.empresa.create({ data: dto });
  }

  async findAll() {
    return this.prisma.empresa.findMany({ where: { deletedAt: null } });
  }

  async findOne(id: string) {
    const empresa = await this.prisma.empresa.findFirst({
      where: { id, deletedAt: null },
    });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');
    return empresa;
  }

  async update(id: string, dto: Partial<CreateEmpresaDto>) {
    await this.findOne(id);
    return this.prisma.empresa.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.empresa.update({
      where: { id },
      data: { deletedAt: new Date(), estado: 'INACTIVO' },
    });
  }
}

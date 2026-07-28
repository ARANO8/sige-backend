import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnidadMedidaDto } from './dto/create-unidad-medida.dto';

@Injectable()
export class UnidadMedidaService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateUnidadMedidaDto) {
    return this.prisma.unidadMedida.create({
      data: { idEmpresa, ...dto },
    });
  }

  async findAll(idEmpresa: string) {
    return this.prisma.unidadMedida.findMany({
      where: { idEmpresa, deletedAt: null },
    });
  }

  async findOne(id: string, idEmpresa: string) {
    const item = await this.prisma.unidadMedida.findFirst({
      where: { id, idEmpresa, deletedAt: null },
    });
    if (!item) throw new NotFoundException('Unidad de medida no encontrada');
    return item;
  }

  async update(id: string, idEmpresa: string, dto: Partial<CreateUnidadMedidaDto>) {
    await this.findOne(id, idEmpresa);
    return this.prisma.unidadMedida.update({ where: { id }, data: dto });
  }

  async remove(id: string, idEmpresa: string) {
    await this.findOne(id, idEmpresa);
    return this.prisma.unidadMedida.update({
      where: { id },
      data: { deletedAt: new Date(), estado: 'INACTIVO' },
    });
  }
}

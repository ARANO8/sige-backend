import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlmacenDto } from './dto/create-almacen.dto';

@Injectable()
export class AlmacenService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateAlmacenDto) {
    return this.prisma.almacen.create({ data: { idEmpresa, ...dto } });
  }

  async findAll(idEmpresa: string) {
    return this.prisma.almacen.findMany({
      where: { idEmpresa, deletedAt: null },
      include: { _count: { select: { stocks: true } } },
    });
  }

  async findOne(id: string, idEmpresa: string) {
    const item = await this.prisma.almacen.findFirst({
      where: { id, idEmpresa, deletedAt: null },
      include: {
        stocks: {
          include: {
            producto: { select: { id: true, nombre: true, codigo: true } },
            materiaPrima: { select: { id: true, nombre: true, codigo: true } },
          },
        },
      },
    });
    if (!item) throw new NotFoundException('Almacén no encontrado');
    return item;
  }

  async update(id: string, idEmpresa: string, dto: Partial<CreateAlmacenDto>) {
    await this.findOne(id, idEmpresa);
    return this.prisma.almacen.update({ where: { id }, data: dto });
  }

  async remove(id: string, idEmpresa: string) {
    await this.findOne(id, idEmpresa);
    return this.prisma.almacen.update({
      where: { id },
      data: { deletedAt: new Date(), estado: 'INACTIVO' },
    });
  }
}

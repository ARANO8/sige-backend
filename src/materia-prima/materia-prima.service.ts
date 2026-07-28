import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMateriaPrimaDto } from './dto/create-materia-prima.dto';

@Injectable()
export class MateriaPrimaService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateMateriaPrimaDto) {
    return this.prisma.materiaPrima.create({
      data: { idEmpresa, ...dto },
      include: { categoria: true, unidadMedida: true },
    });
  }

  async findAll(idEmpresa: string) {
    return this.prisma.materiaPrima.findMany({
      where: { idEmpresa, deletedAt: null },
      include: {
        categoria: true,
        unidadMedida: true,
        lotes: { where: { estado: 'ACTIVO' }, take: 5, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async findOne(id: string, idEmpresa: string) {
    const item = await this.prisma.materiaPrima.findFirst({
      where: { id, idEmpresa, deletedAt: null },
      include: {
        categoria: true,
        unidadMedida: true,
        lotes: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
        stocks: { include: { almacen: true } },
      },
    });
    if (!item) throw new NotFoundException('Materia prima no encontrada');
    return item;
  }

  async update(id: string, idEmpresa: string, dto: Partial<CreateMateriaPrimaDto>) {
    await this.findOne(id, idEmpresa);
    return this.prisma.materiaPrima.update({
      where: { id },
      data: dto,
      include: { categoria: true, unidadMedida: true },
    });
  }

  async remove(id: string, idEmpresa: string) {
    await this.findOne(id, idEmpresa);
    return this.prisma.materiaPrima.update({
      where: { id },
      data: { deletedAt: new Date(), estado: 'INACTIVO' },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateCategoriaDto) {
    return this.prisma.categoria.create({
      data: { idEmpresa, ...dto },
    });
  }

  async findAll(idEmpresa: string) {
    return this.prisma.categoria.findMany({
      where: { idEmpresa, deletedAt: null },
    });
  }

  async findOne(id: string, idEmpresa: string) {
    const item = await this.prisma.categoria.findFirst({
      where: { id, idEmpresa, deletedAt: null },
    });
    if (!item) throw new NotFoundException('Categoría no encontrada');
    return item;
  }

  async update(id: string, idEmpresa: string, dto: Partial<CreateCategoriaDto>) {
    await this.findOne(id, idEmpresa);
    return this.prisma.categoria.update({ where: { id }, data: dto });
  }

  async remove(id: string, idEmpresa: string) {
    await this.findOne(id, idEmpresa);
    return this.prisma.categoria.update({
      where: { id },
      data: { deletedAt: new Date(), estado: 'INACTIVO' },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';

@Injectable()
export class ProductoService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateProductoDto) {
    return this.prisma.producto.create({
      data: { idEmpresa, ...dto },
      include: { categoria: true, unidadMedida: true },
    });
  }

  async findAll(idEmpresa: string) {
    return this.prisma.producto.findMany({
      where: { idEmpresa, deletedAt: null },
      include: {
        categoria: true,
        unidadMedida: true,
        stocks: { include: { almacen: true } },
      },
    });
  }

  async findOne(id: string, idEmpresa: string) {
    const item = await this.prisma.producto.findFirst({
      where: { id, idEmpresa, deletedAt: null },
      include: {
        categoria: true,
        unidadMedida: true,
        stocks: { include: { almacen: true } },
        boms: { where: { estado: 'ACTIVO' } },
      },
    });
    if (!item) throw new NotFoundException('Producto no encontrado');
    return item;
  }

  async update(id: string, idEmpresa: string, dto: Partial<CreateProductoDto>) {
    await this.findOne(id, idEmpresa);
    return this.prisma.producto.update({
      where: { id },
      data: dto,
      include: { categoria: true, unidadMedida: true },
    });
  }

  async remove(id: string, idEmpresa: string) {
    await this.findOne(id, idEmpresa);
    return this.prisma.producto.update({
      where: { id },
      data: { deletedAt: new Date(), estado: 'INACTIVO' },
    });
  }
}

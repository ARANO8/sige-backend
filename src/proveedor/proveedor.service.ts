import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';

@Injectable()
export class ProveedorService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateProveedorDto) {
    return this.prisma.proveedor.create({ data: { idEmpresa, ...dto } });
  }

  async findAll(idEmpresa: string) {
    return this.prisma.proveedor.findMany({ where: { idEmpresa, deletedAt: null } });
  }

  async findOne(id: string, idEmpresa: string) {
    const item = await this.prisma.proveedor.findFirst({
      where: { id, idEmpresa, deletedAt: null },
      include: { ordenesCompra: { take: 5, orderBy: { fecha: 'desc' } } },
    });
    if (!item) throw new NotFoundException('Proveedor no encontrado');
    return item;
  }

  async update(id: string, idEmpresa: string, dto: Partial<CreateProveedorDto>) {
    await this.findOne(id, idEmpresa);
    return this.prisma.proveedor.update({ where: { id }, data: dto });
  }

  async remove(id: string, idEmpresa: string) {
    await this.findOne(id, idEmpresa);
    return this.prisma.proveedor.update({ where: { id }, data: { deletedAt: new Date(), estado: 'INACTIVO' } });
  }
}

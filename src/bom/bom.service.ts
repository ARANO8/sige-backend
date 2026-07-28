import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBomDto } from './dto/create-bom.dto';

@Injectable()
export class BomService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateBomDto) {
    const maxVersion = await this.prisma.bOM.findFirst({
      where: { idEmpresa, idProducto: dto.idProducto },
      orderBy: { version: 'desc' },
    });

    const nuevaVersion = (maxVersion?.version ?? 0) + 1;

    return this.prisma.bOM.create({
      data: {
        idEmpresa,
        idProducto: dto.idProducto,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        version: nuevaVersion,
        detalles: {
          create: dto.detalles.map((det, i) => ({
            idMateriaPrima: det.idMateriaPrima,
            cantidad: det.cantidad,
            secuencia: det.secuencia ?? i + 1,
          })),
        },
      },
      include: {
        producto: { select: { id: true, nombre: true, codigo: true } },
        detalles: { include: { materiaPrima: { select: { id: true, nombre: true, codigo: true } } } },
      },
    });
  }

  async findAll(idEmpresa: string) {
    return this.prisma.bOM.findMany({
      where: { idEmpresa, deletedAt: null },
      include: {
        producto: { select: { id: true, nombre: true, codigo: true } },
        detalles: { include: { materiaPrima: true } },
      },
    });
  }

  async findOne(id: string, idEmpresa: string) {
    const item = await this.prisma.bOM.findFirst({
      where: { id, idEmpresa, deletedAt: null },
      include: {
        producto: true,
        detalles: { include: { materiaPrima: true } },
      },
    });
    if (!item) throw new NotFoundException('BOM no encontrada');
    return item;
  }

  async remove(id: string, idEmpresa: string) {
    await this.findOne(id, idEmpresa);
    return this.prisma.bOM.update({
      where: { id },
      data: { deletedAt: new Date(), estado: 'INACTIVO' },
    });
  }
}

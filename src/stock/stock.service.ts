import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async findByAlmacen(idEmpresa: string, idAlmacen: string) {
    return this.prisma.stock.findMany({
      where: { idEmpresa, idAlmacen },
      include: {
        producto: { select: { id: true, nombre: true, codigo: true } },
        materiaPrima: { select: { id: true, nombre: true, codigo: true } },
      },
    });
  }

  async findByProducto(idEmpresa: string, idProducto: string) {
    return this.prisma.stock.findMany({
      where: { idEmpresa, idProducto },
      include: { almacen: true },
    });
  }

  async findByMateriaPrima(idEmpresa: string, idMateriaPrima: string) {
    return this.prisma.stock.findMany({
      where: { idEmpresa, idMateriaPrima },
      include: { almacen: true },
    });
  }

  async upsert(
    idEmpresa: string,
    idAlmacen: string,
    idProducto: string | undefined,
    idMateriaPrima: string | undefined,
    cantidad: number,
  ) {
    if (!idProducto && !idMateriaPrima) {
      throw new BadRequestException('Debe especificar producto o materia prima');
    }

    return this.prisma.stock.upsert({
      where: {
        idEmpresa_idAlmacen_idProducto_idMateriaPrima: {
          idEmpresa,
          idAlmacen,
          idProducto: idProducto ?? '',
          idMateriaPrima: idMateriaPrima ?? '',
        },
      },
      update: { cantidad },
      create: {
        idEmpresa,
        idAlmacen,
        idProducto,
        idMateriaPrima,
        cantidad,
      },
    });
  }
}

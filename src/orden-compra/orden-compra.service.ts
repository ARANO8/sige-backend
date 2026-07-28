import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrdenCompraDto } from './dto/create-orden-compra.dto';

@Injectable()
export class OrdenCompraService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateOrdenCompraDto) {
    const total = dto.detalles.reduce((sum, d) => sum + d.cantidad * d.precioUnitario, 0);
    return this.prisma.ordenCompra.create({
      data: {
        idEmpresa,
        idProveedor: dto.idProveedor,
        fechaEntrega: dto.fechaEntrega ? new Date(dto.fechaEntrega) : undefined,
        observaciones: dto.observaciones,
        total,
        detalles: {
          create: dto.detalles.map((d) => ({
            idMateriaPrima: d.idMateriaPrima,
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            subtotal: d.cantidad * d.precioUnitario,
          })),
        },
      },
      include: { proveedor: true, detalles: { include: { materiaPrima: true } } },
    });
  }

  async findAll(idEmpresa: string) {
    return this.prisma.ordenCompra.findMany({
      where: { idEmpresa, deletedAt: null },
      include: { proveedor: true, detalles: { include: { materiaPrima: true } } },
      orderBy: { fecha: 'desc' },
    });
  }

  async findOne(id: string, idEmpresa: string) {
    const item = await this.prisma.ordenCompra.findFirst({
      where: { id, idEmpresa, deletedAt: null },
      include: { proveedor: true, detalles: { include: { materiaPrima: true } }, recepciones: true },
    });
    if (!item) throw new NotFoundException('OC no encontrada');
    return item;
  }

  async recibir(id: string, idEmpresa: string) {
    const oc = await this.findOne(id, idEmpresa);
    if (oc.estado === 'RECIBIDA') throw new BadRequestException('OC ya recibida');
    if (oc.estado === 'CANCELADA') throw new BadRequestException('OC cancelada');

    return this.prisma.$transaction(async (tx) => {
      const almacen = await tx.almacen.findFirst({ where: { idEmpresa, deletedAt: null } });
      if (!almacen) throw new BadRequestException('No hay almacenes disponibles');

      for (const det of oc.detalles) {
        const cantRecibida = Number(det.cantidad);
        await tx.recepcionCompra.create({
          data: {
            idOrdenCompra: oc.id,
            idMateriaPrima: det.idMateriaPrima,
            cantidadRecibida: cantRecibida,
          },
        });

        const existing = await tx.stock.findUnique({
          where: {
            idEmpresa_idAlmacen_idProducto_idMateriaPrima: {
              idEmpresa, idAlmacen: almacen.id,
              idProducto: '', idMateriaPrima: det.idMateriaPrima,
            },
          },
        });

        await tx.stock.upsert({
          where: {
            idEmpresa_idAlmacen_idProducto_idMateriaPrima: {
              idEmpresa, idAlmacen: almacen.id,
              idProducto: '', idMateriaPrima: det.idMateriaPrima,
            },
          },
          update: { cantidad: Number(existing?.cantidad ?? 0) + cantRecibida },
          create: { idEmpresa, idAlmacen: almacen.id, idMateriaPrima: det.idMateriaPrima, cantidad: cantRecibida },
        });

        await tx.movimientoInventario.create({
          data: {
            idEmpresa, idAlmacen: almacen.id,
            idMateriaPrima: det.idMateriaPrima,
            tipo: 'ENTRADA', cantidad: cantRecibida,
            referencia: `OC:${oc.id}`,
            observaciones: 'Recepción automática de OC',
          },
        });
      }

      return tx.ordenCompra.update({
        where: { id: oc.id },
        data: { estado: 'RECIBIDA' },
        include: { recepciones: true, detalles: true },
      });
    });
  }

  async aprobar(id: string, idEmpresa: string) {
    const oc = await this.findOne(id, idEmpresa);
    if (oc.estado !== 'SOLICITADA') throw new BadRequestException('Solo se pueden aprobar OC solicitadas');
    return this.prisma.ordenCompra.update({ where: { id }, data: { estado: 'APROBADA' } });
  }

  async cancelar(id: string, idEmpresa: string) {
    const oc = await this.findOne(id, idEmpresa);
    if (oc.estado === 'RECIBIDA') throw new BadRequestException('No se puede cancelar una OC recibida');
    return this.prisma.ordenCompra.update({ where: { id }, data: { estado: 'CANCELADA' } });
  }

  async remove(id: string, idEmpresa: string) {
    await this.findOne(id, idEmpresa);
    return this.prisma.ordenCompra.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

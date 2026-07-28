import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVentaDto } from './dto/create-venta.dto';

@Injectable()
export class VentaService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateVentaDto) {
    return this.prisma.$transaction(async (tx) => {
      const almacen = await tx.almacen.findFirst({ where: { idEmpresa, deletedAt: null } });
      if (!almacen) throw new BadRequestException('No hay almacenes disponibles');

      let total = 0;
      const detallesData: Array<{ idProducto: string; cantidad: number; precioUnitario: number; subtotal: number }> = [];

      for (const det of dto.detalles) {
        const producto = await tx.producto.findFirst({
          where: { id: det.idProducto, idEmpresa, deletedAt: null },
        });
        if (!producto) throw new NotFoundException(`Producto ${det.idProducto} no encontrado`);

        const stock = await tx.stock.findFirst({
          where: { idEmpresa, idAlmacen: almacen.id, idProducto: det.idProducto },
        });

        const disponible = stock ? Number(stock.cantidad) : 0;
        if (disponible < det.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente de "${producto.nombre}": disponible ${disponible}, requiere ${det.cantidad}`,
          );
        }

        const subtotal = det.cantidad * det.precioUnitario;
        total += subtotal;
        detallesData.push({ idProducto: det.idProducto, cantidad: det.cantidad, precioUnitario: det.precioUnitario, subtotal });
      }

      const ultimaFactura = await tx.factura.findFirst({
        where: { idEmpresa },
        orderBy: { numero: 'desc' },
      });
      const nextNum = ultimaFactura ? String(Number(ultimaFactura.numero) + 1).padStart(8, '0') : '00000001';

      const venta = await tx.venta.create({
        data: {
          idEmpresa, idCliente: dto.idCliente, total, observaciones: dto.observaciones,
          estado: 'FACTURADA',
          detalles: { create: detallesData },
          factura: { create: { idEmpresa, numero: nextNum, total } },
        },
        include: { detalles: { include: { producto: true } }, factura: true, cliente: true },
      });

      for (const det of dto.detalles) {
        const stock = await tx.stock.findFirst({
          where: { idEmpresa, idAlmacen: almacen.id, idProducto: det.idProducto },
        });
        if (stock) {
          await tx.stock.update({
            where: { id: stock.id },
            data: { cantidad: Number(stock.cantidad) - det.cantidad },
          });
        }

        await tx.movimientoInventario.create({
          data: {
            idEmpresa, idAlmacen: almacen.id,
            idProducto: det.idProducto,
            tipo: 'SALIDA', cantidad: det.cantidad,
            referencia: `FACT:${nextNum}`,
            observaciones: `Venta #${nextNum}`,
          },
        });
      }

      return venta;
    });
  }

  async findAll(idEmpresa: string) {
    return this.prisma.venta.findMany({
      where: { idEmpresa, deletedAt: null },
      include: { cliente: true, detalles: { include: { producto: true } }, factura: true },
      orderBy: { fecha: 'desc' },
    });
  }

  async findOne(id: string, idEmpresa: string) {
    const item = await this.prisma.venta.findFirst({
      where: { id, idEmpresa, deletedAt: null },
      include: { cliente: true, detalles: { include: { producto: true } }, factura: true },
    });
    if (!item) throw new NotFoundException('Venta no encontrada');
    return item;
  }

  async anular(id: string, idEmpresa: string) {
    const venta = await this.findOne(id, idEmpresa);
    if (venta.estado === 'ANULADA') throw new BadRequestException('Venta ya anulada');
    return this.prisma.venta.update({
      where: { id },
      data: { estado: 'ANULADA' },
    });
  }
}

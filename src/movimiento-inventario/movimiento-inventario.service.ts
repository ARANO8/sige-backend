import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@Injectable()
export class MovimientoInventarioService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateMovimientoDto) {
    if (!dto.idProducto && !dto.idMateriaPrima) {
      throw new BadRequestException('Debe especificar producto o materia prima');
    }

    const factor = dto.tipo === 'ENTRADA' ? 1 : dto.tipo === 'SALIDA' ? -1 : 0;

    return this.prisma.$transaction(async (tx) => {
      const movimiento = await tx.movimientoInventario.create({
        data: {
          idEmpresa,
          idAlmacen: dto.idAlmacen,
          idProducto: dto.idProducto,
          idMateriaPrima: dto.idMateriaPrima,
          idLote: dto.idLote,
          tipo: dto.tipo,
          cantidad: dto.cantidad,
          referencia: dto.referencia,
          observaciones: dto.observaciones,
        },
      });

      if (factor !== 0) {
        const pkIdProducto = dto.idProducto ?? '';
        const pkIdMateriaPrima = dto.idMateriaPrima ?? '';

        const existingStock = await tx.stock.findUnique({
          where: {
            idEmpresa_idAlmacen_idProducto_idMateriaPrima: {
              idEmpresa,
              idAlmacen: dto.idAlmacen,
              idProducto: pkIdProducto,
              idMateriaPrima: pkIdMateriaPrima,
            },
          },
        });

        const stockActual = existingStock ? Number(existingStock.cantidad) : 0;
        const nuevaCantidad = stockActual + factor * dto.cantidad;

        if (nuevaCantidad < 0) {
          throw new BadRequestException('Stock insuficiente para realizar la salida');
        }

        await tx.stock.upsert({
          where: {
            idEmpresa_idAlmacen_idProducto_idMateriaPrima: {
              idEmpresa,
              idAlmacen: dto.idAlmacen,
              idProducto: pkIdProducto,
              idMateriaPrima: pkIdMateriaPrima,
            },
          },
          update: { cantidad: nuevaCantidad },
          create: {
            idEmpresa,
            idAlmacen: dto.idAlmacen,
            idProducto: dto.idProducto,
            idMateriaPrima: dto.idMateriaPrima,
            cantidad: nuevaCantidad,
          },
        });

        if (dto.idLote && dto.tipo === 'SALIDA') {
          const lote = await tx.lote.findUnique({ where: { id: dto.idLote } });
          if (lote && Number(lote.cantidadActual) >= dto.cantidad) {
            await tx.lote.update({
              where: { id: dto.idLote },
              data: { cantidadActual: Number(lote.cantidadActual) - dto.cantidad },
            });
          }
        }

        if (dto.idLote && dto.tipo === 'ENTRADA') {
          await tx.lote.update({
            where: { id: dto.idLote },
            data: { cantidadActual: { increment: dto.cantidad } },
          });
        }
      }

      return tx.movimientoInventario.findUnique({
        where: { id: movimiento.id },
        include: {
          producto: { select: { id: true, nombre: true, codigo: true } },
          materiaPrima: { select: { id: true, nombre: true, codigo: true } },
          almacen: { select: { id: true, nombre: true } },
        },
      });
    });
  }

  async findAll(idEmpresa: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.movimientoInventario.findMany({
        where: { idEmpresa },
        include: {
          producto: { select: { id: true, nombre: true, codigo: true } },
          materiaPrima: { select: { id: true, nombre: true, codigo: true } },
          almacen: { select: { id: true, nombre: true } },
        },
        orderBy: { fecha: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.movimientoInventario.count({ where: { idEmpresa } }),
    ]);
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }
}

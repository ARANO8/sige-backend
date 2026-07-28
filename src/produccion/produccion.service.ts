import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrdenProduccionDto } from './dto/create-orden-produccion.dto';

@Injectable()
export class ProduccionService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateOrdenProduccionDto) {
    return this.prisma.ordenProduccion.create({
      data: {
        idEmpresa,
        idProducto: dto.idProducto,
        idBOM: dto.idBOM,
        cantidadPlanificada: dto.cantidadPlanificada,
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
        observaciones: dto.observaciones,
        estado: 'PLANIFICADA',
      },
      include: { producto: true, bom: true },
    });
  }

  async findAll(idEmpresa: string) {
    return this.prisma.ordenProduccion.findMany({
      where: { idEmpresa, deletedAt: null },
      include: {
        producto: { select: { id: true, nombre: true, codigo: true } },
        bom: { select: { id: true, nombre: true, version: true } },
        consumos: { include: { materiaPrima: true } },
        terminadas: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, idEmpresa: string) {
    const item = await this.prisma.ordenProduccion.findFirst({
      where: { id, idEmpresa, deletedAt: null },
      include: {
        producto: true,
        bom: { include: { detalles: { include: { materiaPrima: true } } } },
        consumos: { include: { materiaPrima: true, lote: true } },
        terminadas: true,
      },
    });
    if (!item) throw new NotFoundException('Orden de producción no encontrada');
    return item;
  }

  async finalizar(id: string, idEmpresa: string, cantidadProducida?: number) {
    const op = await this.findOne(id, idEmpresa);
    if (op.estado === 'COMPLETADA') throw new BadRequestException('La OP ya está completada');
    if (op.estado === 'CANCELADA') throw new BadRequestException('La OP está cancelada');

    const totalProducir = Number(cantidadProducida ?? op.cantidadPlanificada);

    return this.prisma.$transaction(async (tx) => {
      if (op.bom) {
        for (const detalle of op.bom.detalles) {
          const needed = Number(detalle.cantidad) * totalProducir;
          const stocks = await tx.stock.findMany({
            where: { idEmpresa, idMateriaPrima: detalle.idMateriaPrima },
          });
          const disponible = stocks.reduce((sum: number, s) => sum + Number(s.cantidad), 0);

          if (disponible < needed) {
            throw new BadRequestException(
              `Stock insuficiente de MP "${detalle.materiaPrima.nombre}": necesita ${needed}, disponible ${disponible}`,
            );
          }

          let restante = needed;
          for (const stock of stocks) {
            const qty = Number(stock.cantidad);
            if (qty <= 0) continue;
            const aDescontar = Math.min(qty, restante);
            await tx.stock.update({
              where: { id: stock.id },
              data: { cantidad: qty - aDescontar },
            });
            await tx.movimientoInventario.create({
              data: {
                idEmpresa, idAlmacen: stock.idAlmacen,
                idMateriaPrima: detalle.idMateriaPrima,
                tipo: 'SALIDA', cantidad: aDescontar,
                referencia: `OP:${op.id}`,
                observaciones: `Consumo automático por finalización de OP`,
              },
            });
            await tx.consumoMateriaPrima.create({
              data: {
                idOrdenProduccion: op.id,
                idMateriaPrima: detalle.idMateriaPrima,
                cantidad: aDescontar,
              },
            });
            restante -= aDescontar;
            if (restante <= 0) break;
          }
        }
      }

      await tx.produccionTerminada.create({
        data: {
          idOrdenProduccion: op.id,
          idProducto: op.idProducto,
          cantidad: totalProducir,
        },
      });

      const almacenDefault = await tx.almacen.findFirst({
        where: { idEmpresa, deletedAt: null },
      });

      if (almacenDefault) {
        const existingStock = await tx.stock.findUnique({
          where: {
            idEmpresa_idAlmacen_idProducto_idMateriaPrima: {
              idEmpresa, idAlmacen: almacenDefault.id,
              idProducto: op.idProducto, idMateriaPrima: '',
            },
          },
        });

        await tx.stock.upsert({
          where: {
            idEmpresa_idAlmacen_idProducto_idMateriaPrima: {
              idEmpresa, idAlmacen: almacenDefault.id,
              idProducto: op.idProducto, idMateriaPrima: '',
            },
          },
          update: { cantidad: Number(existingStock?.cantidad ?? 0) + Number(totalProducir) },
          create: {
            idEmpresa, idAlmacen: almacenDefault.id,
            idProducto: op.idProducto, cantidad: totalProducir,
          },
        });

        await tx.movimientoInventario.create({
          data: {
            idEmpresa, idAlmacen: almacenDefault.id,
            idProducto: op.idProducto,
            tipo: 'ENTRADA', cantidad: totalProducir,
            referencia: `OP:${op.id}`,
            observaciones: 'Ingreso automático por finalización de OP',
          },
        });
      }

      return tx.ordenProduccion.update({
        where: { id: op.id },
        data: {
          estado: 'COMPLETADA',
          cantidadProducida: totalProducir,
          fechaFin: new Date(),
        },
        include: { consumos: true, terminadas: true, producto: true },
      });
    });
  }

  async cancelar(id: string, idEmpresa: string) {
    const op = await this.findOne(id, idEmpresa);
    if (op.estado === 'COMPLETADA') throw new BadRequestException('No se puede cancelar una OP completada');
    return this.prisma.ordenProduccion.update({
      where: { id },
      data: { estado: 'CANCELADA' },
    });
  }

  async remove(id: string, idEmpresa: string) {
    await this.findOne(id, idEmpresa);
    return this.prisma.ordenProduccion.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(idEmpresa: string) {
    const [totalMP, totalProd, totalVentas, totalCompras, opsActivas, stockBajo] = await Promise.all([
      this.prisma.materiaPrima.count({ where: { idEmpresa, deletedAt: null, estado: 'ACTIVO' } }),
      this.prisma.producto.count({ where: { idEmpresa, deletedAt: null, estado: 'ACTIVO' } }),
      this.prisma.venta.aggregate({
        where: { idEmpresa, deletedAt: null, estado: 'FACTURADA' },
        _sum: { total: true },
      }),
      this.prisma.ordenCompra.aggregate({
        where: { idEmpresa, deletedAt: null, estado: 'RECIBIDA' },
        _sum: { total: true },
      }),
      this.prisma.ordenProduccion.count({
        where: { idEmpresa, deletedAt: null, estado: { in: ['PLANIFICADA', 'EN_PROCESO'] } },
      }),
      this.prisma.stock.count({
        where: { idEmpresa, cantidad: { lte: 10 } },
      }),
    ]);

    const ventasRecientes = await this.prisma.venta.findMany({
      where: { idEmpresa, deletedAt: null },
      include: { cliente: true, factura: true },
      orderBy: { fecha: 'desc' },
      take: 5,
    });

    return {
      resumen: {
        materiasPrimas: totalMP,
        productos: totalProd,
        ventas: Number(totalVentas._sum.total ?? 0),
        compras: Number(totalCompras._sum.total ?? 0),
        opsActivas,
        stockBajo,
      },
      ventasRecientes,
    };
  }
}

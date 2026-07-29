import { Injectable, NotFoundException } from '@nestjs/common';
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
      this.prisma.stock.count({ where: { idEmpresa, cantidad: { lte: 10 } } }),
    ]);

    const ventasRecientes = await this.prisma.venta.findMany({
      where: { idEmpresa, deletedAt: null },
      include: { cliente: true, factura: true, detalles: { include: { producto: true } } },
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

  async getVentasMensuales(idEmpresa: string, meses = 6) {
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - meses);

    const ventas = await this.prisma.venta.findMany({
      where: { idEmpresa, deletedAt: null, estado: 'FACTURADA', fecha: { gte: fechaLimite } },
      select: { fecha: true, total: true },
      orderBy: { fecha: 'asc' },
    });

    return this.agruparPorMes(ventas, meses);
  }

  async getComprasMensuales(idEmpresa: string, meses = 6) {
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - meses);

    const compras = await this.prisma.ordenCompra.findMany({
      where: { idEmpresa, deletedAt: null, estado: 'RECIBIDA', fecha: { gte: fechaLimite } },
      select: { fecha: true, total: true },
      orderBy: { fecha: 'asc' },
    });

    return this.agruparPorMes(compras, meses);
  }

  async getProduccionMensual(idEmpresa: string, meses = 6) {
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - meses);

    const ops = await this.prisma.ordenProduccion.findMany({
      where: { idEmpresa, deletedAt: null, estado: 'COMPLETADA', fechaFin: { gte: fechaLimite } },
      select: { fechaFin: true, cantidadProducida: true },
      orderBy: { fechaFin: 'asc' },
    });

    return this.agruparPorMes(ops.map((o) => ({ fecha: o.fechaFin!, total: o.cantidadProducida })), meses);
  }

  async getTopProductos(idEmpresa: string, limite = 5) {
    const detalles = await this.prisma.detalleVenta.findMany({
      where: { venta: { idEmpresa, deletedAt: null, estado: 'FACTURADA' } },
      include: { producto: { select: { id: true, nombre: true, codigo: true } } },
    });

    const agrupado: Record<string, { nombre: string; codigo: string; cantidad: number; total: number }> = {};
    for (const d of detalles) {
      const key = d.idProducto;
      if (!agrupado[key]) agrupado[key] = { nombre: d.producto?.nombre ?? key, codigo: d.producto?.codigo ?? '', cantidad: 0, total: 0 };
      agrupado[key].cantidad += Number(d.cantidad);
      agrupado[key].total += Number(d.subtotal);
    }

    return Object.values(agrupado)
      .sort((a, b) => b.total - a.total)
      .slice(0, limite);
  }

  async getDistribucionInventario(idEmpresa: string) {
    const stocks = await this.prisma.stock.findMany({
      where: { idEmpresa, cantidad: { gt: 0 } },
      include: {
        producto: { select: { id: true, nombre: true } },
        materiaPrima: { select: { id: true, nombre: true } },
        almacen: { select: { id: true, nombre: true } },
      },
    });

    const porTipo: Record<string, { label: string; value: number; color: string }> = {};
    const colores = ['#2563eb', '#16a34a', '#ea580c', '#9333ea', '#06b6d4', '#eab308', '#ec4899', '#6366f1'];

    for (let i = 0; i < stocks.length; i++) {
      const s = stocks[i];
      const label = s.producto?.nombre || s.materiaPrima?.nombre || 'Desconocido';
      const tipo = s.producto ? 'Productos' : 'Materias Primas';
      const key = `${tipo}:${(s.producto?.id || s.materiaPrima?.id || s.id)}`;
      if (!porTipo[key]) porTipo[key] = { label, value: 0, color: colores[i % colores.length] };
      porTipo[key].value += Number(s.cantidad);
    }

    return Object.values(porTipo).sort((a, b) => b.value - a.value).slice(0, 10);
  }

  async getKpiConfig(idEmpresa: string) {
    let config = await this.prisma.configuracionDashboard.findUnique({ where: { idEmpresa } });
    if (!config) {
      config = await this.prisma.configuracionDashboard.create({
        data: {
          idEmpresa,
          kpisConfig: {
            ventas: { enabled: true, label: 'Ventas Totales', type: 'currency', target: 100000, warningAt: 50000, color: '#16a34a' },
            compras: { enabled: true, label: 'Compras Totales', type: 'currency', target: 80000, warningAt: 40000, color: '#84cc16' },
            opsActivas: { enabled: true, label: 'OP Activas', type: 'number', target: 10, warningAt: 3, color: '#06b6d4' },
            stockBajo: { enabled: true, label: 'Stock Bajo', type: 'number', target: 0, warningAt: 5, color: '#ea580c' },
            materiasPrimas: { enabled: true, label: 'Materias Primas', type: 'number', color: '#6366f1' },
            productos: { enabled: true, label: 'Productos Terminados', type: 'number', color: '#2563eb' },
          },
          chartsConfig: {
            ventasMensuales: { enabled: true, type: 'line', title: 'Ventas Mensuales', metrics: ['ventas', 'compras'], period: 6 },
            distribucion: { enabled: true, type: 'pie', title: 'Distribución de Inventario', period: 0 },
            topProductos: { enabled: true, type: 'bar', title: 'Top Productos', limit: 5 },
          },
        },
      });
    }
    return config;
  }

  async updateKpiConfig(idEmpresa: string, data: { kpisConfig?: any; chartsConfig?: any }) {
    const existing = await this.prisma.configuracionDashboard.findUnique({ where: { idEmpresa } });
    if (!existing) throw new NotFoundException('Configuración no encontrada');

    return this.prisma.configuracionDashboard.update({
      where: { idEmpresa },
      data: {
        kpisConfig: data.kpisConfig ?? existing.kpisConfig,
        chartsConfig: data.chartsConfig ?? existing.chartsConfig,
      },
    });
  }

  private agruparPorMes(items: Array<{ fecha: Date | string; total: any }>, meses: number) {
    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const agrupado: Record<string, number> = {};

    for (let i = 0; i < meses; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${mesesNombres[d.getMonth()]} ${d.getFullYear()}`;
      agrupado[key] = 0;
    }

    for (const item of items) {
      const d = new Date(item.fecha);
      const key = `${mesesNombres[d.getMonth()]} ${d.getFullYear()}`;
      if (agrupado[key] !== undefined) agrupado[key] += Number(item.total);
    }

    const labels = Object.keys(agrupado).reverse();
    const values = labels.map((l) => agrupado[l]);
    return { labels, values };
  }
}

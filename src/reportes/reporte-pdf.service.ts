import { Injectable } from '@nestjs/common';
const PDFDocument = require('pdfkit');
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportePdfService {
  constructor(private prisma: PrismaService) {}

  async generarReporteInventario(idEmpresa: string): Promise<Buffer> {
    const [materiasPrimas, productos, almacenes] = await Promise.all([
      this.prisma.materiaPrima.findMany({
        where: { idEmpresa, deletedAt: null },
        include: { stocks: { include: { almacen: true } } },
      }),
      this.prisma.producto.findMany({
        where: { idEmpresa, deletedAt: null },
        include: { stocks: { include: { almacen: true } } },
      }),
      this.prisma.almacen.findMany({ where: { idEmpresa, deletedAt: null } }),
    ]);

    const empresa = await this.prisma.empresa.findUnique({ where: { id: idEmpresa } });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(20).font('Helvetica-Bold').text('SIGE ERP', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text(`Reporte de Inventario`, { align: 'center' });
      doc.fontSize(10).text(`Empresa: ${empresa?.razonSocial || idEmpresa}`, { align: 'center' });
      doc.text(`Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, { align: 'center' });
      doc.moveDown(1.5);

      doc.fontSize(14).font('Helvetica-Bold').text('Materias Primas', { underline: true });
      doc.moveDown(0.5);

      if (materiasPrimas.length === 0) {
        doc.fontSize(10).font('Helvetica').text('No hay materias primas registradas.');
      } else {
        for (const mp of materiasPrimas) {
          const stockTotal = mp.stocks.reduce((s, st) => s + Number(st.cantidad), 0);
          doc.fontSize(11).font('Helvetica-Bold').text(`${mp.nombre} (${mp.codigo})`);
          doc.fontSize(10).font('Helvetica').text(`  Stock total: ${stockTotal} | Stock mínimo: ${Number(mp.stockMinimo)}`);
          doc.moveDown(0.3);
        }
      }

      doc.moveDown(1);
      doc.fontSize(14).font('Helvetica-Bold').text('Productos Terminados', { underline: true });
      doc.moveDown(0.5);

      if (productos.length === 0) {
        doc.fontSize(10).font('Helvetica').text('No hay productos registrados.');
      } else {
        for (const p of productos) {
          const stockTotal = p.stocks.reduce((s, st) => s + Number(st.cantidad), 0);
          doc.fontSize(11).font('Helvetica-Bold').text(`${p.nombre} (${p.codigo})`);
          doc.fontSize(10).font('Helvetica').text(`  Stock total: ${stockTotal} | Precio venta: $${Number(p.precioVenta).toFixed(2)}`);
          doc.moveDown(0.3);
        }
      }

      doc.moveDown(1);
      doc.fontSize(14).font('Helvetica-Bold').text('Almacenes', { underline: true });
      doc.moveDown(0.5);

      for (const a of almacenes) {
        doc.fontSize(11).font('Helvetica').text(`${a.nombre} - ${a.ubicacion || 'Sin ubicación'}`);
      }

      doc.moveDown(2);
      doc.fontSize(8).font('Helvetica').text('SIGE ERP SaaS - Documento generado automáticamente', { align: 'center' });

      doc.end();
    });
  }
}

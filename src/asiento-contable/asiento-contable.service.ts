import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAsientoDto } from './dto/create-asiento.dto';

@Injectable()
export class AsientoContableService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateAsientoDto) {
    const totalDebe = dto.detalles.filter((d) => d.tipo === 'DEBE').reduce((s, d) => s + d.monto, 0);
    const totalHaber = dto.detalles.filter((d) => d.tipo === 'HABER').reduce((s, d) => s + d.monto, 0);

    if (totalDebe !== totalHaber) {
      throw new BadRequestException(`El asiento no está balanceado: DEBE ${totalDebe} ≠ HABER ${totalHaber}`);
    }

    return this.prisma.asientoContable.create({
      data: {
        idEmpresa,
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
        descripcion: dto.descripcion,
        referencia: dto.referencia,
        detalles: {
          create: dto.detalles.map((d) => ({
            idCuentaContable: d.idCuentaContable,
            tipo: d.tipo,
            monto: d.monto,
            descripcion: d.descripcion,
          })),
        },
      },
      include: { detalles: { include: { cuenta: true } } },
    });
  }

  async findAll(idEmpresa: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.asientoContable.findMany({
        where: { idEmpresa, deletedAt: null },
        include: { detalles: { include: { cuenta: true } } },
        orderBy: { fecha: 'desc' },
        skip, take: limit,
      }),
      this.prisma.asientoContable.count({ where: { idEmpresa, deletedAt: null } }),
    ]);
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }
}

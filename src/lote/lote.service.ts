import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoteDto } from './dto/create-lote.dto';

@Injectable()
export class LoteService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateLoteDto) {
    return this.prisma.lote.create({
      data: {
        idEmpresa,
        idMateriaPrima: dto.idMateriaPrima,
        numeroLote: dto.numeroLote,
        fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : null,
        cantidadInicial: dto.cantidadInicial,
        cantidadActual: dto.cantidadInicial,
      },
      include: { materiaPrima: true },
    });
  }

  async findAll(idEmpresa: string, idMateriaPrima?: string) {
    return this.prisma.lote.findMany({
      where: {
        idEmpresa,
        deletedAt: null,
        ...(idMateriaPrima ? { idMateriaPrima } : {}),
      },
      include: { materiaPrima: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, idEmpresa: string) {
    const item = await this.prisma.lote.findFirst({
      where: { id, idEmpresa, deletedAt: null },
      include: { materiaPrima: true, movimientos: { take: 10, orderBy: { fecha: 'desc' } } },
    });
    if (!item) throw new NotFoundException('Lote no encontrado');
    return item;
  }

  async remove(id: string, idEmpresa: string) {
    await this.findOne(id, idEmpresa);
    return this.prisma.lote.update({
      where: { id },
      data: { deletedAt: new Date(), estado: 'INACTIVO' },
    });
  }
}

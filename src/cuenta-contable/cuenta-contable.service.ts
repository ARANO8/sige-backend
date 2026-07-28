import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCuentaContableDto } from './dto/create-cuenta.dto';

@Injectable()
export class CuentaContableService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateCuentaContableDto) {
    return this.prisma.cuentaContable.create({ data: { idEmpresa, ...dto } });
  }

  async findAll(idEmpresa: string) {
    return this.prisma.cuentaContable.findMany({
      where: { idEmpresa, deletedAt: null },
      include: { hijas: true },
      orderBy: { codigo: 'asc' },
    });
  }

  async findOne(id: string, idEmpresa: string) {
    const item = await this.prisma.cuentaContable.findFirst({
      where: { id, idEmpresa, deletedAt: null },
      include: { padre: true, hijas: true },
    });
    if (!item) throw new NotFoundException('Cuenta contable no encontrada');
    return item;
  }
}

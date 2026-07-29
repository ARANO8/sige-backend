import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';

@Injectable()
export class CargoService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateCargoDto) { return this.prisma.cargo.create({ data: { idEmpresa, ...dto } }); }
  async findAll(idEmpresa: string) { return this.prisma.cargo.findMany({ where: { idEmpresa, deletedAt: null } }); }
  async findOne(id: string, idEmpresa: string) {
    const item = await this.prisma.cargo.findFirst({ where: { id, idEmpresa, deletedAt: null }, include: { empleados: true } });
    if (!item) throw new NotFoundException('Cargo no encontrado'); return item;
  }
  async update(id: string, idEmpresa: string, dto: UpdateCargoDto) {
    await this.findOne(id, idEmpresa);
    return this.prisma.cargo.update({ where: { id }, data: dto });
  }
  async remove(id: string, idEmpresa: string) {
    await this.findOne(id, idEmpresa);
    return this.prisma.cargo.update({ where: { id }, data: { deletedAt: new Date(), estado: 'INACTIVO' } });
  }
}

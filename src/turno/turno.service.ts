import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';

@Injectable()
export class TurnoService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateTurnoDto) { return this.prisma.turno.create({ data: { idEmpresa, ...dto } }); }
  async findAll(idEmpresa: string) { return this.prisma.turno.findMany({ where: { idEmpresa, deletedAt: null } }); }
  async findOne(id: string, idEmpresa: string) {
    const item = await this.prisma.turno.findFirst({ where: { id, idEmpresa, deletedAt: null } });
    if (!item) throw new NotFoundException('Turno no encontrado'); return item;
  }
  async update(id: string, idEmpresa: string, dto: UpdateTurnoDto) {
    await this.findOne(id, idEmpresa);
    return this.prisma.turno.update({ where: { id }, data: dto });
  }
  async remove(id: string, idEmpresa: string) {
    await this.findOne(id, idEmpresa);
    return this.prisma.turno.update({ where: { id }, data: { deletedAt: new Date(), estado: 'INACTIVO' } });
  }
}

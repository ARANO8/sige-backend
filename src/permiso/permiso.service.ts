import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermisoService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permiso.findMany({ where: { deletedAt: null } });
  }
}

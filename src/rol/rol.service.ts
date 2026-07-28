import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRolDto } from './dto/create-rol.dto';

@Injectable()
export class RolService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateRolDto) {
    const rol = await this.prisma.rol.create({
      data: {
        idEmpresa,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
      },
    });

    if (dto.permisos && dto.permisos.length > 0) {
      for (const permisoId of dto.permisos) {
        await this.prisma.rolPermiso.create({
          data: { idRol: rol.id, idPermiso: permisoId },
        });
      }
    }

    return this.prisma.rol.findUnique({
      where: { id: rol.id },
      include: { rolPermisos: { include: { permiso: true } } },
    });
  }

  async findAll(idEmpresa: string) {
    return this.prisma.rol.findMany({
      where: { idEmpresa, deletedAt: null },
      include: { rolPermisos: { include: { permiso: true } } },
    });
  }

  async findOne(id: string, idEmpresa: string) {
    const rol = await this.prisma.rol.findFirst({
      where: { id, idEmpresa, deletedAt: null },
      include: { rolPermisos: { include: { permiso: true } } },
    });
    if (!rol) throw new NotFoundException('Rol no encontrado');
    return rol;
  }

  async update(id: string, idEmpresa: string, dto: Partial<CreateRolDto>) {
    await this.findOne(id, idEmpresa);
    return this.prisma.rol.update({ where: { id }, data: dto });
  }

  async remove(id: string, idEmpresa: string) {
    await this.findOne(id, idEmpresa);
    return this.prisma.rol.update({
      where: { id },
      data: { deletedAt: new Date(), estado: 'INACTIVO' },
    });
  }
}

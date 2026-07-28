import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(private prisma: PrismaService) {}

  async create(idEmpresa: string, dto: CreateUsuarioDto) {
    const existing = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('El email ya está registrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = await this.prisma.usuario.create({
      data: {
        idEmpresa,
        nombre: dto.nombre,
        email: dto.email,
        passwordHash: hash,
      },
    });

    if (dto.roles && dto.roles.length > 0) {
      for (const rolId of dto.roles) {
        await this.prisma.usuarioRol.create({
          data: { idUsuario: usuario.id, idRol: rolId },
        });
      }
    }

    return this.prisma.usuario.findUnique({
      where: { id: usuario.id },
      include: { usuarioRoles: { include: { rol: true } } },
    });
  }

  async findAll(idEmpresa: string) {
    return this.prisma.usuario.findMany({
      where: { idEmpresa, deletedAt: null },
      include: { usuarioRoles: { include: { rol: true } } },
    });
  }

  async findOne(id: string, idEmpresa: string) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id, idEmpresa, deletedAt: null },
      include: { usuarioRoles: { include: { rol: true } } },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async update(id: string, idEmpresa: string, data: Partial<CreateUsuarioDto>) {
    await this.findOne(id, idEmpresa);
    const updateData: any = { ...data };
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
      delete updateData.password;
    }
    delete updateData.roles;
    return this.prisma.usuario.update({ where: { id }, data: updateData });
  }

  async remove(id: string, idEmpresa: string) {
    await this.findOne(id, idEmpresa);
    return this.prisma.usuario.update({
      where: { id },
      data: { deletedAt: new Date(), estado: 'INACTIVO' },
    });
  }
}

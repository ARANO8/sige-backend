import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.empresa.findUnique({
      where: { nit: dto.nit },
    });
    if (existing) throw new ConflictException('El NIT ya está registrado');

    const empresa = await this.prisma.empresa.create({
      data: {
        nit: dto.nit,
        razonSocial: dto.empresaNombre,
        direccion: dto.direccion,
        telefono: dto.telefono,
        email: dto.email,
      },
    });

    const adminRole = await this.prisma.rol.upsert({
      where: { idEmpresa_nombre: { idEmpresa: empresa.id, nombre: 'ADMINISTRADOR' } },
      update: {},
      create: {
        idEmpresa: empresa.id,
        nombre: 'ADMINISTRADOR',
        descripcion: 'Administrador del sistema con todos los permisos',
      },
    });

    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = await this.prisma.usuario.create({
      data: {
        idEmpresa: empresa.id,
        nombre: dto.nombreAdmin,
        email: dto.email,
        passwordHash: hash,
      },
    });

    await this.prisma.usuarioRol.create({
      data: {
        idUsuario: usuario.id,
        idRol: adminRole.id,
      },
    });

    return this.generateTokens(usuario.id, usuario.email, empresa.id, [adminRole.nombre]);
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
      include: {
        empresa: true,
        usuarioRoles: {
          include: { rol: true },
        },
      },
    });

    if (!usuario || usuario.estado !== 'ACTIVO') {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valid = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const roles = usuario.usuarioRoles.map((ur) => ur.rol.nombre);

    return this.generateTokens(usuario.id, usuario.email, usuario.idEmpresa, roles);
  }

  private generateTokens(userId: string, email: string, idEmpresa: string, roles: string[]) {
    const payload = { sub: userId, email, idEmpresa, roles };
    return {
      access_token: this.jwtService.sign(payload),
      usuario: { id: userId, email, idEmpresa, roles: roles.map((nombre) => ({ nombre })) },
    };
  }
}

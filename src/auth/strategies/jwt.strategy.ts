import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  idEmpresa: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'sige-dev-secret-2026',
    });
  }

  async validate(payload: JwtPayload) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: {
        usuarioRoles: {
          include: {
            rol: {
              include: {
                rolPermisos: { include: { permiso: true } },
              },
            },
          },
        },
      },
    });

    if (!usuario || usuario.estado !== 'ACTIVO') {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      idEmpresa: usuario.idEmpresa,
      roles: usuario.usuarioRoles.map((ur) => ({
        id: ur.rol.id,
        nombre: ur.rol.nombre,
      })),
      permisos: usuario.usuarioRoles.flatMap((ur) =>
        ur.rol.rolPermisos.map((rp) => rp.permiso.codigo),
      ),
    };
  }
}

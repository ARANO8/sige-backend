import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmpresaModule } from './empresa/empresa.module';
import { UsuarioModule } from './usuario/usuario.module';
import { RolModule } from './rol/rol.module';
import { PermisoModule } from './permiso/permiso.module';
import { CategoriaModule } from './categoria/categoria.module';
import { UnidadMedidaModule } from './unidad-medida/unidad-medida.module';
import { MateriaPrimaModule } from './materia-prima/materia-prima.module';
import { ProductoModule } from './producto/producto.module';
import { AlmacenModule } from './almacen/almacen.module';
import { StockModule } from './stock/stock.module';
import { MovimientoInventarioModule } from './movimiento-inventario/movimiento-inventario.module';
import { LoteModule } from './lote/lote.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EmpresaModule,
    UsuarioModule,
    RolModule,
    PermisoModule,
    CategoriaModule,
    UnidadMedidaModule,
    MateriaPrimaModule,
    ProductoModule,
    AlmacenModule,
    StockModule,
    MovimientoInventarioModule,
    LoteModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

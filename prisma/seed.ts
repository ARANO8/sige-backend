import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log('🌱 Iniciando seed...');

  const permisosData = [
    { codigo: 'EMPRESA_CREAR', nombre: 'Crear empresa', descripcion: 'Permite registrar nuevas empresas en el sistema' },
    { codigo: 'EMPRESA_VER', nombre: 'Ver empresa', descripcion: 'Permite consultar información de la empresa' },
    { codigo: 'EMPRESA_EDITAR', nombre: 'Editar empresa', descripcion: 'Permite modificar datos de la empresa' },
    { codigo: 'USUARIO_CREAR', nombre: 'Crear usuario', descripcion: 'Permite registrar nuevos usuarios' },
    { codigo: 'USUARIO_VER', nombre: 'Ver usuarios', descripcion: 'Permite listar y consultar usuarios' },
    { codigo: 'USUARIO_EDITAR', nombre: 'Editar usuario', descripcion: 'Permite modificar datos de usuarios' },
    { codigo: 'USUARIO_ELIMINAR', nombre: 'Eliminar usuario', descripcion: 'Permite desactivar usuarios' },
    { codigo: 'ROL_CREAR', nombre: 'Crear rol', descripcion: 'Permite crear nuevos roles' },
    { codigo: 'ROL_VER', nombre: 'Ver roles', descripcion: 'Permite listar roles' },
    { codigo: 'ROL_EDITAR', nombre: 'Editar rol', descripcion: 'Permite modificar roles' },
    { codigo: 'PRODUCTO_CREAR', nombre: 'Crear producto', descripcion: 'Permite registrar productos terminados' },
    { codigo: 'PRODUCTO_VER', nombre: 'Ver productos', descripcion: 'Permite consultar productos' },
    { codigo: 'PRODUCTO_EDITAR', nombre: 'Editar producto', descripcion: 'Permite modificar productos' },
    { codigo: 'MATERIA_PRIMA_CREAR', nombre: 'Crear materia prima', descripcion: 'Permite registrar materias primas' },
    { codigo: 'MATERIA_PRIMA_VER', nombre: 'Ver materias primas', descripcion: 'Permite consultar materias primas' },
    { codigo: 'MATERIA_PRIMA_EDITAR', nombre: 'Editar materia prima', descripcion: 'Permite modificar materias primas' },
    { codigo: 'STOCK_VER', nombre: 'Ver stock', descripcion: 'Permite consultar el inventario' },
    { codigo: 'MOVIMIENTO_CREAR', nombre: 'Registrar movimiento', descripcion: 'Permite registrar entradas y salidas' },
    { codigo: 'LOTE_CREAR', nombre: 'Crear lote', descripcion: 'Permite registrar lotes' },
    { codigo: 'LOTE_VER', nombre: 'Ver lotes', descripcion: 'Permite consultar lotes' },
    { codigo: 'BOM_CREAR', nombre: 'Crear BOM', descripcion: 'Permite crear listas de materiales' },
    { codigo: 'BOM_VER', nombre: 'Ver BOM', descripcion: 'Permite consultar BOMs' },
    { codigo: 'ORDEN_PROD_CREAR', nombre: 'Crear OP', descripcion: 'Permite crear órdenes de producción' },
    { codigo: 'ORDEN_PROD_VER', nombre: 'Ver OP', descripcion: 'Permite consultar órdenes de producción' },
    { codigo: 'ORDEN_PROD_FINALIZAR', nombre: 'Finalizar OP', descripcion: 'Permite finalizar órdenes de producción' },
    { codigo: 'PROVEEDOR_CREAR', nombre: 'Crear proveedor', descripcion: 'Permite registrar proveedores' },
    { codigo: 'PROVEEDOR_VER', nombre: 'Ver proveedores', descripcion: 'Permite consultar proveedores' },
    { codigo: 'ORDEN_COMPRA_CREAR', nombre: 'Crear OC', descripcion: 'Permite crear órdenes de compra' },
    { codigo: 'ORDEN_COMPRA_VER', nombre: 'Ver OC', descripcion: 'Permite consultar órdenes de compra' },
    { codigo: 'RECEPCION_CREAR', nombre: 'Recepcionar', descripcion: 'Permite registrar recepción de compras' },
    { codigo: 'CLIENTE_CREAR', nombre: 'Crear cliente', descripcion: 'Permite registrar clientes' },
    { codigo: 'CLIENTE_VER', nombre: 'Ver clientes', descripcion: 'Permite consultar clientes' },
    { codigo: 'VENTA_CREAR', nombre: 'Crear venta', descripcion: 'Permite registrar ventas' },
    { codigo: 'VENTA_VER', nombre: 'Ver ventas', descripcion: 'Permite consultar ventas' },
    { codigo: 'FACTURA_VER', nombre: 'Ver facturas', descripcion: 'Permite consultar facturas' },
    { codigo: 'ASIENTO_VER', nombre: 'Ver asientos', descripcion: 'Permite consultar asientos contables' },
    { codigo: 'REPORTE_VER', nombre: 'Ver reportes', descripcion: 'Permite acceder a reportes' },
    { codigo: 'EMPLEADO_CREAR', nombre: 'Crear empleado', descripcion: 'Permite registrar empleados' },
    { codigo: 'EMPLEADO_VER', nombre: 'Ver empleados', descripcion: 'Permite consultar empleados' },
    { codigo: 'TURNO_CREAR', nombre: 'Crear turno', descripcion: 'Permite crear turnos' },
    { codigo: 'HORAS_REGISTRAR', nombre: 'Registrar horas', descripcion: 'Permite registrar horas trabajadas' },
  ];

  console.log('  Creando permisos...');
  for (const p of permisosData) {
    await prisma.permiso.upsert({
      where: { codigo: p.codigo },
      update: {},
      create: p,
    });
  }

  const allPermisos = await prisma.permiso.findMany();
  const allPermisosIds = allPermisos.map((p) => p.id);

  const empresaDemo = await prisma.empresa.upsert({
    where: { nit: 'DEMO-001' },
    update: {},
    create: {
      nit: 'DEMO-001',
      razonSocial: 'Empresa Demo S.A.',
      direccion: 'Av. Principal #123',
      telefono: '555-0100',
      email: 'demo@empresa.com',
    },
  });

  console.log(`  Empresa demo: ${empresaDemo.razonSocial} (${empresaDemo.id})`);

  const rolesData = [
    { nombre: 'ADMINISTRADOR', descripcion: 'Acceso total al sistema' },
    { nombre: 'JEFE_PRODUCCION', descripcion: 'Gestiona producción y BOMs' },
    { nombre: 'RESPONSABLE_INVENTARIOS', descripcion: 'Controla inventarios y materias primas' },
    { nombre: 'RESPONSABLE_COMPRAS', descripcion: 'Gestiona compras y proveedores' },
    { nombre: 'RESPONSABLE_VENTAS', descripcion: 'Gestiona ventas y clientes' },
    { nombre: 'CONTADOR', descripcion: 'Acceso a contabilidad y reportes' },
    { nombre: 'GERENTE', descripcion: 'Acceso a reportes y dashboard' },
  ];

  for (const r of rolesData) {
    const rol = await prisma.rol.upsert({
      where: { idEmpresa_nombre: { idEmpresa: empresaDemo.id, nombre: r.nombre } },
      update: {},
      create: {
        idEmpresa: empresaDemo.id,
        nombre: r.nombre,
        descripcion: r.descripcion,
      },
    });

    await prisma.rolPermiso.deleteMany({ where: { idRol: rol.id } });

    if (r.nombre === 'ADMINISTRADOR') {
      for (const permisoId of allPermisosIds) {
        await prisma.rolPermiso.create({ data: { idRol: rol.id, idPermiso: permisoId } });
      }
    } else if (r.nombre === 'JEFE_PRODUCCION') {
      const prodPermisos = allPermisos.filter((p) =>
        ['BOM_', 'ORDEN_PROD_', 'PRODUCTO_', 'MATERIA_PRIMA_'].some((prefix) =>
          p.codigo.startsWith(prefix),
        ),
      );
      for (const p of prodPermisos) {
        await prisma.rolPermiso.create({ data: { idRol: rol.id, idPermiso: p.id } });
      }
    } else if (r.nombre === 'RESPONSABLE_INVENTARIOS') {
      const invPermisos = allPermisos.filter((p) =>
        ['PRODUCTO_', 'MATERIA_PRIMA_', 'STOCK_', 'MOVIMIENTO_', 'LOTE_'].some((prefix) =>
          p.codigo.startsWith(prefix),
        ),
      );
      for (const p of invPermisos) {
        await prisma.rolPermiso.create({ data: { idRol: rol.id, idPermiso: p.id } });
      }
    } else if (r.nombre === 'RESPONSABLE_COMPRAS') {
      const compPermisos = allPermisos.filter((p) =>
        ['PROVEEDOR_', 'ORDEN_COMPRA_', 'RECEPCION_'].some((prefix) =>
          p.codigo.startsWith(prefix),
        ),
      );
      for (const p of compPermisos) {
        await prisma.rolPermiso.create({ data: { idRol: rol.id, idPermiso: p.id } });
      }
    } else if (r.nombre === 'RESPONSABLE_VENTAS') {
      const ventPermisos = allPermisos.filter((p) =>
        ['CLIENTE_', 'VENTA_', 'FACTURA_'].some((prefix) => p.codigo.startsWith(prefix)),
      );
      for (const p of ventPermisos) {
        await prisma.rolPermiso.create({ data: { idRol: rol.id, idPermiso: p.id } });
      }
    } else if (r.nombre === 'CONTADOR' || r.nombre === 'GERENTE') {
      const reportPermisos = allPermisos.filter((p) =>
        ['ASIENTO_', 'REPORTE_', 'STOCK_', 'VENTA_VER', 'ORDEN_COMPRA_VER', 'ORDEN_PROD_VER'].some(
          (prefix) => p.codigo.startsWith(prefix) || p.codigo === prefix,
        ),
      );
      for (const p of reportPermisos) {
        await prisma.rolPermiso.create({ data: { idRol: rol.id, idPermiso: p.id } });
      }
    }
  }

  const adminRol = await prisma.rol.findFirst({
    where: { idEmpresa: empresaDemo.id, nombre: 'ADMINISTRADOR' },
  });

  if (adminRol) {
    const adminUser = await prisma.usuario.upsert({
      where: { email: 'admin@demo.com' },
      update: {},
      create: {
        idEmpresa: empresaDemo.id,
        nombre: 'Admin Demo',
        email: 'admin@demo.com',
        passwordHash: await bcrypt.hash('admin123', 10),
      },
    });

    await prisma.usuarioRol.deleteMany({
      where: { idUsuario: adminUser.id, idRol: adminRol.id },
    });
    await prisma.usuarioRol.create({
      data: { idUsuario: adminUser.id, idRol: adminRol.id },
    });

    console.log(`  Usuario admin: admin@demo.com / admin123`);
  }

  console.log('✅ Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

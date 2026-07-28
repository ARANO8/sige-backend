import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

type EmpresaSeed = {
  codigo: string;
  nit: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  email: string;
  usuarios: Array<{ nombre: string; email: string; password: string; rol: string }>;
  categorias: Array<{ nombre: string; descripcion?: string }>;
  unidadesMedida: Array<{ nombre: string; abreviatura: string }>;
  almacenes: Array<{ nombre: string; ubicacion: string }>;
  materiasPrimas: Array<{
    codigo: string; nombre: string; categoria: string; unidad: string;
    costoUnitario: number; stockMinimo: number; stockInicial: number;
    lotes: Array<{ numero: string; cantidad: number }>;
  }>;
  productos: Array<{
    codigo: string; nombre: string; categoria: string; unidad: string;
    precioVenta: number; costoEstandar: number; stockMinimo: number;
  }>;
  boms: Array<{
    nombre: string; idProducto: string; detalles: Array<{ idMateriaPrima: string; cantidad: number }>;
  }>;
  proveedores: Array<{ nombre: string; nit: string; telefono: string }>;
  clientes: Array<{ nombre: string; nit: string; telefono: string }>;
  empleados: Array<{ nombre: string; apellido: string; cargo: string; email: string }>;
  cargos: Array<{ nombre: string; salarioBase: number }>;
  cuentasContables: Array<{ codigo: string; nombre: string; tipo: string; nivel: number; idPadre?: string }>;
};

async function seedEmpresa(config: EmpresaSeed) {
  console.log(`\n🏭 ${config.razonSocial}...`);

  const empresa = await prisma.empresa.upsert({
    where: { nit: config.nit },
    update: {},
    create: {
      nit: config.nit,
      razonSocial: config.razonSocial,
      direccion: config.direccion,
      telefono: config.telefono,
      email: config.email,
    },
  });
  const eid = empresa.id;
  console.log(`  Empresa creada: ${config.razonSocial}`);

  const rolesData = [
    { nombre: 'ADMINISTRADOR', descripcion: 'Acceso total al sistema' },
    { nombre: 'JEFE_PRODUCCION', descripcion: 'Gestiona producción y BOMs' },
    { nombre: 'RESPONSABLE_INVENTARIOS', descripcion: 'Controla inventarios y materias primas' },
    { nombre: 'RESPONSABLE_COMPRAS', descripcion: 'Gestiona compras y proveedores' },
    { nombre: 'RESPONSABLE_VENTAS', descripcion: 'Gestiona ventas y clientes' },
    { nombre: 'CONTADOR', descripcion: 'Acceso a contabilidad y reportes' },
    { nombre: 'GERENTE', descripcion: 'Acceso a reportes y dashboard' },
  ];

  const allPermisos = await prisma.permiso.findMany();
  const allPermisosIds = allPermisos.map((p) => p.id);
  const rolesMap: Record<string, any> = {};

  for (const r of rolesData) {
    const rol = await prisma.rol.upsert({
      where: { idEmpresa_nombre: { idEmpresa: eid, nombre: r.nombre } },
      update: {},
      create: { idEmpresa: eid, nombre: r.nombre, descripcion: r.descripcion },
    });
    rolesMap[r.nombre] = rol;

    await prisma.rolPermiso.deleteMany({ where: { idRol: rol.id } });

    if (r.nombre === 'ADMINISTRADOR') {
      for (const pid of allPermisosIds) await prisma.rolPermiso.create({ data: { idRol: rol.id, idPermiso: pid } });
    } else if (r.nombre === 'JEFE_PRODUCCION') {
      const ps = allPermisos.filter((p) => ['BOM_', 'ORDEN_PROD_', 'PRODUCTO_', 'MATERIA_PRIMA_'].some((pre) => p.codigo.startsWith(pre)));
      for (const p of ps) await prisma.rolPermiso.create({ data: { idRol: rol.id, idPermiso: p.id } });
    } else if (r.nombre === 'RESPONSABLE_INVENTARIOS') {
      const ps = allPermisos.filter((p) => ['PRODUCTO_', 'MATERIA_PRIMA_', 'STOCK_', 'MOVIMIENTO_', 'LOTE_'].some((pre) => p.codigo.startsWith(pre)));
      for (const p of ps) await prisma.rolPermiso.create({ data: { idRol: rol.id, idPermiso: p.id } });
    } else if (r.nombre === 'RESPONSABLE_COMPRAS') {
      const ps = allPermisos.filter((p) => ['PROVEEDOR_', 'ORDEN_COMPRA_', 'RECEPCION_'].some((pre) => p.codigo.startsWith(pre)));
      for (const p of ps) await prisma.rolPermiso.create({ data: { idRol: rol.id, idPermiso: p.id } });
    } else if (r.nombre === 'RESPONSABLE_VENTAS') {
      const ps = allPermisos.filter((p) => ['CLIENTE_', 'VENTA_', 'FACTURA_'].some((pre) => p.codigo.startsWith(pre)));
      for (const p of ps) await prisma.rolPermiso.create({ data: { idRol: rol.id, idPermiso: p.id } });
    } else {
      const ps = allPermisos.filter((p) =>
        ['ASIENTO_', 'REPORTE_', 'STOCK_', 'VENTA_VER', 'ORDEN_COMPRA_VER', 'ORDEN_PROD_VER'].some((pre) => p.codigo.startsWith(pre) || p.codigo === pre),
      );
      for (const p of ps) await prisma.rolPermiso.create({ data: { idRol: rol.id, idPermiso: p.id } });
    }
  }

  for (const u of config.usuarios) {
    const user = await prisma.usuario.upsert({
      where: { email: u.email },
      update: {},
      create: {
        idEmpresa: eid, nombre: u.nombre, email: u.email,
        passwordHash: await bcrypt.hash(u.password, 10),
      },
    });
    const rol = rolesMap[u.rol];
    if (rol) {
      await prisma.usuarioRol.deleteMany({ where: { idUsuario: user.id, idRol: rol.id } });
      await prisma.usuarioRol.create({ data: { idUsuario: user.id, idRol: rol.id } });
    }
  }
  console.log(`  Usuarios: ${config.usuarios.map((u) => `${u.email}/${u.password}`).join(', ')}`);

  const catMap: Record<string, string> = {};
  for (const c of config.categorias) {
    const cat = await prisma.categoria.upsert({
      where: { idEmpresa_nombre: { idEmpresa: eid, nombre: c.nombre } },
      update: {}, create: { idEmpresa: eid, ...c },
    });
    catMap[c.nombre] = cat.id;
  }

  const umMap: Record<string, string> = {};
  for (const u of config.unidadesMedida) {
    const um = await prisma.unidadMedida.upsert({
      where: { idEmpresa_nombre: { idEmpresa: eid, nombre: u.nombre } },
      update: {}, create: { idEmpresa: eid, ...u },
    });
    umMap[u.nombre] = um.id;
  }

  const almMap: Record<string, string> = {};
  for (const a of config.almacenes) {
    const alm = await prisma.almacen.upsert({
      where: { idEmpresa_nombre: { idEmpresa: eid, nombre: a.nombre } },
      update: {}, create: { idEmpresa: eid, ...a },
    });
    almMap[a.nombre] = alm.id;
  }

  const mpMap: Record<string, string> = {};
  for (const mp of config.materiasPrimas) {
    const created = await prisma.materiaPrima.upsert({
      where: { idEmpresa_codigo: { idEmpresa: eid, codigo: mp.codigo } },
      update: {},
      create: {
        idEmpresa: eid, codigo: mp.codigo, nombre: mp.nombre,
        idCategoria: catMap[mp.categoria], idUnidadMedida: umMap[mp.unidad],
        costoUnitario: mp.costoUnitario, stockMinimo: mp.stockMinimo,
      },
    });
    mpMap[mp.codigo] = created.id;

    for (const lote of mp.lotes) {
      await prisma.lote.upsert({
        where: { idEmpresa_numeroLote: { idEmpresa: eid, numeroLote: lote.numero } },
        update: {},
        create: {
          idEmpresa: eid, idMateriaPrima: created.id, numeroLote: lote.numero,
          cantidadInicial: lote.cantidad, cantidadActual: lote.cantidad,
          fechaVencimiento: new Date(Date.now() + 180 * 86400000),
        },
      });
    }

    if (mp.stockInicial > 0 && config.almacenes[0]) {
      const almId = almMap[config.almacenes[0].nombre];
      await prisma.stock.upsert({
        where: {
          idEmpresa_idAlmacen_idProducto_idMateriaPrima: {
            idEmpresa: eid, idAlmacen: almId, idProducto: '', idMateriaPrima: created.id,
          },
        },
        update: {},
        create: { idEmpresa: eid, idAlmacen: almId, idMateriaPrima: created.id, cantidad: mp.stockInicial },
      });
    }
  }

  const prodMap: Record<string, string> = {};
  for (const p of config.productos) {
    const created = await prisma.producto.upsert({
      where: { idEmpresa_codigo: { idEmpresa: eid, codigo: p.codigo } },
      update: {},
      create: {
        idEmpresa: eid, codigo: p.codigo, nombre: p.nombre,
        idCategoria: catMap[p.categoria], idUnidadMedida: umMap[p.unidad],
        precioVenta: p.precioVenta, costoEstandar: p.costoEstandar, stockMinimo: p.stockMinimo,
      },
    });
    prodMap[p.codigo] = created.id;
  }

  const provMap: Record<string, string> = {};
  for (const p of config.proveedores) {
    const created = await prisma.proveedor.upsert({
      where: { idEmpresa_nit: { idEmpresa: eid, nit: p.nit } },
      update: {},
      create: { idEmpresa: eid, ...p },
    });
    provMap[p.nombre] = created.id;
  }

  const cliMap: Record<string, string> = {};
  for (const c of config.clientes) {
    const created = await prisma.cliente.upsert({
      where: { idEmpresa_nit: { idEmpresa: eid, nit: c.nit } },
      update: {},
      create: { idEmpresa: eid, ...c },
    });
    cliMap[c.nombre] = created.id;
  }

  for (const b of config.boms) {
    const productoId = prodMap[b.idProducto];
    if (!productoId) continue;
    const existing = await prisma.bOM.findFirst({
      where: { idEmpresa: eid, idProducto: productoId },
    });
    if (existing) continue;
    const bom = await prisma.bOM.create({
      data: {
        idEmpresa: eid, idProducto: productoId,
        nombre: b.nombre, version: 1,
        detalles: {
          create: b.detalles.map((d) => ({
            idMateriaPrima: mpMap[d.idMateriaPrima], cantidad: d.cantidad, secuencia: 1,
          })),
        },
      },
    });
    console.log(`  BOM: ${b.nombre} (v${bom.version})`);
  }

  const cargosMap: Record<string, string> = {};
  for (const c of config.cargos) {
    const created = await prisma.cargo.upsert({
      where: { idEmpresa_nombre: { idEmpresa: eid, nombre: c.nombre } },
      update: {},
      create: { idEmpresa: eid, ...c },
    });
    cargosMap[c.nombre] = created.id;
  }

  for (const e of config.empleados) {
    const existing = await prisma.empleado.findFirst({ where: { idEmpresa: eid, email: e.email } });
    if (!existing) {
      await prisma.empleado.create({
        data: { idEmpresa: eid, nombre: e.nombre, apellido: e.apellido, email: e.email, idCargo: cargosMap[e.cargo] },
      });
    }
  }

  for (const t of ['Mañana 06:00-14:00', 'Tarde 14:00-22:00', 'Noche 22:00-06:00']) {
    const existing = await prisma.turno.findFirst({ where: { idEmpresa: eid, nombre: t } });
    if (!existing) {
      await prisma.turno.create({
        data: { idEmpresa: eid, nombre: t, horaInicio: t.includes('06:00') ? '06:00' : t.includes('14:00') ? '14:00' : '22:00', horaFin: t.includes('06:00') ? '14:00' : t.includes('14:00') ? '22:00' : '06:00' },
      });
    }
  }

  const cuentaIds: Record<string, string> = {};
  for (const c of config.cuentasContables.sort((a, b) => a.nivel - b.nivel || a.codigo.localeCompare(b.codigo))) {
    const existing = await prisma.cuentaContable.findFirst({ where: { idEmpresa: eid, codigo: c.codigo } });
    if (!existing) {
      const created = await prisma.cuentaContable.create({
        data: {
          idEmpresa: eid, codigo: c.codigo, nombre: c.nombre,
          tipo: c.tipo, nivel: c.nivel,
          idPadre: c.idPadre ? cuentaIds[c.idPadre] : undefined,
        },
      });
      cuentaIds[c.codigo] = created.id;
    } else {
      cuentaIds[c.codigo] = existing.id;
    }
  }

  if (config.productos.length > 0) {
    const prodPri = prodMap[config.productos[0].codigo];
    if (prodPri) {
      const opCount = await prisma.ordenProduccion.count({ where: { idEmpresa: eid } });
      if (opCount === 0) {
        const op = await prisma.ordenProduccion.create({
          data: {
            idEmpresa: eid, idProducto: prodPri,
            cantidadPlanificada: 100, cantidadProducida: 100,
            estado: 'COMPLETADA',
            fechaInicio: new Date(Date.now() - 7 * 86400000),
            fechaFin: new Date(Date.now() - 5 * 86400000),
          },
        });
        if (config.productos.length > 1) {
          const prodSec = prodMap[config.productos[1].codigo];
          if (prodSec) {
            await prisma.ordenProduccion.create({
              data: {
                idEmpresa: eid, idProducto: prodSec,
                cantidadPlanificada: 50, estado: 'EN_PROCESO',
                fechaInicio: new Date(Date.now() - 2 * 86400000),
              },
            });
          }
        }
        console.log(`  OP demo: ${config.productos[0].nombre} (COMPLETADA) + 1 EN_PROCESO`);
      }
    }
  }

  if (config.proveedores.length > 0 && config.materiasPrimas.length > 0) {
    const ocCount = await prisma.ordenCompra.count({ where: { idEmpresa: eid } });
    if (ocCount === 0) {
      const provId = provMap[config.proveedores[0].nombre];
      const mpPri = mpMap[config.materiasPrimas[0].codigo];
      if (provId && mpPri) {
        const ocRecibida = await prisma.ordenCompra.create({
          data: {
            idEmpresa: eid, idProveedor: provId, total: 1500, estado: 'RECIBIDA',
            fecha: new Date(Date.now() - 10 * 86400000),
            detalles: { create: { idMateriaPrima: mpPri, cantidad: 100, precioUnitario: 15, subtotal: 1500 } },
          },
        });
        await prisma.recepcionCompra.create({
          data: { idOrdenCompra: ocRecibida.id, idMateriaPrima: mpPri, cantidadRecibida: 100 },
        });
        const almId = almMap[config.almacenes[0].nombre];
        if (almId) {
          await prisma.stock.upsert({
            where: { idEmpresa_idAlmacen_idProducto_idMateriaPrima: { idEmpresa: eid, idAlmacen: almId, idProducto: '', idMateriaPrima: mpPri } },
            update: { cantidad: { increment: 100 } },
            create: { idEmpresa: eid, idAlmacen: almId, idMateriaPrima: mpPri, cantidad: 100 },
          });
        }
        if (config.proveedores.length > 1) {
          const prov2 = provMap[config.proveedores[1].nombre];
          if (prov2) {
            await prisma.ordenCompra.create({
              data: {
                idEmpresa: eid, idProveedor: prov2, total: 800, estado: 'SOLICITADA',
                detalles: { create: { idMateriaPrima: mpPri, cantidad: 50, precioUnitario: 16, subtotal: 800 } },
              },
            });
          }
        }
        console.log('  OC demo: 1 RECIBIDA + 1 SOLICITADA');
      }
    }
  }

  if (config.clientes.length > 0 && config.productos.length > 0) {
    const ventaCount = await prisma.venta.count({ where: { idEmpresa: eid } });
    if (ventaCount === 0) {
      const cliId = cliMap[config.clientes[0].nombre];
      const prodPri = prodMap[config.productos[0].codigo];
      if (cliId && prodPri) {
        const almId = almMap[config.almacenes[0].nombre];
        const stockVenta = await prisma.stock.findFirst({ where: { idEmpresa: eid, idProducto: prodPri } });
        const qty = stockVenta && Number(stockVenta.cantidad) >= 10 ? 10 : 5;

        const venta = await prisma.venta.create({
          data: {
            idEmpresa: eid, idCliente: cliId, total: 50 * qty, estado: 'FACTURADA',
            detalles: { create: { idProducto: prodPri, cantidad: qty, precioUnitario: 50, subtotal: 50 * qty } },
            factura: { create: { idEmpresa: eid, numero: '00000001', total: 50 * qty } },
          },
        });

        if (almId) {
          const existing = await prisma.stock.findFirst({ where: { idEmpresa: eid, idProducto: prodPri, idAlmacen: almId } });
          if (existing) {
            const newQty = Math.max(0, Number(existing.cantidad) - qty);
            await prisma.stock.update({ where: { id: existing.id }, data: { cantidad: newQty } });
          }
        }
        console.log('  Venta demo: 1 FACTURADA');
      }
    }
  }
}

async function main() {
  console.log('🌱 SIGE ERP - Seed Completo');
  console.log('================================');
  const startTime = Date.now();

  const permisosData = [
    { codigo: 'EMPRESA_CREAR', nombre: 'Crear empresa' },
    { codigo: 'EMPRESA_VER', nombre: 'Ver empresa' },
    { codigo: 'EMPRESA_EDITAR', nombre: 'Editar empresa' },
    { codigo: 'USUARIO_CREAR', nombre: 'Crear usuario' },
    { codigo: 'USUARIO_VER', nombre: 'Ver usuarios' },
    { codigo: 'USUARIO_EDITAR', nombre: 'Editar usuario' },
    { codigo: 'USUARIO_ELIMINAR', nombre: 'Eliminar usuario' },
    { codigo: 'ROL_CREAR', nombre: 'Crear rol' },
    { codigo: 'ROL_VER', nombre: 'Ver roles' },
    { codigo: 'ROL_EDITAR', nombre: 'Editar rol' },
    { codigo: 'PRODUCTO_CREAR', nombre: 'Crear producto' },
    { codigo: 'PRODUCTO_VER', nombre: 'Ver productos' },
    { codigo: 'PRODUCTO_EDITAR', nombre: 'Editar producto' },
    { codigo: 'MATERIA_PRIMA_CREAR', nombre: 'Crear materia prima' },
    { codigo: 'MATERIA_PRIMA_VER', nombre: 'Ver materias primas' },
    { codigo: 'MATERIA_PRIMA_EDITAR', nombre: 'Editar materia prima' },
    { codigo: 'STOCK_VER', nombre: 'Ver stock' },
    { codigo: 'MOVIMIENTO_CREAR', nombre: 'Registrar movimiento' },
    { codigo: 'LOTE_CREAR', nombre: 'Crear lote' },
    { codigo: 'LOTE_VER', nombre: 'Ver lotes' },
    { codigo: 'BOM_CREAR', nombre: 'Crear BOM' },
    { codigo: 'BOM_VER', nombre: 'Ver BOM' },
    { codigo: 'ORDEN_PROD_CREAR', nombre: 'Crear OP' },
    { codigo: 'ORDEN_PROD_VER', nombre: 'Ver OP' },
    { codigo: 'ORDEN_PROD_FINALIZAR', nombre: 'Finalizar OP' },
    { codigo: 'PROVEEDOR_CREAR', nombre: 'Crear proveedor' },
    { codigo: 'PROVEEDOR_VER', nombre: 'Ver proveedores' },
    { codigo: 'ORDEN_COMPRA_CREAR', nombre: 'Crear OC' },
    { codigo: 'ORDEN_COMPRA_VER', nombre: 'Ver OC' },
    { codigo: 'RECEPCION_CREAR', nombre: 'Recepcionar' },
    { codigo: 'CLIENTE_CREAR', nombre: 'Crear cliente' },
    { codigo: 'CLIENTE_VER', nombre: 'Ver clientes' },
    { codigo: 'VENTA_CREAR', nombre: 'Crear venta' },
    { codigo: 'VENTA_VER', nombre: 'Ver ventas' },
    { codigo: 'FACTURA_VER', nombre: 'Ver facturas' },
    { codigo: 'ASIENTO_VER', nombre: 'Ver asientos' },
    { codigo: 'REPORTE_VER', nombre: 'Ver reportes' },
    { codigo: 'EMPLEADO_CREAR', nombre: 'Crear empleado' },
    { codigo: 'EMPLEADO_VER', nombre: 'Ver empleados' },
    { codigo: 'TURNO_CREAR', nombre: 'Crear turno' },
    { codigo: 'HORAS_REGISTRAR', nombre: 'Registrar horas' },
  ];

  for (const p of permisosData) {
    await prisma.permiso.upsert({ where: { codigo: p.codigo }, update: {}, create: { ...p, descripcion: '' } });
  }
  console.log(`✅ ${permisosData.length} permisos globales creados`);

  // ======== CBN - Cervecería Boliviana Nacional ========
  await seedEmpresa({
    codigo: 'CBN',
    nit: 'CBN-10001',
    razonSocial: 'Cervecería Boliviana Nacional S.A.',
    direccion: 'Av. Perú #245, Zona Central, La Paz',
    telefono: '2-2456789',
    email: 'info@cbn.com.bo',
    usuarios: [
      { nombre: 'Admin CBN', email: 'admin@cbn.com', password: 'cbn123', rol: 'ADMINISTRADOR' },
      { nombre: 'Carlos Mamani', email: 'produccion@cbn.com', password: 'cbn123', rol: 'JEFE_PRODUCCION' },
      { nombre: 'Rosa Quispe', email: 'inventarios@cbn.com', password: 'cbn123', rol: 'RESPONSABLE_INVENTARIOS' },
      { nombre: 'Pedro Garcia', email: 'compras@cbn.com', password: 'cbn123', rol: 'RESPONSABLE_COMPRAS' },
      { nombre: 'Ana Lopez', email: 'ventas@cbn.com', password: 'cbn123', rol: 'RESPONSABLE_VENTAS' },
    ],
    categorias: [
      { nombre: 'Granos y Malta', descripcion: 'Insumos base para la cerveza' },
      { nombre: 'Lúpulos y Levaduras', descripcion: 'Ingredientes activos' },
      { nombre: 'Envases', descripcion: 'Botellas, latas y tapas' },
      { nombre: 'Etiquetas y Empaques', descripcion: 'Material de empaquetado' },
      { nombre: 'Cervezas Premium', descripcion: 'Productos terminados' },
    ],
    unidadesMedida: [
      { nombre: 'Kilogramo', abreviatura: 'kg' },
      { nombre: 'Litro', abreviatura: 'L' },
      { nombre: 'Unidad', abreviatura: 'u' },
      { nombre: 'Caja x12', abreviatura: 'caja' },
      { nombre: 'Saco', abreviatura: 'saco' },
      { nombre: 'Millar', abreviatura: 'mil' },
    ],
    almacenes: [
      { nombre: 'Almacén Central CBN', ubicacion: 'Planta La Paz - Nave 1' },
      { nombre: 'Cámara Fría', ubicacion: 'Planta La Paz - Sótano' },
      { nombre: 'Bodega Producto Terminado', ubicacion: 'Planta La Paz - Nave 2' },
    ],
    materiasPrimas: [
      { codigo: 'CBN-MAL-001', nombre: 'Malta de Cebada Premium', categoria: 'Granos y Malta', unidad: 'Kilogramo', costoUnitario: 8.50, stockMinimo: 500, stockInicial: 2000, lotes: [{ numero: 'MAL-2026-001', cantidad: 1000 }, { numero: 'MAL-2026-002', cantidad: 1000 }] },
      { codigo: 'CBN-LUP-001', nombre: 'Lúpulo Cascade', categoria: 'Lúpulos y Levaduras', unidad: 'Kilogramo', costoUnitario: 35.00, stockMinimo: 50, stockInicial: 200, lotes: [{ numero: 'LUP-2026-001', cantidad: 100 }, { numero: 'LUP-2026-002', cantidad: 100 }] },
      { codigo: 'CBN-LEV-001', nombre: 'Levadura Lager', categoria: 'Lúpulos y Levaduras', unidad: 'Kilogramo', costoUnitario: 22.00, stockMinimo: 20, stockInicial: 80, lotes: [{ numero: 'LEV-2026-001', cantidad: 40 }, { numero: 'LEV-2026-002', cantidad: 40 }] },
      { codigo: 'CBN-AGU-001', nombre: 'Agua Tratada', categoria: 'Granos y Malta', unidad: 'Litro', costoUnitario: 0.50, stockMinimo: 5000, stockInicial: 15000, lotes: [{ numero: 'AGU-2026-001', cantidad: 15000 }] },
      { codigo: 'CBN-BOT-001', nombre: 'Botella Retornable 620ml', categoria: 'Envases', unidad: 'Unidad', costoUnitario: 1.20, stockMinimo: 5000, stockInicial: 20000, lotes: [{ numero: 'BOT-2026-001', cantidad: 10000 }, { numero: 'BOT-2026-002', cantidad: 10000 }] },
      { codigo: 'CBN-TAP-001', nombre: 'Tapa Corona', categoria: 'Envases', unidad: 'Millar', costoUnitario: 0.80, stockMinimo: 100, stockInicial: 500, lotes: [{ numero: 'TAP-2026-001', cantidad: 500 }] },
      { codigo: 'CBN-ETI-001', nombre: 'Etiqueta Paceña', categoria: 'Etiquetas y Empaques', unidad: 'Millar', costoUnitario: 0.30, stockMinimo: 200, stockInicial: 800, lotes: [{ numero: 'ETI-2026-001', cantidad: 800 }] },
      { codigo: 'CBN-CAJ-001', nombre: 'Caja Cartón x12', categoria: 'Etiquetas y Empaques', unidad: 'Unidad', costoUnitario: 2.50, stockMinimo: 500, stockInicial: 2000, lotes: [{ numero: 'CAJ-2026-001', cantidad: 2000 }] },
    ],
    productos: [
      { codigo: 'CBN-PAC-001', nombre: 'Cerveza Paceña 620ml', categoria: 'Cervezas Premium', unidad: 'Caja x12', precioVenta: 85.00, costoEstandar: 45.00, stockMinimo: 100 },
      { codigo: 'CBN-HUA-001', nombre: 'Cerveza Huari 620ml', categoria: 'Cervezas Premium', unidad: 'Caja x12', precioVenta: 95.00, costoEstandar: 50.00, stockMinimo: 80 },
      { codigo: 'CBN-DUC-001', nombre: 'Cerveza Ducal 355ml Lata', categoria: 'Cervezas Premium', unidad: 'Caja x12', precioVenta: 65.00, costoEstandar: 35.00, stockMinimo: 120 },
    ],
    boms: [
      {
        nombre: 'Receta Paceña 620ml', idProducto: 'CBN-PAC-001',
        detalles: [
          { idMateriaPrima: 'CBN-MAL-001', cantidad: 5 },
          { idMateriaPrima: 'CBN-LUP-001', cantidad: 0.2 },
          { idMateriaPrima: 'CBN-LEV-001', cantidad: 0.1 },
          { idMateriaPrima: 'CBN-AGU-001', cantidad: 20 },
          { idMateriaPrima: 'CBN-BOT-001', cantidad: 12 },
          { idMateriaPrima: 'CBN-TAP-001', cantidad: 0.012 },
          { idMateriaPrima: 'CBN-ETI-001', cantidad: 0.012 },
          { idMateriaPrima: 'CBN-CAJ-001', cantidad: 1 },
        ],
      },
      {
        nombre: 'Receta Huari 620ml', idProducto: 'CBN-HUA-001',
        detalles: [
          { idMateriaPrima: 'CBN-MAL-001', cantidad: 6 },
          { idMateriaPrima: 'CBN-LUP-001', cantidad: 0.3 },
          { idMateriaPrima: 'CBN-LEV-001', cantidad: 0.15 },
          { idMateriaPrima: 'CBN-AGU-001', cantidad: 22 },
          { idMateriaPrima: 'CBN-BOT-001', cantidad: 12 },
          { idMateriaPrima: 'CBN-TAP-001', cantidad: 0.012 },
          { idMateriaPrima: 'CBN-ETI-001', cantidad: 0.012 },
          { idMateriaPrima: 'CBN-CAJ-001', cantidad: 1 },
        ],
      },
    ],
    proveedores: [
      { nombre: 'Maltería Andina S.R.L.', nit: 'MA-1001', telefono: '2-2234567' },
      { nombre: 'Lúpulos del Sur', nit: 'LS-2002', telefono: '3-3345678' },
      { nombre: 'Envases Bolivia S.A.', nit: 'EB-3003', telefono: '3-3456789' },
      { nombre: 'Etiquetas Print', nit: 'EP-4004', telefono: '2-2567890' },
    ],
    clientes: [
      { nombre: 'Supermercado Ketal S.A.', nit: 'KTL-1001', telefono: '2-2789012' },
      { nombre: 'Distribuidora La Paz', nit: 'DLP-2002', telefono: '2-2890123' },
      { nombre: 'Tienda Don Juan', nit: 'TDJ-3003', telefono: '2-2901234' },
    ],
    empleados: [
      { nombre: 'Carlos', apellido: 'Mamani', cargo: 'Jefe de Producción', email: 'carlos.mamani@cbn.com' },
      { nombre: 'Rosa', apellido: 'Quispe', cargo: 'Responsable de Inventarios', email: 'rosa.quispe@cbn.com' },
      { nombre: 'Pedro', apellido: 'Garcia', cargo: 'Responsable de Compras', email: 'pedro.garcia@cbn.com' },
      { nombre: 'Ana', apellido: 'Lopez', cargo: 'Responsable de Ventas', email: 'ana.lopez@cbn.com' },
      { nombre: 'Mario', apellido: 'Fernandez', cargo: 'Contador General', email: 'mario.fernandez@cbn.com' },
    ],
    cargos: [
      { nombre: 'Jefe de Producción', salarioBase: 8000 },
      { nombre: 'Responsable de Inventarios', salarioBase: 6500 },
      { nombre: 'Responsable de Compras', salarioBase: 6500 },
      { nombre: 'Responsable de Ventas', salarioBase: 6500 },
      { nombre: 'Contador General', salarioBase: 7000 },
    ],
    cuentasContables: [
      { codigo: '1', nombre: 'ACTIVO', tipo: 'activo', nivel: 1 },
      { codigo: '1.1', nombre: 'Activo Corriente', tipo: 'activo', nivel: 2, idPadre: '1' },
      { codigo: '1.1.1', nombre: 'Efectivo y Equivalentes', tipo: 'activo', nivel: 3, idPadre: '1.1' },
      { codigo: '1.1.2', nombre: 'Inventarios', tipo: 'activo', nivel: 3, idPadre: '1.1' },
      { codigo: '1.2', nombre: 'Activo No Corriente', tipo: 'activo', nivel: 2, idPadre: '1' },
      { codigo: '2', nombre: 'PASIVO', tipo: 'pasivo', nivel: 1 },
      { codigo: '2.1', nombre: 'Pasivo Corriente', tipo: 'pasivo', nivel: 2, idPadre: '2' },
      { codigo: '3', nombre: 'PATRIMONIO', tipo: 'patrimonio', nivel: 1 },
      { codigo: '4', nombre: 'INGRESOS', tipo: 'ingreso', nivel: 1 },
      { codigo: '4.1', nombre: 'Ventas', tipo: 'ingreso', nivel: 2, idPadre: '4' },
      { codigo: '5', nombre: 'COSTOS', tipo: 'costo', nivel: 1 },
      { codigo: '5.1', nombre: 'Costo de Producción', tipo: 'costo', nivel: 2, idPadre: '5' },
      { codigo: '5.2', nombre: 'Costo de Ventas', tipo: 'costo', nivel: 2, idPadre: '5' },
      { codigo: '6', nombre: 'GASTOS', tipo: 'gasto', nivel: 1 },
      { codigo: '6.1', nombre: 'Gastos Operativos', tipo: 'gasto', nivel: 2, idPadre: '6' },
    ],
  });

  // ======== Droguería INTI ========
  await seedEmpresa({
    codigo: 'INTI',
    nit: 'INTI-20002',
    razonSocial: 'Droguería INTI S.A.',
    direccion: 'Av. Ayacucho #567, Zona Industrial, Cochabamba',
    telefono: '4-4567890',
    email: 'info@inti.com.bo',
    usuarios: [
      { nombre: 'Admin INTI', email: 'admin@inti.com', password: 'inti123', rol: 'ADMINISTRADOR' },
      { nombre: 'Juan Perez', email: 'produccion@inti.com', password: 'inti123', rol: 'JEFE_PRODUCCION' },
      { nombre: 'Maria Rios', email: 'inventarios@inti.com', password: 'inti123', rol: 'RESPONSABLE_INVENTARIOS' },
      { nombre: 'Luis Vargas', email: 'compras@inti.com', password: 'inti123', rol: 'RESPONSABLE_COMPRAS' },
      { nombre: 'Sofia Castro', email: 'ventas@inti.com', password: 'inti123', rol: 'RESPONSABLE_VENTAS' },
    ],
    categorias: [
      { nombre: 'Principios Activos', descripcion: 'Componentes farmacológicos activos' },
      { nombre: 'Excipientes', descripcion: 'Componentes inertes para formulación' },
      { nombre: 'Envases Farmacéuticos', descripcion: 'Blísteres, frascos y cajas' },
      { nombre: 'Medicamentos Terminados', descripcion: 'Productos farmacéuticos finales' },
    ],
    unidadesMedida: [
      { nombre: 'Kilogramo', abreviatura: 'kg' },
      { nombre: 'Gramo', abreviatura: 'g' },
      { nombre: 'Miligramo', abreviatura: 'mg' },
      { nombre: 'Unidad', abreviatura: 'u' },
      { nombre: 'Blíster x10', abreviatura: 'blíster' },
      { nombre: 'Caja x100', abreviatura: 'caja' },
    ],
    almacenes: [
      { nombre: 'Almacén MP INTI', ubicacion: 'Zona Industrial - Edificio A' },
      { nombre: 'Cuarentena', ubicacion: 'Zona Industrial - Edificio B' },
      { nombre: 'Almacén PT INTI', ubicacion: 'Zona Industrial - Edificio C' },
    ],
    materiasPrimas: [
      { codigo: 'INTI-PAR-001', nombre: 'Paracetamol USP', categoria: 'Principios Activos', unidad: 'Kilogramo', costoUnitario: 45.00, stockMinimo: 50, stockInicial: 300, lotes: [{ numero: 'PAR-2026-001', cantidad: 150 }, { numero: 'PAR-2026-002', cantidad: 150 }] },
      { codigo: 'INTI-IBU-001', nombre: 'Ibuprofeno USP', categoria: 'Principios Activos', unidad: 'Kilogramo', costoUnitario: 55.00, stockMinimo: 40, stockInicial: 200, lotes: [{ numero: 'IBU-2026-001', cantidad: 100 }, { numero: 'IBU-2026-002', cantidad: 100 }] },
      { codigo: 'INTI-AMO-001', nombre: 'Amoxicilina USP', categoria: 'Principios Activos', unidad: 'Kilogramo', costoUnitario: 120.00, stockMinimo: 30, stockInicial: 100, lotes: [{ numero: 'AMO-2026-001', cantidad: 100 }] },
      { codigo: 'INTI-ALM-001', nombre: 'Almidón de Maíz', categoria: 'Excipientes', unidad: 'Kilogramo', costoUnitario: 3.50, stockMinimo: 200, stockInicial: 1000, lotes: [{ numero: 'ALM-2026-001', cantidad: 500 }, { numero: 'ALM-2026-002', cantidad: 500 }] },
      { codigo: 'INTI-LAC-001', nombre: 'Lactosa Monohidrato', categoria: 'Excipientes', unidad: 'Kilogramo', costoUnitario: 8.00, stockMinimo: 150, stockInicial: 600, lotes: [{ numero: 'LAC-2026-001', cantidad: 600 }] },
      { codigo: 'INTI-BLI-001', nombre: 'Blíster PVC Aluminio', categoria: 'Envases Farmacéuticos', unidad: 'Unidad', costoUnitario: 0.50, stockMinimo: 5000, stockInicial: 25000, lotes: [{ numero: 'BLI-2026-001', cantidad: 15000 }, { numero: 'BLI-2026-002', cantidad: 10000 }] },
      { codigo: 'INTI-CAP-001', nombre: 'Cápsulas Gel Duras #0', categoria: 'Envases Farmacéuticos', unidad: 'Millar', costoUnitario: 15.00, stockMinimo: 50, stockInicial: 200, lotes: [{ numero: 'CAP-2026-001', cantidad: 200 }] },
      { codigo: 'INTI-CAJ-001', nombre: 'Caja Plegadiza Farmacia', categoria: 'Envases Farmacéuticos', unidad: 'Unidad', costoUnitario: 0.80, stockMinimo: 2000, stockInicial: 10000, lotes: [{ numero: 'CAJ-F-2026-001', cantidad: 10000 }] },
    ],
    productos: [
      { codigo: 'INTI-PAR-500', nombre: 'Paracetamol 500mg Blíster x10', categoria: 'Medicamentos Terminados', unidad: 'Caja x100', precioVenta: 250.00, costoEstandar: 120.00, stockMinimo: 50 },
      { codigo: 'INTI-IBU-400', nombre: 'Ibuprofeno 400mg Blíster x10', categoria: 'Medicamentos Terminados', unidad: 'Caja x100', precioVenta: 280.00, costoEstandar: 140.00, stockMinimo: 40 },
      { codigo: 'INTI-AMO-500', nombre: 'Amoxicilina 500mg Cápsulas x12', categoria: 'Medicamentos Terminados', unidad: 'Caja x100', precioVenta: 450.00, costoEstandar: 220.00, stockMinimo: 30 },
    ],
    boms: [
      {
        nombre: 'Fórmula Paracetamol 500mg', idProducto: 'INTI-PAR-500',
        detalles: [
          { idMateriaPrima: 'INTI-PAR-001', cantidad: 0.05 },
          { idMateriaPrima: 'INTI-ALM-001', cantidad: 0.02 },
          { idMateriaPrima: 'INTI-LAC-001', cantidad: 0.03 },
          { idMateriaPrima: 'INTI-BLI-001', cantidad: 10 },
          { idMateriaPrima: 'INTI-CAJ-001', cantidad: 1 },
        ],
      },
      {
        nombre: 'Fórmula Ibuprofeno 400mg', idProducto: 'INTI-IBU-400',
        detalles: [
          { idMateriaPrima: 'INTI-IBU-001', cantidad: 0.04 },
          { idMateriaPrima: 'INTI-ALM-001', cantidad: 0.015 },
          { idMateriaPrima: 'INTI-LAC-001', cantidad: 0.025 },
          { idMateriaPrima: 'INTI-BLI-001', cantidad: 10 },
          { idMateriaPrima: 'INTI-CAJ-001', cantidad: 1 },
        ],
      },
    ],
    proveedores: [
      { nombre: 'PharmaChem Bolivia S.R.L.', nit: 'PC-5005', telefono: '4-4567123' },
      { nombre: 'Químicos del Valle', nit: 'QV-6006', telefono: '4-4678234' },
      { nombre: 'Envases Farma S.A.', nit: 'EF-7007', telefono: '3-4789345' },
    ],
    clientes: [
      { nombre: 'Farmacias Bolivia S.A.', nit: 'FB-8008', telefono: '2-4890456' },
      { nombre: 'Clínica Los Ángeles', nit: 'CLA-9009', telefono: '4-4901567' },
      { nombre: 'Distribuidora Médica INTI', nit: 'DMI-1010', telefono: '4-4012678' },
    ],
    empleados: [
      { nombre: 'Juan', apellido: 'Perez', cargo: 'Jefe de Producción', email: 'juan.perez@inti.com' },
      { nombre: 'Maria', apellido: 'Rios', cargo: 'Responsable de Inventarios', email: 'maria.rios@inti.com' },
      { nombre: 'Luis', apellido: 'Vargas', cargo: 'Responsable de Compras', email: 'luis.vargas@inti.com' },
      { nombre: 'Sofia', apellido: 'Castro', cargo: 'Responsable de Ventas', email: 'sofia.castro@inti.com' },
      { nombre: 'Diego', apellido: 'Torres', cargo: 'Contador General', email: 'diego.torres@inti.com' },
    ],
    cargos: [
      { nombre: 'Jefe de Producción', salarioBase: 9000 },
      { nombre: 'Responsable de Inventarios', salarioBase: 7000 },
      { nombre: 'Responsable de Compras', salarioBase: 7000 },
      { nombre: 'Responsable de Ventas', salarioBase: 7000 },
      { nombre: 'Contador General', salarioBase: 7500 },
    ],
    cuentasContables: [
      { codigo: '1', nombre: 'ACTIVO', tipo: 'activo', nivel: 1 },
      { codigo: '1.1', nombre: 'Activo Corriente', tipo: 'activo', nivel: 2, idPadre: '1' },
      { codigo: '1.1.1', nombre: 'Efectivo', tipo: 'activo', nivel: 3, idPadre: '1.1' },
      { codigo: '1.1.2', nombre: 'Inventarios MP', tipo: 'activo', nivel: 3, idPadre: '1.1' },
      { codigo: '2', nombre: 'PASIVO', tipo: 'pasivo', nivel: 1 },
      { codigo: '2.1', nombre: 'Pasivo Corriente', tipo: 'pasivo', nivel: 2, idPadre: '2' },
      { codigo: '3', nombre: 'PATRIMONIO', tipo: 'patrimonio', nivel: 1 },
      { codigo: '4', nombre: 'INGRESOS', tipo: 'ingreso', nivel: 1 },
      { codigo: '4.1', nombre: 'Ventas', tipo: 'ingreso', nivel: 2, idPadre: '4' },
      { codigo: '5', nombre: 'COSTOS', tipo: 'costo', nivel: 1 },
      { codigo: '5.1', nombre: 'Costo Prod.', tipo: 'costo', nivel: 2, idPadre: '5' },
      { codigo: '5.2', nombre: 'Costo Ventas', tipo: 'costo', nivel: 2, idPadre: '5' },
      { codigo: '6', nombre: 'GASTOS', tipo: 'gasto', nivel: 1 },
      { codigo: '6.1', nombre: 'Gastos Grales.', tipo: 'gasto', nivel: 2, idPadre: '6' },
    ],
  });

  // ======== Empakar Express ========
  await seedEmpresa({
    codigo: 'EMPAK',
    nit: 'EMPAK-30003',
    razonSocial: 'Empakar Express S.A.',
    direccion: 'Av. Bolívar #890, Parque Industrial, Santa Cruz',
    telefono: '3-5678901',
    email: 'info@empakar.com.bo',
    usuarios: [
      { nombre: 'Admin Empakar', email: 'admin@empakar.com', password: 'empakar123', rol: 'ADMINISTRADOR' },
      { nombre: 'Roberto Vaca', email: 'produccion@empakar.com', password: 'empakar123', rol: 'JEFE_PRODUCCION' },
      { nombre: 'Gabriela Paz', email: 'inventarios@empakar.com', password: 'empakar123', rol: 'RESPONSABLE_INVENTARIOS' },
      { nombre: 'Fernando Ortiz', email: 'compras@empakar.com', password: 'empakar123', rol: 'RESPONSABLE_COMPRAS' },
      { nombre: 'Carmen Roca', email: 'ventas@empakar.com', password: 'empakar123', rol: 'RESPONSABLE_VENTAS' },
    ],
    categorias: [
      { nombre: 'Papeles y Cartones', descripcion: 'Materiales base de papel y cartón' },
      { nombre: 'Tintas y Adhesivos', descripcion: 'Insumos químicos para impresión' },
      { nombre: 'Insumos de Empaque', descripcion: 'Materiales complementarios' },
      { nombre: 'Empaques Terminados', descripcion: 'Productos finales' },
    ],
    unidadesMedida: [
      { nombre: 'Kilogramo', abreviatura: 'kg' },
      { nombre: 'Metro', abreviatura: 'm' },
      { nombre: 'Litro', abreviatura: 'L' },
      { nombre: 'Unidad', abreviatura: 'u' },
      { nombre: 'Millar', abreviatura: 'mil' },
    ],
    almacenes: [
      { nombre: 'Almacén Papel y Cartón', ubicacion: 'Nave Industrial 1' },
      { nombre: 'Almacén Tintas', ubicacion: 'Nave Industrial 2' },
      { nombre: 'Bodega PT Empakar', ubicacion: 'Nave Industrial 3' },
    ],
    materiasPrimas: [
      { codigo: 'EP-PAP-001', nombre: 'Papel Kraft 250g', categoria: 'Papeles y Cartones', unidad: 'Kilogramo', costoUnitario: 4.50, stockMinimo: 500, stockInicial: 3000, lotes: [{ numero: 'PKR-2026-001', cantidad: 1500 }, { numero: 'PKR-2026-002', cantidad: 1500 }] },
      { codigo: 'EP-CAR-001', nombre: 'Cartón Corrugado Simple', categoria: 'Papeles y Cartones', unidad: 'Metro', costoUnitario: 6.00, stockMinimo: 300, stockInicial: 1500, lotes: [{ numero: 'CCS-2026-001', cantidad: 1500 }] },
      { codigo: 'EP-CAR-002', nombre: 'Cartón Corrugado Doble', categoria: 'Papeles y Cartones', unidad: 'Metro', costoUnitario: 9.00, stockMinimo: 200, stockInicial: 1000, lotes: [{ numero: 'CCD-2026-001', cantidad: 1000 }] },
      { codigo: 'EP-TIN-001', nombre: 'Tinta Negra Flexográfica', categoria: 'Tintas y Adhesivos', unidad: 'Litro', costoUnitario: 25.00, stockMinimo: 50, stockInicial: 200, lotes: [{ numero: 'TNF-2026-001', cantidad: 200 }] },
      { codigo: 'EP-TIN-002', nombre: 'Tinta CMYK Full Color', categoria: 'Tintas y Adhesivos', unidad: 'Litro', costoUnitario: 40.00, stockMinimo: 30, stockInicial: 100, lotes: [{ numero: 'TCM-2026-001', cantidad: 100 }] },
      { codigo: 'EP-ADH-001', nombre: 'Adhesivo PVA Industrial', categoria: 'Tintas y Adhesivos', unidad: 'Litro', costoUnitario: 12.00, stockMinimo: 100, stockInicial: 500, lotes: [{ numero: 'PVA-2026-001', cantidad: 500 }] },
    ],
    productos: [
      { codigo: 'EP-CAJ-STD', nombre: 'Caja Corrugada Estándar 40x30x20cm', categoria: 'Empaques Terminados', unidad: 'Unidad', precioVenta: 15.00, costoEstandar: 7.50, stockMinimo: 500 },
      { codigo: 'EP-CAJ-PLD', nombre: 'Caja Plegadiza Personalizada 30x20x10cm', categoria: 'Empaques Terminados', unidad: 'Unidad', precioVenta: 8.00, costoEstandar: 3.50, stockMinimo: 1000 },
      { codigo: 'EP-EMP-BUR', nombre: 'Empaque Burbuja Protección 25x15cm', categoria: 'Empaques Terminados', unidad: 'Millar', precioVenta: 350.00, costoEstandar: 180.00, stockMinimo: 20 },
    ],
    boms: [
      {
        nombre: 'Spec Caja Corrugada Estándar', idProducto: 'EP-CAJ-STD',
        detalles: [
          { idMateriaPrima: 'EP-CAR-001', cantidad: 2.5 },
          { idMateriaPrima: 'EP-ADH-001', cantidad: 0.05 },
          { idMateriaPrima: 'EP-TIN-001', cantidad: 0.02 },
        ],
      },
      {
        nombre: 'Spec Caja Plegadiza Color', idProducto: 'EP-CAJ-PLD',
        detalles: [
          { idMateriaPrima: 'EP-PAP-001', cantidad: 0.5 },
          { idMateriaPrima: 'EP-TIN-002', cantidad: 0.01 },
          { idMateriaPrima: 'EP-ADH-001', cantidad: 0.02 },
        ],
      },
    ],
    proveedores: [
      { nombre: 'Papeles del Oriente S.A.', nit: 'PO-1111', telefono: '3-5789012' },
      { nombre: 'Tintas Gráficas Bolivia', nit: 'TGB-2222', telefono: '3-5890123' },
      { nombre: 'Químicos Industriales SCZ', nit: 'QIS-3333', telefono: '3-5901234' },
    ],
    clientes: [
      { nombre: 'Cervecería Boliviana Nacional', nit: 'CBN-10001', telefono: '2-2456789' },
      { nombre: 'Droguería INTI', nit: 'INTI-20002', telefono: '4-4567890' },
      { nombre: 'Almacenes Éxito Bolivia', nit: 'AEB-4444', telefono: '3-5012345' },
    ],
    empleados: [
      { nombre: 'Roberto', apellido: 'Vaca', cargo: 'Jefe de Producción', email: 'roberto.vaca@empakar.com' },
      { nombre: 'Gabriela', apellido: 'Paz', cargo: 'Responsable de Inventarios', email: 'gabriela.paz@empakar.com' },
      { nombre: 'Fernando', apellido: 'Ortiz', cargo: 'Responsable de Compras', email: 'fernando.ortiz@empakar.com' },
      { nombre: 'Carmen', apellido: 'Roca', cargo: 'Responsable de Ventas', email: 'carmen.roca@empakar.com' },
      { nombre: 'Hugo', apellido: 'Salinas', cargo: 'Contador General', email: 'hugo.salinas@empakar.com' },
    ],
    cargos: [
      { nombre: 'Jefe de Producción', salarioBase: 7500 },
      { nombre: 'Responsable de Inventarios', salarioBase: 6000 },
      { nombre: 'Responsable de Compras', salarioBase: 6000 },
      { nombre: 'Responsable de Ventas', salarioBase: 6000 },
      { nombre: 'Contador General', salarioBase: 6500 },
    ],
    cuentasContables: [
      { codigo: '1', nombre: 'ACTIVO', tipo: 'activo', nivel: 1 },
      { codigo: '1.1', nombre: 'Activo Corriente', tipo: 'activo', nivel: 2, idPadre: '1' },
      { codigo: '1.1.1', nombre: 'Caja y Bancos', tipo: 'activo', nivel: 3, idPadre: '1.1' },
      { codigo: '1.1.2', nombre: 'Inventarios', tipo: 'activo', nivel: 3, idPadre: '1.1' },
      { codigo: '2', nombre: 'PASIVO', tipo: 'pasivo', nivel: 1 },
      { codigo: '2.1', nombre: 'Pasivo Corriente', tipo: 'pasivo', nivel: 2, idPadre: '2' },
      { codigo: '3', nombre: 'PATRIMONIO', tipo: 'patrimonio', nivel: 1 },
      { codigo: '4', nombre: 'INGRESOS', tipo: 'ingreso', nivel: 1 },
      { codigo: '4.1', nombre: 'Ventas Empaques', tipo: 'ingreso', nivel: 2, idPadre: '4' },
      { codigo: '5', nombre: 'COSTOS', tipo: 'costo', nivel: 1 },
      { codigo: '5.1', nombre: 'Costo Prod.', tipo: 'costo', nivel: 2, idPadre: '5' },
      { codigo: '5.2', nombre: 'Costo Ventas', tipo: 'costo', nivel: 2, idPadre: '5' },
      { codigo: '6', nombre: 'GASTOS', tipo: 'gasto', nivel: 1 },
      { codigo: '6.1', nombre: 'Gastos Adm.', tipo: 'gasto', nivel: 2, idPadre: '6' },
    ],
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n========================================`);
  console.log(`✅ Seed completado en ${elapsed}s`);
  console.log(`📊 3 empresas piloto creadas:`);
  console.log(`   • CBN (Cervecería Boliviana Nacional)`);
  console.log(`   • Droguería INTI`);
  console.log(`   • Empakar Express`);
  console.log(`\n🔑 Credenciales:`);
  console.log(`   admin@cbn.com / cbn123`);
  console.log(`   admin@inti.com / inti123`);
  console.log(`   admin@empakar.com / empakar123`);
  console.log(`   (Cada empresa tiene 5 usuarios con rol especifico)`);
}

main()
  .catch((e) => {
    console.error('\n❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

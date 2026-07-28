# SIGE ERP — Backend API

Sistema ERP SaaS Multi-tenant para Manufactura.

**Tecnologías:** NestJS 11 · Prisma 7 · PostgreSQL 16 · TypeScript 5 · Swagger

---

## Requisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | 20.19+ |
| pnpm        | 10+ |
| Docker      | 24+ |
| Git         | — |

---

## Inicio rápido

```bash
# 1. Clonar y entrar al backend
cd sige-backend

# 2. Instalar dependencias
pnpm install

# 3. Iniciar PostgreSQL
docker compose up -d

# 4. Ejecutar migraciones
npx prisma migrate dev

# 5. Poblar base de datos con datos de prueba (3 empresas piloto)
npx tsx prisma/seed.ts

# 6. Iniciar servidor (modo desarrollo)
pnpm run start:dev
```

El servidor arranca en **http://localhost:3000**.

---

## Empresas piloto (datos de seed)

### CBN — Cervecería Boliviana Nacional S.A.
| Usuario | Email | Contraseña |
|---------|-------|------------|
| Administrador | admin@cbn.com | cbn123 |
| Jefe Producción | produccion@cbn.com | cbn123 |
| Resp. Inventarios | inventarios@cbn.com | cbn123 |
| Resp. Compras | compras@cbn.com | cbn123 |
| Resp. Ventas | ventas@cbn.com | cbn123 |

### Droguería INTI S.A.
| Usuario | Email | Contraseña |
|---------|-------|------------|
| Administrador | admin@inti.com | inti123 |
| Jefe Producción | produccion@inti.com | inti123 |
| Resp. Inventarios | inventarios@inti.com | inti123 |
| Resp. Compras | compras@inti.com | inti123 |
| Resp. Ventas | ventas@inti.com | inti123 |

### Empakar Express S.A.
| Usuario | Email | Contraseña |
|---------|-------|------------|
| Administrador | admin@empakar.com | empakar123 |
| Jefe Producción | produccion@empakar.com | empakar123 |
| Resp. Inventarios | inventarios@empakar.com | empakar123 |
| Resp. Compras | compras@empakar.com | empakar123 |
| Resp. Ventas | ventas@empakar.com | empakar123 |

---

## Scripts útiles

```bash
pnpm run start:dev     # Servidor con hot-reload
pnpm run build         # Compilar a JS
pnpm run start:prod    # Servidor producción
pnpm run test          # Pruebas unitarias
pnpm run lint          # ESLint + fix
```

## API Docs (Swagger)

Con el servidor corriendo: http://localhost:3000/api

## Base de datos

```bash
docker compose up -d      # Iniciar PostgreSQL
docker compose down       # Detener
docker compose down -v    # Detener + borrar datos

npx prisma studio         # Visualizar datos en navegador
npx prisma migrate dev    # Nueva migración
npx prisma generate       # Regenerar cliente Prisma
```

---

## Estructura del proyecto

```
sige-backend/
├── prisma/
│   ├── schema.prisma      # Modelos de datos (25 modelos)
│   ├── seed.ts            # Población de datos (3 empresas)
│   └── migrations/        # Migraciones SQL
├── src/
│   ├── main.ts            # Punto de entrada
│   ├── app.module.ts      # Módulo raíz
│   ├── auth/              # Autenticación JWT multi-tenant
│   ├── common/            # Guards, decoradores, DTOs
│   ├── empresa/           # Gestión de tenants
│   ├── usuario/           # Usuarios del sistema
│   ├── rol/               # Roles y permisos
│   ├── categoria/         # Categorías de inventario
│   ├── unidad-medida/     # Unidades de medida
│   ├── materia-prima/     # Materias primas y lotes
│   ├── producto/          # Productos terminados
│   ├── almacen/           # Almacenes
│   ├── stock/             # Control de existencias
│   ├── lote/              # Trazabilidad por lotes
│   ├── movimiento-inventario/  # Entradas/salidas/ajustes
│   ├── bom/               # Listas de materiales (BOM)
│   ├── produccion/        # Órdenes de producción
│   ├── proveedor/         # Proveedores
│   ├── orden-compra/      # Órdenes de compra
│   ├── cliente/           # Clientes
│   ├── venta/             # Ventas y facturación
│   ├── cuenta-contable/   # Plan de cuentas
│   ├── asiento-contable/  # Asientos contables
│   ├── empleado/          # Empleados
│   ├── cargo/             # Cargos laborales
│   ├── turno/             # Turnos de trabajo
│   ├── registro-horas/    # Registro de horas
│   └── reportes/          # Reportes y dashboard
├── docker-compose.yml     # PostgreSQL
├── .env                   # Variables de entorno
└── package.json
```

/*
  Warnings:

  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EstadoGeneral" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "TipoMovimientoInventario" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "EstadoOrdenProduccion" AS ENUM ('PLANIFICADA', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoOrdenCompra" AS ENUM ('SOLICITADA', 'APROBADA', 'RECIBIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoVenta" AS ENUM ('PENDIENTE', 'FACTURADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "TipoAsiento" AS ENUM ('DEBE', 'HABER');

-- DropTable
DROP TABLE "Usuario";

-- CreateTable
CREATE TABLE "empresa" (
    "id" TEXT NOT NULL,
    "nit" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permiso" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_rol" (
    "idUsuario" TEXT NOT NULL,
    "idRol" TEXT NOT NULL,
    "asignadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_rol_pkey" PRIMARY KEY ("idUsuario","idRol")
);

-- CreateTable
CREATE TABLE "rol_permiso" (
    "idRol" TEXT NOT NULL,
    "idPermiso" TEXT NOT NULL,
    "asignadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rol_permiso_pkey" PRIMARY KEY ("idRol","idPermiso")
);

-- CreateTable
CREATE TABLE "categoria" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidad_medida" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "abreviatura" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "unidad_medida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "idCategoria" TEXT,
    "idUnidadMedida" TEXT,
    "precioVenta" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "costoEstandar" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "stockMinimo" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materia_prima" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "idCategoria" TEXT,
    "idUnidadMedida" TEXT,
    "costoUnitario" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "stockMinimo" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "materia_prima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lote" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "idMateriaPrima" TEXT NOT NULL,
    "numeroLote" TEXT NOT NULL,
    "fechaVencimiento" TIMESTAMP(3),
    "cantidadInicial" DECIMAL(65,30) NOT NULL,
    "cantidadActual" DECIMAL(65,30) NOT NULL,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "almacen" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "almacen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "idAlmacen" TEXT NOT NULL,
    "idProducto" TEXT,
    "idMateriaPrima" TEXT,
    "cantidad" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimiento_inventario" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "idAlmacen" TEXT NOT NULL,
    "idProducto" TEXT,
    "idMateriaPrima" TEXT,
    "idLote" TEXT,
    "tipo" "TipoMovimientoInventario" NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referencia" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimiento_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bom" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "idProducto" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "bom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bom_detalle" (
    "id" TEXT NOT NULL,
    "idBOM" TEXT NOT NULL,
    "idMateriaPrima" TEXT NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "unidadMedida" TEXT,
    "secuencia" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bom_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_produccion" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "idProducto" TEXT NOT NULL,
    "idBOM" TEXT,
    "cantidadPlanificada" DECIMAL(65,30) NOT NULL,
    "cantidadProducida" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "estado" "EstadoOrdenProduccion" NOT NULL DEFAULT 'PLANIFICADA',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "orden_produccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumo_materia_prima" (
    "id" TEXT NOT NULL,
    "idOrdenProduccion" TEXT NOT NULL,
    "idMateriaPrima" TEXT NOT NULL,
    "idLote" TEXT,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consumo_materia_prima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produccion_terminada" (
    "id" TEXT NOT NULL,
    "idOrdenProduccion" TEXT NOT NULL,
    "idProducto" TEXT NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produccion_terminada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedor" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nit" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_compra" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "idProveedor" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEntrega" TIMESTAMP(3),
    "estado" "EstadoOrdenCompra" NOT NULL DEFAULT 'SOLICITADA',
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "orden_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_compra" (
    "id" TEXT NOT NULL,
    "idOrdenCompra" TEXT NOT NULL,
    "idMateriaPrima" TEXT NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detalle_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recepcion_compra" (
    "id" TEXT NOT NULL,
    "idOrdenCompra" TEXT NOT NULL,
    "idMateriaPrima" TEXT NOT NULL,
    "cantidadRecibida" DECIMAL(65,30) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recepcion_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nit" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venta" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "idCliente" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoVenta" NOT NULL DEFAULT 'PENDIENTE',
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_venta" (
    "id" TEXT NOT NULL,
    "idVenta" TEXT NOT NULL,
    "idProducto" TEXT NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detalle_venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factura" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "idVenta" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(65,30) NOT NULL,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuenta_contable" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT,
    "nivel" INTEGER,
    "idPadre" TEXT,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cuenta_contable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asiento_contable" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT NOT NULL,
    "referencia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "asiento_contable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_asiento" (
    "id" TEXT NOT NULL,
    "idAsiento" TEXT NOT NULL,
    "idCuentaContable" TEXT NOT NULL,
    "tipo" "TipoAsiento" NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detalle_asiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empleado" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "idCargo" TEXT,
    "fechaIngreso" TIMESTAMP(3),
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargo" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "salarioBase" DECIMAL(65,30),
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turno" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "estado" "EstadoGeneral" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro_horas" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "idEmpleado" TEXT NOT NULL,
    "idTurno" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "horaEntrada" TIMESTAMP(3) NOT NULL,
    "horaSalida" TIMESTAMP(3),
    "horasTrabajadas" DECIMAL(65,30),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registro_horas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresa_nit_key" ON "empresa"("nit");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "usuario_idEmpresa_idx" ON "usuario"("idEmpresa");

-- CreateIndex
CREATE INDEX "rol_idEmpresa_idx" ON "rol"("idEmpresa");

-- CreateIndex
CREATE UNIQUE INDEX "rol_idEmpresa_nombre_key" ON "rol"("idEmpresa", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permiso_codigo_key" ON "permiso"("codigo");

-- CreateIndex
CREATE INDEX "categoria_idEmpresa_idx" ON "categoria"("idEmpresa");

-- CreateIndex
CREATE UNIQUE INDEX "categoria_idEmpresa_nombre_key" ON "categoria"("idEmpresa", "nombre");

-- CreateIndex
CREATE INDEX "unidad_medida_idEmpresa_idx" ON "unidad_medida"("idEmpresa");

-- CreateIndex
CREATE UNIQUE INDEX "unidad_medida_idEmpresa_nombre_key" ON "unidad_medida"("idEmpresa", "nombre");

-- CreateIndex
CREATE INDEX "producto_idEmpresa_idx" ON "producto"("idEmpresa");

-- CreateIndex
CREATE INDEX "producto_idCategoria_idx" ON "producto"("idCategoria");

-- CreateIndex
CREATE UNIQUE INDEX "producto_idEmpresa_codigo_key" ON "producto"("idEmpresa", "codigo");

-- CreateIndex
CREATE INDEX "materia_prima_idEmpresa_idx" ON "materia_prima"("idEmpresa");

-- CreateIndex
CREATE UNIQUE INDEX "materia_prima_idEmpresa_codigo_key" ON "materia_prima"("idEmpresa", "codigo");

-- CreateIndex
CREATE INDEX "lote_idEmpresa_idMateriaPrima_idx" ON "lote"("idEmpresa", "idMateriaPrima");

-- CreateIndex
CREATE UNIQUE INDEX "lote_idEmpresa_numeroLote_key" ON "lote"("idEmpresa", "numeroLote");

-- CreateIndex
CREATE INDEX "almacen_idEmpresa_idx" ON "almacen"("idEmpresa");

-- CreateIndex
CREATE UNIQUE INDEX "almacen_idEmpresa_nombre_key" ON "almacen"("idEmpresa", "nombre");

-- CreateIndex
CREATE INDEX "stock_idEmpresa_idAlmacen_idx" ON "stock"("idEmpresa", "idAlmacen");

-- CreateIndex
CREATE UNIQUE INDEX "stock_idEmpresa_idAlmacen_idProducto_idMateriaPrima_key" ON "stock"("idEmpresa", "idAlmacen", "idProducto", "idMateriaPrima");

-- CreateIndex
CREATE INDEX "movimiento_inventario_idEmpresa_fecha_idx" ON "movimiento_inventario"("idEmpresa", "fecha");

-- CreateIndex
CREATE INDEX "movimiento_inventario_idAlmacen_idx" ON "movimiento_inventario"("idAlmacen");

-- CreateIndex
CREATE INDEX "bom_idEmpresa_idx" ON "bom"("idEmpresa");

-- CreateIndex
CREATE UNIQUE INDEX "bom_idEmpresa_idProducto_version_key" ON "bom"("idEmpresa", "idProducto", "version");

-- CreateIndex
CREATE INDEX "bom_detalle_idBOM_idx" ON "bom_detalle"("idBOM");

-- CreateIndex
CREATE INDEX "orden_produccion_idEmpresa_estado_idx" ON "orden_produccion"("idEmpresa", "estado");

-- CreateIndex
CREATE INDEX "orden_produccion_idProducto_idx" ON "orden_produccion"("idProducto");

-- CreateIndex
CREATE INDEX "consumo_materia_prima_idOrdenProduccion_idx" ON "consumo_materia_prima"("idOrdenProduccion");

-- CreateIndex
CREATE INDEX "produccion_terminada_idOrdenProduccion_idx" ON "produccion_terminada"("idOrdenProduccion");

-- CreateIndex
CREATE INDEX "proveedor_idEmpresa_idx" ON "proveedor"("idEmpresa");

-- CreateIndex
CREATE UNIQUE INDEX "proveedor_idEmpresa_nit_key" ON "proveedor"("idEmpresa", "nit");

-- CreateIndex
CREATE INDEX "orden_compra_idEmpresa_estado_idx" ON "orden_compra"("idEmpresa", "estado");

-- CreateIndex
CREATE INDEX "orden_compra_idProveedor_idx" ON "orden_compra"("idProveedor");

-- CreateIndex
CREATE INDEX "detalle_compra_idOrdenCompra_idx" ON "detalle_compra"("idOrdenCompra");

-- CreateIndex
CREATE INDEX "recepcion_compra_idOrdenCompra_idx" ON "recepcion_compra"("idOrdenCompra");

-- CreateIndex
CREATE INDEX "cliente_idEmpresa_idx" ON "cliente"("idEmpresa");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_idEmpresa_nit_key" ON "cliente"("idEmpresa", "nit");

-- CreateIndex
CREATE INDEX "venta_idEmpresa_estado_idx" ON "venta"("idEmpresa", "estado");

-- CreateIndex
CREATE INDEX "venta_idCliente_idx" ON "venta"("idCliente");

-- CreateIndex
CREATE INDEX "detalle_venta_idVenta_idx" ON "detalle_venta"("idVenta");

-- CreateIndex
CREATE UNIQUE INDEX "factura_idVenta_key" ON "factura"("idVenta");

-- CreateIndex
CREATE INDEX "factura_idEmpresa_idx" ON "factura"("idEmpresa");

-- CreateIndex
CREATE UNIQUE INDEX "factura_idEmpresa_numero_key" ON "factura"("idEmpresa", "numero");

-- CreateIndex
CREATE INDEX "cuenta_contable_idEmpresa_idx" ON "cuenta_contable"("idEmpresa");

-- CreateIndex
CREATE UNIQUE INDEX "cuenta_contable_idEmpresa_codigo_key" ON "cuenta_contable"("idEmpresa", "codigo");

-- CreateIndex
CREATE INDEX "asiento_contable_idEmpresa_fecha_idx" ON "asiento_contable"("idEmpresa", "fecha");

-- CreateIndex
CREATE INDEX "detalle_asiento_idAsiento_idx" ON "detalle_asiento"("idAsiento");

-- CreateIndex
CREATE INDEX "empleado_idEmpresa_idx" ON "empleado"("idEmpresa");

-- CreateIndex
CREATE INDEX "cargo_idEmpresa_idx" ON "cargo"("idEmpresa");

-- CreateIndex
CREATE UNIQUE INDEX "cargo_idEmpresa_nombre_key" ON "cargo"("idEmpresa", "nombre");

-- CreateIndex
CREATE INDEX "turno_idEmpresa_idx" ON "turno"("idEmpresa");

-- CreateIndex
CREATE INDEX "registro_horas_idEmpresa_fecha_idx" ON "registro_horas"("idEmpresa", "fecha");

-- CreateIndex
CREATE INDEX "registro_horas_idEmpleado_fecha_idx" ON "registro_horas"("idEmpleado", "fecha");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol" ADD CONSTRAINT "rol_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_rol" ADD CONSTRAINT "usuario_rol_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_rol" ADD CONSTRAINT "usuario_rol_idRol_fkey" FOREIGN KEY ("idRol") REFERENCES "rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_idRol_fkey" FOREIGN KEY ("idRol") REFERENCES "rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_idPermiso_fkey" FOREIGN KEY ("idPermiso") REFERENCES "permiso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoria" ADD CONSTRAINT "categoria_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidad_medida" ADD CONSTRAINT "unidad_medida_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_idUnidadMedida_fkey" FOREIGN KEY ("idUnidadMedida") REFERENCES "unidad_medida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materia_prima" ADD CONSTRAINT "materia_prima_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materia_prima" ADD CONSTRAINT "materia_prima_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materia_prima" ADD CONSTRAINT "materia_prima_idUnidadMedida_fkey" FOREIGN KEY ("idUnidadMedida") REFERENCES "unidad_medida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote" ADD CONSTRAINT "lote_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote" ADD CONSTRAINT "lote_idMateriaPrima_fkey" FOREIGN KEY ("idMateriaPrima") REFERENCES "materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "almacen" ADD CONSTRAINT "almacen_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_idAlmacen_fkey" FOREIGN KEY ("idAlmacen") REFERENCES "almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_idMateriaPrima_fkey" FOREIGN KEY ("idMateriaPrima") REFERENCES "materia_prima"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_idAlmacen_fkey" FOREIGN KEY ("idAlmacen") REFERENCES "almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_idMateriaPrima_fkey" FOREIGN KEY ("idMateriaPrima") REFERENCES "materia_prima"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "movimiento_inventario_idLote_fkey" FOREIGN KEY ("idLote") REFERENCES "lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom" ADD CONSTRAINT "bom_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom" ADD CONSTRAINT "bom_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_detalle" ADD CONSTRAINT "bom_detalle_idBOM_fkey" FOREIGN KEY ("idBOM") REFERENCES "bom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_detalle" ADD CONSTRAINT "bom_detalle_idMateriaPrima_fkey" FOREIGN KEY ("idMateriaPrima") REFERENCES "materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_produccion" ADD CONSTRAINT "orden_produccion_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_produccion" ADD CONSTRAINT "orden_produccion_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_produccion" ADD CONSTRAINT "orden_produccion_idBOM_fkey" FOREIGN KEY ("idBOM") REFERENCES "bom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumo_materia_prima" ADD CONSTRAINT "consumo_materia_prima_idOrdenProduccion_fkey" FOREIGN KEY ("idOrdenProduccion") REFERENCES "orden_produccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumo_materia_prima" ADD CONSTRAINT "consumo_materia_prima_idMateriaPrima_fkey" FOREIGN KEY ("idMateriaPrima") REFERENCES "materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumo_materia_prima" ADD CONSTRAINT "consumo_materia_prima_idLote_fkey" FOREIGN KEY ("idLote") REFERENCES "lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produccion_terminada" ADD CONSTRAINT "produccion_terminada_idOrdenProduccion_fkey" FOREIGN KEY ("idOrdenProduccion") REFERENCES "orden_produccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produccion_terminada" ADD CONSTRAINT "produccion_terminada_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedor" ADD CONSTRAINT "proveedor_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_compra" ADD CONSTRAINT "orden_compra_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_compra" ADD CONSTRAINT "orden_compra_idProveedor_fkey" FOREIGN KEY ("idProveedor") REFERENCES "proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_compra" ADD CONSTRAINT "detalle_compra_idOrdenCompra_fkey" FOREIGN KEY ("idOrdenCompra") REFERENCES "orden_compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_compra" ADD CONSTRAINT "detalle_compra_idMateriaPrima_fkey" FOREIGN KEY ("idMateriaPrima") REFERENCES "materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepcion_compra" ADD CONSTRAINT "recepcion_compra_idOrdenCompra_fkey" FOREIGN KEY ("idOrdenCompra") REFERENCES "orden_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepcion_compra" ADD CONSTRAINT "recepcion_compra_idMateriaPrima_fkey" FOREIGN KEY ("idMateriaPrima") REFERENCES "materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta" ADD CONSTRAINT "venta_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venta" ADD CONSTRAINT "venta_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_venta" ADD CONSTRAINT "detalle_venta_idVenta_fkey" FOREIGN KEY ("idVenta") REFERENCES "venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_venta" ADD CONSTRAINT "detalle_venta_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura" ADD CONSTRAINT "factura_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura" ADD CONSTRAINT "factura_idVenta_fkey" FOREIGN KEY ("idVenta") REFERENCES "venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_contable" ADD CONSTRAINT "cuenta_contable_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_contable" ADD CONSTRAINT "cuenta_contable_idPadre_fkey" FOREIGN KEY ("idPadre") REFERENCES "cuenta_contable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asiento_contable" ADD CONSTRAINT "asiento_contable_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_asiento" ADD CONSTRAINT "detalle_asiento_idAsiento_fkey" FOREIGN KEY ("idAsiento") REFERENCES "asiento_contable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_asiento" ADD CONSTRAINT "detalle_asiento_idCuentaContable_fkey" FOREIGN KEY ("idCuentaContable") REFERENCES "cuenta_contable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_idCargo_fkey" FOREIGN KEY ("idCargo") REFERENCES "cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo" ADD CONSTRAINT "cargo_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_horas" ADD CONSTRAINT "registro_horas_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_horas" ADD CONSTRAINT "registro_horas_idEmpleado_fkey" FOREIGN KEY ("idEmpleado") REFERENCES "empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_horas" ADD CONSTRAINT "registro_horas_idTurno_fkey" FOREIGN KEY ("idTurno") REFERENCES "turno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

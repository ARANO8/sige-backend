-- CreateTable
CREATE TABLE "configuracion_dashboard" (
    "id" TEXT NOT NULL,
    "idEmpresa" TEXT NOT NULL,
    "kpisConfig" JSONB NOT NULL DEFAULT '{}',
    "chartsConfig" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_dashboard_idEmpresa_key" ON "configuracion_dashboard"("idEmpresa");

-- AddForeignKey
ALTER TABLE "configuracion_dashboard" ADD CONSTRAINT "configuracion_dashboard_idEmpresa_fkey" FOREIGN KEY ("idEmpresa") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

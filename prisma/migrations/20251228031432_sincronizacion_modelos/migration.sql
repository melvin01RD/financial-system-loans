/*
  Warnings:

  - The values [LIQUIDACION_TOTAL] on the enum `PaymentType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `nombre_completo` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `cuota_mensual` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `plazo_meses` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `plazo_restante_cuotas` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `saldo_restante` on the `Loan` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cedula]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apellido` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cedula` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_nacimiento` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `cuota_fija` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plazo_cantidad` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saldo_capital` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentFrequency" AS ENUM ('SEMANAL', 'QUINCENAL', 'MENSUAL');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDIENTE', 'PAGADO', 'PARCIAL', 'VENCIDO');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OFFICER');

-- AlterEnum
ALTER TYPE "LoanStatus" ADD VALUE 'CANCELADO';

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentType_new" AS ENUM ('CUOTA_REGULAR', 'ABONO_CAPITAL', 'CANCELACION_TOTAL');
ALTER TABLE "Payment" ALTER COLUMN "tipo_pago" TYPE "PaymentType_new" USING ("tipo_pago"::text::"PaymentType_new");
ALTER TYPE "PaymentType" RENAME TO "PaymentType_old";
ALTER TYPE "PaymentType_new" RENAME TO "PaymentType";
DROP TYPE "PaymentType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropIndex
DROP INDEX "Client_nombre_completo_idx";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "nombre_completo",
ADD COLUMN     "apellido" TEXT NOT NULL,
ADD COLUMN     "cedula" TEXT NOT NULL,
ADD COLUMN     "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
ADD COLUMN     "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "moneda" TEXT NOT NULL DEFAULT 'DOP',
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "cuota_mensual",
DROP COLUMN "plazo_meses",
DROP COLUMN "plazo_restante_cuotas",
DROP COLUMN "saldo_restante",
ADD COLUMN     "cuota_fija" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "fecha_desembolso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "frecuencia_pago" "PaymentFrequency" NOT NULL DEFAULT 'MENSUAL',
ADD COLUMN     "plazo_cantidad" INTEGER NOT NULL,
ADD COLUMN     "saldo_capital" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "saldo_interes" DECIMAL(10,2) NOT NULL DEFAULT 0,
ALTER COLUMN "tasa_interes_anual" SET DATA TYPE DECIMAL(10,4);

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "aplicado_a_mora" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'OFFICER';

-- DropTable
DROP TABLE "AuditLog";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "AmortizationSchedule" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "numero_cuota" INTEGER NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "monto_cuota" DECIMAL(10,2) NOT NULL,
    "capital_cuota" DECIMAL(10,2) NOT NULL,
    "interes_cuota" DECIMAL(10,2) NOT NULL,
    "saldo_pendiente" DECIMAL(10,2) NOT NULL,
    "estado" "ScheduleStatus" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "AmortizationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AmortizationSchedule_loanId_idx" ON "AmortizationSchedule"("loanId");

-- CreateIndex
CREATE INDEX "AmortizationSchedule_fecha_vencimiento_idx" ON "AmortizationSchedule"("fecha_vencimiento");

-- CreateIndex
CREATE UNIQUE INDEX "Client_cedula_key" ON "Client"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- AddForeignKey
ALTER TABLE "AmortizationSchedule" ADD CONSTRAINT "AmortizationSchedule_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

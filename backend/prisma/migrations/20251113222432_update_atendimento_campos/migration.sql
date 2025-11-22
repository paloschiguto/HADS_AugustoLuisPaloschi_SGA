/*
  Warnings:

  - You are about to drop the column `motivo` on the `Atendimento` table. All the data in the column will be lost.
  - You are about to drop the column `orientacoes` on the `Atendimento` table. All the data in the column will be lost.
  - You are about to drop the column `retornoPrevisto` on the `Atendimento` table. All the data in the column will be lost.
  - You are about to drop the column `sintomas` on the `Atendimento` table. All the data in the column will be lost.
  - You are about to drop the column `usuId` on the `Atendimento` table. All the data in the column will be lost.
  - You are about to drop the column `atendId` on the `MedicamentosAtend` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `MedicamentosAtend` table. All the data in the column will be lost.
  - You are about to drop the column `createdOn` on the `MedicamentosAtend` table. All the data in the column will be lost.
  - You are about to drop the column `medId` on the `MedicamentosAtend` table. All the data in the column will be lost.
  - You are about to drop the column `modifiedBy` on the `MedicamentosAtend` table. All the data in the column will be lost.
  - You are about to drop the column `modifiedOn` on the `MedicamentosAtend` table. All the data in the column will be lost.
  - You are about to drop the column `qtde` on the `MedicamentosAtend` table. All the data in the column will be lost.
  - Added the required column `atendimentoId` to the `MedicamentosAtend` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicamentoId` to the `MedicamentosAtend` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Atendimento" DROP CONSTRAINT "Atendimento_usuId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MedicamentosAtend" DROP CONSTRAINT "MedicamentosAtend_atendId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MedicamentosAtend" DROP CONSTRAINT "MedicamentosAtend_medId_fkey";

-- AlterTable
ALTER TABLE "public"."Atendimento" DROP COLUMN "motivo",
DROP COLUMN "orientacoes",
DROP COLUMN "retornoPrevisto",
DROP COLUMN "sintomas",
DROP COLUMN "usuId",
ADD COLUMN     "local" TEXT,
ADD COLUMN     "peso" DOUBLE PRECISION,
ADD COLUMN     "prescricao" TEXT,
ADD COLUMN     "temperatura" DOUBLE PRECISION,
ADD COLUMN     "tipo" TEXT;

-- AlterTable
ALTER TABLE "public"."MedicamentosAtend" DROP COLUMN "atendId",
DROP COLUMN "createdBy",
DROP COLUMN "createdOn",
DROP COLUMN "medId",
DROP COLUMN "modifiedBy",
DROP COLUMN "modifiedOn",
DROP COLUMN "qtde",
ADD COLUMN     "atendimentoId" INTEGER NOT NULL,
ADD COLUMN     "dosagem" TEXT,
ADD COLUMN     "duracao" TEXT,
ADD COLUMN     "frequencia" TEXT,
ADD COLUMN     "medicamentoId" INTEGER NOT NULL,
ADD COLUMN     "observacao" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Atendimento" ADD CONSTRAINT "Atendimento_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicamentosAtend" ADD CONSTRAINT "MedicamentosAtend_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "public"."Atendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicamentosAtend" ADD CONSTRAINT "MedicamentosAtend_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "public"."Medicamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

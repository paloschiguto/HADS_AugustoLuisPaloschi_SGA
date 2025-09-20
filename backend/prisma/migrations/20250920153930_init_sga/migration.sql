/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senha` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tpUsuId` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Usuario" DROP COLUMN "createdAt",
DROP COLUMN "telefone",
ADD COLUMN     "createdBy" INTEGER NOT NULL,
ADD COLUMN     "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modifiedBy" INTEGER,
ADD COLUMN     "modifiedOn" TIMESTAMP(3),
ADD COLUMN     "senha" TEXT NOT NULL,
ADD COLUMN     "tpUsuId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."TipoDeUsuario" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedBy" INTEGER,
    "modifiedIn" TIMESTAMP(3),

    CONSTRAINT "TipoDeUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Paciente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "dataNasc" TIMESTAMP(3),
    "respId" INTEGER NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedBy" INTEGER,
    "modifiedOn" TIMESTAMP(3),

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Medicamento" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "dosagem" TEXT NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedBy" INTEGER,
    "modifiedOn" TIMESTAMP(3),

    CONSTRAINT "Medicamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Atendimento" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "obs" TEXT,
    "finalizado" BOOLEAN NOT NULL,
    "usuId" INTEGER NOT NULL,
    "pacId" INTEGER NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedBy" INTEGER,
    "modfiedOn" TIMESTAMP(3),

    CONSTRAINT "Atendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MedicamentosAtend" (
    "id" SERIAL NOT NULL,
    "atendId" INTEGER NOT NULL,
    "medId" INTEGER NOT NULL,
    "qtde" INTEGER NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedBy" INTEGER,
    "modifiedOn" TIMESTAMP(3),

    CONSTRAINT "MedicamentosAtend_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_tpUsuId_fkey" FOREIGN KEY ("tpUsuId") REFERENCES "public"."TipoDeUsuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Paciente" ADD CONSTRAINT "Paciente_respId_fkey" FOREIGN KEY ("respId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Atendimento" ADD CONSTRAINT "Atendimento_usuId_fkey" FOREIGN KEY ("usuId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Atendimento" ADD CONSTRAINT "Atendimento_pacId_fkey" FOREIGN KEY ("pacId") REFERENCES "public"."Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicamentosAtend" ADD CONSTRAINT "MedicamentosAtend_atendId_fkey" FOREIGN KEY ("atendId") REFERENCES "public"."Atendimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicamentosAtend" ADD CONSTRAINT "MedicamentosAtend_medId_fkey" FOREIGN KEY ("medId") REFERENCES "public"."Medicamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

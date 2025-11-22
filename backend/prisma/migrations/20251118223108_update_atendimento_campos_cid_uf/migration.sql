/*
  Warnings:

  - You are about to drop the column `local` on the `Atendimento` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Atendimento` table. All the data in the column will be lost.
  - Added the required column `cidade` to the `Atendimento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uf` to the `Atendimento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Atendimento" DROP COLUMN "local",
DROP COLUMN "tipo",
ADD COLUMN     "cidade" TEXT NOT NULL,
ADD COLUMN     "uf" TEXT NOT NULL;

/*
  Warnings:

  - You are about to drop the column `modfiedOn` on the `Atendimento` table. All the data in the column will be lost.
  - You are about to drop the column `modifiedIn` on the `TipoDeUsuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Atendimento" DROP COLUMN "modfiedOn",
ADD COLUMN     "modifiedOn" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."TipoDeUsuario" DROP COLUMN "modifiedIn",
ADD COLUMN     "modifiedOn" TIMESTAMP(3);

/*
  Warnings:

  - You are about to drop the `_UsuarioPermissoes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_UsuarioPermissoes" DROP CONSTRAINT "_UsuarioPermissoes_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_UsuarioPermissoes" DROP CONSTRAINT "_UsuarioPermissoes_B_fkey";

-- DropTable
DROP TABLE "public"."_UsuarioPermissoes";

-- CreateTable
CREATE TABLE "public"."_TipoPermissoes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TipoPermissoes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TipoPermissoes_B_index" ON "public"."_TipoPermissoes"("B");

-- AddForeignKey
ALTER TABLE "public"."_TipoPermissoes" ADD CONSTRAINT "_TipoPermissoes_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Permissao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TipoPermissoes" ADD CONSTRAINT "_TipoPermissoes_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."TipoDeUsuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

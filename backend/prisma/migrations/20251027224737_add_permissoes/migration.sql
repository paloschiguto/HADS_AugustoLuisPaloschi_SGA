-- CreateTable
CREATE TABLE "public"."Permissao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Permissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_UsuarioPermissoes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UsuarioPermissoes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permissao_nome_key" ON "public"."Permissao"("nome");

-- CreateIndex
CREATE INDEX "_UsuarioPermissoes_B_index" ON "public"."_UsuarioPermissoes"("B");

-- AddForeignKey
ALTER TABLE "public"."_UsuarioPermissoes" ADD CONSTRAINT "_UsuarioPermissoes_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Permissao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UsuarioPermissoes" ADD CONSTRAINT "_UsuarioPermissoes_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

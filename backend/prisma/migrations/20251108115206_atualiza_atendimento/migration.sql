-- AlterTable
ALTER TABLE "public"."Atendimento" ADD COLUMN     "diagnostico" TEXT,
ADD COLUMN     "motivo" TEXT,
ADD COLUMN     "orientacoes" TEXT,
ADD COLUMN     "retornoPrevisto" TIMESTAMP(3),
ADD COLUMN     "sintomas" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Em andamento',
ALTER COLUMN "finalizado" SET DEFAULT false;

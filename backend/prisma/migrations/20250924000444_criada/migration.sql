-- AlterTable
ALTER TABLE "public"."Medicamento" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Paciente" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Usuario" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true;

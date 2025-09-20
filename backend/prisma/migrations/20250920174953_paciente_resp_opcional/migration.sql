-- DropForeignKey
ALTER TABLE "public"."Paciente" DROP CONSTRAINT "Paciente_respId_fkey";

-- AlterTable
ALTER TABLE "public"."Paciente" ALTER COLUMN "respId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Paciente" ADD CONSTRAINT "Paciente_respId_fkey" FOREIGN KEY ("respId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

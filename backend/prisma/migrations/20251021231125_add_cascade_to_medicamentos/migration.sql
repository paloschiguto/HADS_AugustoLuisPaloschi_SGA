-- DropForeignKey
ALTER TABLE "public"."MedicamentosAtend" DROP CONSTRAINT "MedicamentosAtend_atendId_fkey";

-- AddForeignKey
ALTER TABLE "public"."MedicamentosAtend" ADD CONSTRAINT "MedicamentosAtend_atendId_fkey" FOREIGN KEY ("atendId") REFERENCES "public"."Atendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

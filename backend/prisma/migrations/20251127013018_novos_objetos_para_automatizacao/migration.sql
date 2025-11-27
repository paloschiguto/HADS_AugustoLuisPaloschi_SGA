-- CreateTable
CREATE TABLE "public"."Prescricao" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "medicamentoId" INTEGER NOT NULL,
    "dosagem" TEXT NOT NULL,
    "frequenciaHoras" INTEGER NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedBy" INTEGER,
    "modifiedOn" TIMESTAMP(3),

    CONSTRAINT "Prescricao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ItemAgenda" (
    "id" SERIAL NOT NULL,
    "prescricaoId" INTEGER NOT NULL,
    "dataHoraPrevista" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataHoraRealizada" TIMESTAMP(3),
    "realizadoPor" INTEGER,
    "atendimentoId" INTEGER,

    CONSTRAINT "ItemAgenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemAgenda_atendimentoId_key" ON "public"."ItemAgenda"("atendimentoId");

-- AddForeignKey
ALTER TABLE "public"."Prescricao" ADD CONSTRAINT "Prescricao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "public"."Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescricao" ADD CONSTRAINT "Prescricao_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "public"."Medicamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescricao" ADD CONSTRAINT "Prescricao_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemAgenda" ADD CONSTRAINT "ItemAgenda_prescricaoId_fkey" FOREIGN KEY ("prescricaoId") REFERENCES "public"."Prescricao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemAgenda" ADD CONSTRAINT "ItemAgenda_realizadoPor_fkey" FOREIGN KEY ("realizadoPor") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemAgenda" ADD CONSTRAINT "ItemAgenda_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "public"."Atendimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

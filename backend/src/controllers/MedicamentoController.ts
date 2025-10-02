import { Request, Response } from 'express'
import { prisma } from '../prismaClient'
import { Prisma } from '@prisma/client'

export const findMedicamentoById = async (id: number) => {
  return prisma.medicamento.findUnique({ where: { id } })
}

export const getMedicamentos = async (req: Request, res: Response) => {
  try {
    const medicamentos = await prisma.medicamento.findMany()
    if (!medicamentos.length) return res.status(404).json({ error: 'Nenhum medicamento cadastrado.' })
    res.json(medicamentos)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar medicamentos' })
  }
}

export const getMedicamentoById = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const medicamento = await findMedicamentoById(Number(id))
    if (!medicamento) return res.status(404).json({ error: 'Medicamento não encontrado' })
    res.json(medicamento)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar medicamento' })
  }
}

export const createMedicamento = async (req: Request, res: Response) => {
  const { descricao, dosagem, createdBy } = req.body
  try {
    const novoMedicamento = await prisma.medicamento.create({
      data: {
        descricao,
        dosagem,
        createdBy,
        createdOn: new Date()
      }
    })
    res.json(novoMedicamento)
  } catch (error: any) {
    res.status(500).json({ error: error.message, details: error })
  }
}

export const updateMedicamento = async (req: Request, res: Response) => {
  const { id } = req.params
  const { descricao, dosagem, modifiedBy } = req.body
  try {
    const medicamentoExistente = await findMedicamentoById(Number(id))
    if (!medicamentoExistente) return res.status(404).json({ error: 'Medicamento não encontrado' })

    const dataToUpdate: Prisma.MedicamentoUpdateInput = { modifiedOn: new Date() }

    if (descricao !== undefined) dataToUpdate.descricao = descricao
    if (dosagem !== undefined) dataToUpdate.dosagem = dosagem
    if (modifiedBy !== undefined) dataToUpdate.modifiedBy = modifiedBy

    const medicamentoAtualizado = await prisma.medicamento.update({
      where: { id: Number(id) },
      data: dataToUpdate
    })
    res.json(medicamentoAtualizado)
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Medicamento não encontrado' })
    res.status(500).json({ error: 'Erro ao atualizar medicamento' })
  }
}

export const deleteMedicamento = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const medicamentoExistente = await findMedicamentoById(Number(id))
    if (!medicamentoExistente) return res.status(404).json({ error: 'Medicamento não encontrado' })

    await prisma.medicamento.delete({ where: { id: Number(id) } })
    res.json({ message: 'Medicamento deletado com sucesso' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar medicamento' })
  }
}

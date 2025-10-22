import { Request, Response } from 'express'
import { prisma } from '../prismaClient'
import { Prisma } from '@prisma/client'
import jwt from 'jsonwebtoken'

const getUserIdFromReq = (req: Request): number | null => {
  const token = req.cookies?.token
  if (!token) return null
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number }
    return decoded.id
  } catch {
    return null
  }
}

export const findMedicAtendById = async (id: number) => {
  return prisma.medicamentosAtend.findUnique({ where: { id } })
}

export const getMedicamentosAtend = async (req: Request, res: Response) => {
  try {
    const registros = await prisma.medicamentosAtend.findMany({
      include: { atendimento: true, medicamento: true }
    })
    if (!registros.length) return res.status(404).json({ error: 'Nenhum vínculo encontrado.' })
    res.json(registros)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar vínculos de medicamentos em atendimentos' })
  }
}

export const getMedicamentoAtendById = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const registro = await findMedicAtendById(Number(id))
    if (!registro) return res.status(404).json({ error: 'Vínculo não encontrado' })
    res.json(registro)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar vínculo' })
  }
}

export const createMedicamentoAtend = async (req: Request, res: Response) => {
  let { atendId, medId, qtde } = req.body
  const userId = getUserIdFromReq(req)
  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

  atendId = Number(atendId)
  medId = Number(medId)

  try {
    const novo = await prisma.medicamentosAtend.create({
      data: {
        atendId,
        medId,
        qtde,
        createdBy: userId,
        createdOn: new Date()
      }
    })
    res.json(novo)
  } catch (error: any) {
    console.error('ERRO CREATE MEDICAMENTO ATEND:', error)
    res.status(500).json({ error: error.message, details: error })
  }
}

export const updateMedicamentoAtend = async (req: Request, res: Response) => {
  const { id } = req.params
  let { atendId, medId, qtde } = req.body
  const userId = getUserIdFromReq(req)
  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

  try {
    const existente = await findMedicAtendById(Number(id))
    if (!existente) return res.status(404).json({ error: 'Vínculo não encontrado' })

    const dataToUpdate: Prisma.MedicamentosAtendUpdateInput = {
      modifiedOn: new Date(),
      modifiedBy: userId
    }

    if (atendId !== undefined) dataToUpdate.atendimento = { connect: { id: Number(atendId) } }
    if (medId !== undefined) dataToUpdate.medicamento = { connect: { id: Number(medId) } }
    if (qtde !== undefined) dataToUpdate.qtde = qtde

    const atualizado = await prisma.medicamentosAtend.update({
      where: { id: Number(id) },
      data: dataToUpdate
    })
    res.json(atualizado)
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Vínculo não encontrado' })
    res.status(500).json({ error: 'Erro ao atualizar vínculo' })
  }
}

export const deleteMedicamentoAtend = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const existente = await findMedicAtendById(Number(id))
    if (!existente) return res.status(404).json({ error: 'Vínculo não encontrado' })

    await prisma.medicamentosAtend.delete({ where: { id: Number(id) } })
    res.json({ message: 'Vínculo excluído com sucesso' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir vínculo' })
  }
}

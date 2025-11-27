import { Request, Response } from 'express'
import { prisma } from '../prismaClient'
import { Prisma } from '@prisma/client'
import jwt from 'jsonwebtoken'

const getUserIdFromReq = (req: Request) => {
  let token = req.cookies?.token

  if (!token) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }
  }

  if (!token) return null

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: number, permissoes: string[] }
  } catch {
    return null
  }
}

export const findMedicAtendById = async (id: number) => {
  return prisma.medicamentosAtend.findUnique({ where: { id } })
}

export const getMedicamentosAtend = async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req)
  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

  try {
    const registros = await prisma.medicamentosAtend.findMany({
      include: {
        atendimento: true,
        medicamento: true
      }
    })

    if (!registros.length)
      return res.status(404).json({ error: 'Nenhum vínculo encontrado' })

    res.json(registros)
  } catch {
    res.status(500).json({ error: 'Erro ao buscar vínculos de medicamentos em atendimentos' })
  }
}

export const getMedicamentoAtendById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const registro = await findMedicAtendById(Number(id))
    if (!registro) return res.status(404).json({ error: 'Vínculo não encontrado' })

    res.json(registro)
  } catch {
    res.status(500).json({ error: 'Erro ao buscar vínculo' })
  }
}

export const createMedicamentoAtend = async (req: Request, res: Response) => {
  let { atendimentoId, medicamentoId, dosagem, frequencia, duracao, observacao } = req.body

  const userId = getUserIdFromReq(req)
  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

  try {
    const novo = await prisma.medicamentosAtend.create({
      data: {
        atendimentoId: Number(atendimentoId),
        medicamentoId: Number(medicamentoId),
        dosagem,
        frequencia,
        duracao,
        observacao
      }
    })

    res.json(novo)
  } catch (error: any) {
    console.error('ERRO CREATE MEDICAMENTO ATEND:', error)
    res.status(500).json({ error: error.message })
  }
}

export const updateMedicamentoAtend = async (req: Request, res: Response) => {
  const { id } = req.params
  let { atendimentoId, medicamentoId, dosagem, frequencia, duracao, observacao } = req.body

  const userId = getUserIdFromReq(req)
  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

  try {
    const existente = await findMedicAtendById(Number(id))
    if (!existente) return res.status(404).json({ error: 'Vínculo não encontrado' })

    const dataToUpdate: Prisma.MedicamentosAtendUpdateInput = {}

    if (atendimentoId !== undefined)
      dataToUpdate.atendimento = { connect: { id: Number(atendimentoId) } }

    if (medicamentoId !== undefined)
      dataToUpdate.medicamento = { connect: { id: Number(medicamentoId) } }

    if (dosagem !== undefined) dataToUpdate.dosagem = dosagem
    if (frequencia !== undefined) dataToUpdate.frequencia = frequencia
    if (duracao !== undefined) dataToUpdate.duracao = duracao
    if (observacao !== undefined) dataToUpdate.observacao = observacao

    const atualizado = await prisma.medicamentosAtend.update({
      where: { id: Number(id) },
      data: dataToUpdate
    })

    res.json(atualizado)
  } catch (error: any) {
    if (error.code === 'P2025')
      return res.status(404).json({ error: 'Vínculo não encontrado' })

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
  } catch {
    res.status(500).json({ error: 'Erro ao excluir vínculo' })
  }
}

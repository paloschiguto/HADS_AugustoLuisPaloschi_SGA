import { Request, Response } from 'express'
import { prisma } from '../prismaClient'

export const getAtendimentos = async (req: Request, res: Response) => {
  try {
    const atendimentos = await prisma.atendimento.findMany({
      include: {
        usuario: true,
        paciente: true,
        medicamentos: true
      }
    })
    if (!atendimentos.length) return res.status(404).json({ error: 'Nenhum atendimento cadastrado.' })
    res.json(atendimentos)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar atendimentos' })
  }
}

export const getAtendimentoById = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const atendimento = await prisma.atendimento.findUnique({
      where: { id: Number(id) },
      include: {
        usuario: true,
        paciente: true,
        medicamentos: true
      }
    })
    if (!atendimento) return res.status(404).json({ error: 'Atendimento não encontrado' })
    res.json(atendimento)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar atendimento' })
  }
}

export const createAtendimento = async (req: Request, res: Response) => {
  const { descricao, obs, finalizado, usuId, pacId, createdBy } = req.body
  try {
    const novoAtendimento = await prisma.atendimento.create({
      data: {
        descricao,
        obs: obs || null,
        finalizado: finalizado ?? false,
        usuId,
        pacId,
        createdBy,
        createdOn: new Date()
      }
    })
    res.json(novoAtendimento)
  } catch (error: any) {
    res.status(500).json({ error: error.message, details: error })
  }
}

export const updateAtendimento = async (req: Request, res: Response) => {
  const { id } = req.params
  const { descricao, obs, finalizado, usuId, pacId, modifiedBy } = req.body
  try {
    const atendimentoAtualizado = await prisma.atendimento.update({
      where: { id: Number(id) },
      data: {
        descricao,
        obs: obs || null,
        finalizado,
        usuId,
        pacId,
        modifiedBy,
        modfiedOn: new Date()
      }
    })
    res.json(atendimentoAtualizado)
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Atendimento não encontrado' })
    res.status(500).json({ error: 'Erro ao atualizar atendimento' })
  }
}

export const deleteAtendimento = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    await prisma.atendimento.delete({ where: { id: Number(id) } })
    res.json({ message: 'Atendimento deletado com sucesso' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar atendimento' })
  }
}
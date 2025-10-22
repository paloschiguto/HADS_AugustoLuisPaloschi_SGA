import { Request, Response } from 'express'
import { prisma } from '../prismaClient'
import { Prisma } from '@prisma/client'
import jwt from 'jsonwebtoken'

// Função auxiliar para pegar o ID do usuário logado pelo token JWT nos cookies
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

// Função auxiliar para buscar atendimento por ID
export const findAtendimentoById = async (id: number) => {
  return prisma.atendimento.findUnique({ where: { id } })
}

// Buscar todos os atendimentos
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

// Buscar atendimento por ID
export const getAtendimentoById = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const atendimento = await findAtendimentoById(Number(id))
    if (!atendimento) return res.status(404).json({ error: 'Atendimento não encontrado' })
    res.json(atendimento)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar atendimento' })
  }
}

// Criar novo atendimento
export const createAtendimento = async (req: Request, res: Response) => {
  let { descricao, obs, finalizado, usuId, pacId } = req.body
  const userId = getUserIdFromReq(req)

  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

  // Converte IDs para número
  usuId = Number(usuId)
  pacId = Number(pacId)

  try {
    const novoAtendimento = await prisma.atendimento.create({
      data: {
        descricao,
        obs: obs || null,
        finalizado: finalizado ?? false,
        usuId,
        pacId,
        createdBy: userId,
        createdOn: new Date()
      }
    })
    res.json({
      message: "Atendimento criado com sucesso!",
      atendimento: novoAtendimento
    })
  } catch (error: any) {
    console.error('ERRO CREATE ATENDIMENTO:', error)
    res.status(500).json({ error: error.message, details: error })
  }
}

// Atualizar atendimento existente
export const updateAtendimento = async (req: Request, res: Response) => {
  const { id } = req.params
  let { descricao, obs, finalizado, usuId, pacId } = req.body
  const userId = getUserIdFromReq(req)

  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

  try {
    const atendimentoExistente = await findAtendimentoById(Number(id))
    if (!atendimentoExistente) return res.status(404).json({ error: 'Atendimento não encontrado' })

    const dataToUpdate: Prisma.AtendimentoUpdateInput = {
      modifiedOn: new Date(),
      modifiedBy: userId
    }

    if (descricao !== undefined) dataToUpdate.descricao = descricao
    if (obs !== undefined) dataToUpdate.obs = obs || null
    if (finalizado !== undefined) dataToUpdate.finalizado = finalizado
    if (usuId !== undefined) dataToUpdate.usuario = { connect: { id: Number(usuId) } }
    if (pacId !== undefined) dataToUpdate.paciente = { connect: { id: Number(pacId) } }

    const atendimentoAtualizado = await prisma.atendimento.update({
      where: { id: Number(id) },
      data: dataToUpdate
    })
    res.json(atendimentoAtualizado)
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Atendimento não encontrado' })
    res.status(500).json({ error: 'Erro ao atualizar atendimento' })
  }
}

// Deletar atendimento
export const deleteAtendimento = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const atendimentoExistente = await findAtendimentoById(Number(id))
    if (!atendimentoExistente) return res.status(404).json({ error: 'Atendimento não encontrado' })

    await prisma.atendimento.delete({ where: { id: Number(id) } })
    res.json({ message: 'Atendimento deletado com sucesso' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar atendimento' })
  }
}

import { Request, Response } from 'express'
import { prisma } from '../prismaClient'
import { Prisma } from '@prisma/client'

// Função auxiliar para pegar o ID do usuário logado pelo token JWT
const getUserIdFromReq = (req: Request): number | null => { // ← ALTERAÇÃO
  const authHeader = req.headers.authorization
  if (!authHeader) return null
  const token = authHeader.split(' ')[1]
  try {
    const decoded: any = require('jsonwebtoken').verify(token, process.env.JWT_SECRET)
    return decoded.id
  } catch {
    return null
  }
}

export const findAtendimentoById = async (id: number) => {
  return prisma.atendimento.findUnique({ where: { id } })
}

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
    const atendimento = await findAtendimentoById(Number(id))
    if (!atendimento) return res.status(404).json({ error: 'Atendimento não encontrado' })
    res.json(atendimento)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar atendimento' })
  }
}

export const createAtendimento = async (req: Request, res: Response) => {
  const { descricao, obs, finalizado, usuId, pacId } = req.body
  const userId = getUserIdFromReq(req)

  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' }) // ← NOVA CHECAGEM

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
    res.status(500).json({ error: error.message, details: error })
  }
}

export const updateAtendimento = async (req: Request, res: Response) => {
  const { id } = req.params
  const { descricao, obs, finalizado, usuId, pacId } = req.body
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
    if (usuId !== undefined) dataToUpdate.usuario = { connect: { id: usuId } }
    if (pacId !== undefined) dataToUpdate.paciente = { connect: { id: pacId } }

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
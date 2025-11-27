import { Request, Response } from 'express'
import { prisma } from '../prismaClient'
import jwt from 'jsonwebtoken'
import { Prisma } from '@prisma/client'

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

export const findAtendimentoById = async (id: number) => {
  return prisma.atendimento.findUnique({
    where: { id },
    include: {
      usuario: true,
      paciente: true,
      medicamentos: {
        include: { medicamento: true }
      }
    }
  })
}

export const getAtendimentos = async (req: Request, res: Response) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'Usuário não autenticado' })

  let permissoes: string[] = []
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { permissoes: string[] }
    permissoes = payload.permissoes
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }

  if (!permissoes.includes('Atendimento'))
    return res.status(403).json({ error: 'Usuário não possui permissão para visualizar atendimentos' })

  try {
    const atendimentos = await prisma.atendimento.findMany({
      include: {
        usuario: true,
        paciente: true,
        medicamentos: { include: { medicamento: true } }
      },
      orderBy: { createdOn: 'desc' }
    })

    res.json(atendimentos)

  } catch {
    res.status(500).json({ error: 'Erro ao buscar atendimentos' })
  }
}

export const getAtendimentoById = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const atendimento = await findAtendimentoById(Number(id))
    if (!atendimento) return res.status(404).json({ error: 'Atendimento não encontrado' })

    res.json(atendimento)

  } catch {
    res.status(500).json({ error: 'Erro ao buscar atendimento' })
  }
}

export const createAtendimento = async (req: Request, res: Response) => {
  const {
    descricao,
    diagnostico,
    obs,
    cidade,
    uf,
    temperatura,
    peso,
    finalizado,
    pacId
  } = req.body

  const userId = getUserIdFromReq(req)
  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

  try {
    const novoAtendimento = await prisma.atendimento.create({
      data: {
        descricao,
        diagnostico: diagnostico || null,
        obs: obs || null,
        cidade,
        uf,
        temperatura: temperatura ? Number(temperatura) : null,
        peso: peso ? Number(peso) : null,
        finalizado: finalizado ?? false,
        createdBy: userId.id,
        pacId: Number(pacId)
      }
    })

    res.json({
      message: 'Atendimento criado com sucesso!',
      atendimento: novoAtendimento
    })

  } catch (error: any) {
    console.error('ERRO CREATE ATENDIMENTO:', error)
    res.status(500).json({ error: error.message })
  }
}

export const updateAtendimento = async (req: Request, res: Response) => {
  const { id } = req.params

  const {
    descricao,
    diagnostico,
    obs,
    cidade,
    uf,
    temperatura,
    peso,
    finalizado,
    pacId
  } = req.body

  const userId = getUserIdFromReq(req)
  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

  try {
    const atendimentoExistente = await findAtendimentoById(Number(id))
    if (!atendimentoExistente)
      return res.status(404).json({ error: 'Atendimento não encontrado' })

    const dataToUpdate: Prisma.AtendimentoUpdateInput = {
      modifiedOn: new Date(),
      modifiedBy: userId.id
    }

    if (descricao !== undefined) dataToUpdate.descricao = descricao
    if (diagnostico !== undefined) dataToUpdate.diagnostico = diagnostico
    if (obs !== undefined) dataToUpdate.obs = obs
    if (cidade !== undefined) dataToUpdate.cidade = cidade
    if (uf !== undefined) dataToUpdate.uf = uf
    if (temperatura !== undefined)
      dataToUpdate.temperatura = temperatura ? Number(temperatura) : null
    if (peso !== undefined)
      dataToUpdate.peso = peso ? Number(peso) : null
    if (finalizado !== undefined) dataToUpdate.finalizado = finalizado
    if (pacId !== undefined)
      dataToUpdate.paciente = { connect: { id: Number(pacId) } }

    const atendimentoAtualizado = await prisma.atendimento.update({
      where: { id: Number(id) },
      data: dataToUpdate
    })

    res.json(atendimentoAtualizado)

  } catch (error: any) {
    if (error.code === 'P2025')
      return res.status(404).json({ error: 'Atendimento não encontrado' })

    res.status(500).json({ error: 'Erro ao atualizar atendimento' })
  }
}

export const deleteAtendimento = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const atendimentoExistente = await findAtendimentoById(Number(id))
    if (!atendimentoExistente)
      return res.status(404).json({ error: 'Atendimento não encontrado' })

    await prisma.atendimento.delete({
      where: { id: Number(id) }
    })

    res.json({ message: 'Atendimento deletado com sucesso' })

  } catch {
    res.status(500).json({ error: 'Erro ao deletar atendimento' })
  }
}
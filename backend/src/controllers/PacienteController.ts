import { Request, Response } from 'express'
import { prisma } from '../prismaClient'
import { Prisma } from '@prisma/client'
import jwt from 'jsonwebtoken'

const getUserFromReq = (req: Request) => {
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

export const findPacienteById = async (id: number) => {
  return prisma.paciente.findUnique({ where: { id } })
}

export const getPacientes = async (req: Request, res: Response) => {
  const user = getUserFromReq(req)
  if (!user) return res.status(401).json({ error: 'Usuário não autenticado' })
  if (!user.permissoes.includes('Paciente')) return res.status(403).json({ error: 'Sem permissão para visualizar pacientes' })

  try {
    const pacientes = await prisma.paciente.findMany({
      include: { responsavel: true }
    })
    if (!pacientes.length) return res.status(404).json({ error: 'Nenhum paciente cadastrado.' })
    res.json(pacientes)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pacientes' })
  }
}

export const getPacienteById = async (req: Request, res: Response) => {
  const user = getUserFromReq(req)
  if (!user) return res.status(401).json({ error: 'Usuário não autenticado' })
  if (!user.permissoes.includes('Paciente')) return res.status(403).json({ error: 'Sem permissão para visualizar pacientes' })

  const { id } = req.params
  try {
    const paciente = await findPacienteById(Number(id))
    if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' })
    res.json(paciente)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar paciente' })
  }
}

export const createPaciente = async (req: Request, res: Response) => {
  const user = getUserFromReq(req)
  if (!user) return res.status(401).json({ error: 'Usuário não autenticado' })
  if (!user.permissoes.includes('Paciente')) return res.status(403).json({ error: 'Sem permissão para criar pacientes' })

  const { nome, dataNasc, respId } = req.body

  try {
    const novoPaciente = await prisma.paciente.create({
      data: {
        nome,
        dataNasc: dataNasc ? new Date(dataNasc) : null,
        respId: respId || null,
        createdBy: user.id,
        createdOn: new Date()
      }
    })
    res.json(novoPaciente)
  } catch (error: any) {
    console.error('ERRO CREATE PACIENTE:', error)
    res.status(500).json({ error: error.message, details: error })
  }
}

export const updatePaciente = async (req: Request, res: Response) => {
  const user = getUserFromReq(req)
  if (!user) return res.status(401).json({ error: 'Usuário não autenticado' })
  if (!user.permissoes.includes('Paciente')) return res.status(403).json({ error: 'Sem permissão para atualizar pacientes' })

  const { id } = req.params
  const { nome, dataNasc, respId } = req.body

  try {
    const pacienteExistente = await findPacienteById(Number(id))
    if (!pacienteExistente) return res.status(404).json({ error: 'Paciente não encontrado' })

    const dataToUpdate: Prisma.PacienteUpdateInput = { modifiedOn: new Date(), modifiedBy: user.id }

    if (nome !== undefined) dataToUpdate.nome = nome
    if (dataNasc !== undefined) dataToUpdate.dataNasc = dataNasc ? new Date(dataNasc) : null
    if (respId !== undefined) {
      dataToUpdate.responsavel = respId ? { connect: { id: respId } } : { disconnect: true }
    }

    const pacienteAtualizado = await prisma.paciente.update({
      where: { id: Number(id) },
      data: dataToUpdate
    })
    res.json(pacienteAtualizado)
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Paciente não encontrado' })
    res.status(500).json({ error: 'Erro ao atualizar paciente' })
  }
}

export const deletePaciente = async (req: Request, res: Response) => {
  const user = getUserFromReq(req)
  if (!user) return res.status(401).json({ error: 'Usuário não autenticado' })
  if (!user.permissoes.includes('Paciente')) return res.status(403).json({ error: 'Sem permissão para deletar pacientes' })

  const { id } = req.params
  try {
    const pacienteExistente = await findPacienteById(Number(id))
    if (!pacienteExistente) return res.status(404).json({ error: 'Paciente não encontrado' })

    await prisma.paciente.delete({ where: { id: Number(id) } })
    res.json({ message: 'Paciente deletado com sucesso' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar paciente' })
  }
}

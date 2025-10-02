import { Request, Response } from 'express'
import { prisma } from '../prismaClient'
import { Prisma } from '@prisma/client'

export const findPacienteById = async (id: number) => {
  return prisma.paciente.findUnique({ where: { id } })
}

export const getPacientes = async (req: Request, res: Response) => {
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
  const { nome, dataNasc, respId, createdBy } = req.body
  try {
    const novoPaciente = await prisma.paciente.create({
      data: {
        nome,
        dataNasc: dataNasc ? new Date(dataNasc) : null,
        respId: respId || null,
        createdBy,
        createdOn: new Date()
      }
    })
    res.json(novoPaciente)
  } catch (error: any) {
    res.status(500).json({ error: error.message, details: error })
  }
}

export const updatePaciente = async (req: Request, res: Response) => {
  const { id } = req.params
  const { nome, dataNasc, respId, modifiedBy } = req.body
  try {
    const pacienteExistente = await findPacienteById(Number(id))
    if (!pacienteExistente) return res.status(404).json({ error: 'Paciente não encontrado' })

    const dataToUpdate: Prisma.PacienteUpdateInput = { modifiedOn: new Date() }

    if (nome !== undefined) dataToUpdate.nome = nome
    if (dataNasc !== undefined) dataToUpdate.dataNasc = dataNasc ? new Date(dataNasc) : null
    if (respId !== undefined) dataToUpdate.responsavel = respId ? { connect: { id: respId } } : { disconnect: true }
    if (modifiedBy !== undefined) dataToUpdate.modifiedBy = modifiedBy

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
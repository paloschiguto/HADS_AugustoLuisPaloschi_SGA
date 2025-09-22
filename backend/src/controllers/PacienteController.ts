import { Request, Response } from 'express'
import { prisma } from '../prismaClient'

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
    const paciente = await prisma.paciente.findUnique({
      where: { id: Number(id) },
      include: { responsavel: true }
    })
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
    const pacienteAtualizado = await prisma.paciente.update({
      where: { id: Number(id) },
      data: {
        nome,
        dataNasc: dataNasc ? new Date(dataNasc) : null,
        respId: respId || null,
        modifiedBy,
        modifiedOn: new Date()
      }
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
    await prisma.paciente.delete({ where: { id: Number(id) } })
    res.json({ message: 'Paciente deletado com sucesso' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar paciente' })
  }
}
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

export const findMedicamentoById = async (id: number) => {
  return prisma.medicamento.findUnique({ where: { id } })
}

export const getMedicamentos = async (req: Request, res: Response) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'Usuário não autenticado' })

  let permissoes: string[] = []
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { permissoes: string[] }
    permissoes = payload.permissoes
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }

  if (!permissoes.includes('Medicamento')) {
    return res.status(403).json({ error: 'Usuário não possui permissão para visualizar medicamentos' })
  }

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
  const { descricao, dosagem } = req.body
  const userId = getUserIdFromReq(req)
  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

  try {
    const novoMedicamento = await prisma.medicamento.create({
      data: {
        descricao,
        dosagem,
        createdBy: userId.id,
        createdOn: new Date()
      }
    })
    res.json(novoMedicamento)
  } catch (error: any) {
    console.error('ERRO CREATE MEDICAMENTO:', error)
    res.status(500).json({ error: error.message, details: error })
  }
}

export const updateMedicamento = async (req: Request, res: Response) => {
  const { id } = req.params
  const { descricao, dosagem } = req.body
  const userId = getUserIdFromReq(req)
  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

  try {
    const medicamentoExistente = await findMedicamentoById(Number(id))
    if (!medicamentoExistente) return res.status(404).json({ error: 'Medicamento não encontrado' })

    const dataToUpdate: Prisma.MedicamentoUpdateInput = { modifiedOn: new Date(), modifiedBy: userId.id }

    if (descricao !== undefined) dataToUpdate.descricao = descricao
    if (dosagem !== undefined) dataToUpdate.dosagem = dosagem

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

import { Request, Response } from 'express'
import { prisma } from '../prismaClient'

export const getPermissoes = async (_req: Request, res: Response) => {
  try {
    const permissoes = await prisma.permissao.findMany({
      orderBy: { nome: 'asc' }
    })
    res.json(permissoes)
  } catch (error: any) {
    console.error('Erro ao buscar permissões:', error)
    res.status(500).json({ error: 'Erro ao buscar permissões', details: error.message })
  }
}

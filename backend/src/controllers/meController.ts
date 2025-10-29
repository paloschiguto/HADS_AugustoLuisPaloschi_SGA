import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../prismaClient'

export const meController = async (req: Request, res: Response) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'Não autenticado' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number
      nome: string
      email: string
      tpUsuId: number
    }

    const tipo = await prisma.tipoDeUsuario.findUnique({
      where: { id: payload.tpUsuId },
      include: { permissoes: true }
    })

    if (!tipo) return res.status(404).json({ error: 'Tipo de usuário não encontrado' })

    res.json({
      id: payload.id,
      nome: payload.nome,
      email: payload.email,
      tpUsuId: payload.tpUsuId,
      tipoUsuario: {
        id: tipo.id,
        descricao: tipo.descricao,
        permissoes: tipo.permissoes.map(p => p.nome)
      },
      permissoes: tipo.permissoes.map(p => p.nome)
    })
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' })
  }
}

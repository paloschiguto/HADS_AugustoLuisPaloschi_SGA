import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  id: number
  nome: string
  email: string
  tpUsuId: number
}

export const meController = (req: Request, res: Response) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'Não autenticado' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    res.json({
      id: payload.id,
      nome: payload.nome,
      email: payload.email,
      tpUsuId: payload.tpUsuId
    })
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' })
  }
}

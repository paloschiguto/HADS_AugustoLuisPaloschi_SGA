import { Request, Response } from 'express'
import { prisma } from '../prismaClient'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const login = async (req: Request, res: Response) => {
    const { email, senha } = req.body

    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { email },
            include: { tipo: true }
        })

        const senhaValida = usuario && await bcrypt.compare(senha, usuario?.senha || '')
        if (!usuario || !senhaValida || !usuario.ativo) {
            return res.status(401).json({ error: 'Credenciais inválidas ou usuário inativo.' })
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, tpUsuId: usuario.tpUsuId },
            process.env.JWT_SECRET as string,
            { expiresIn: '2h' }
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax',
            maxAge: 2 * 60 * 60 * 1000 
        })

        res.json({
            usuario: {
                nome: usuario.nome,
                tipo: usuario.tipo.descricao,
            }
        })
    } catch (error: any) {
        res.status(500).json({ error: 'Erro interno ao tentar fazer login', details: error.message })
    }
}

export const logout = async (_req: Request, res: Response) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    })
    res.json({ message: 'Logout realizado com sucesso' })
}

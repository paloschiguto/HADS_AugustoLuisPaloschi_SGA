import { Request, Response } from 'express'
import { prisma } from '../prismaClient'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'

// Função auxiliar para pegar o ID do usuário logado pelo token JWT
const getUserIdFromReq = (req: Request): number | null => {
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

export const findUsuarioById = async (id: number) => {
  return prisma.usuario.findUnique({ where: { id } })
}

export const getUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({ include: { tipo: true } })
    if (!usuarios.length) {
      return res.status(404).json({ error: 'Nenhum usuário cadastrado.' })
    }
    res.json(usuarios)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' })
  }
}

export const getUsuarioById = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const usuario = await findUsuarioById(Number(id))
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json(usuario)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário' })
  }
}

export const createUsuario = async (req: Request, res: Response) => {
  const { nome, email, senha, tpUsuId } = req.body

  const userId = getUserIdFromReq(req) 
  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' }) 

  try {
    const senhaForte = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(senha)
    if (!senhaForte) return res.status(400).json({ error: 'A senha deve ter no mínimo 8 caracteres, com letras e números' })

    const senhaHash = await bcrypt.hash(senha, 10)
    const novoUsuario = await prisma.usuario.create({
      data: { nome, email, senha: senhaHash, tpUsuId, createdBy: userId, createdOn: new Date() }
    })

    res.json(novoUsuario)
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Email já cadastrado' })
    res.status(500).json({ error: error.message, details: error })
  }
}

export const updateUsuario = async (req: Request, res: Response) => {
  const { id } = req.params
  const { nome, email, senha, tpUsuId } = req.body

  const userId = getUserIdFromReq(req) 
  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' })

  try {
    const usuarioExistente = await findUsuarioById(Number(id))
    if (!usuarioExistente) return res.status(404).json({ error: 'Usuário não encontrado' })

    const dataToUpdate: Prisma.UsuarioUpdateInput = { modifiedOn: new Date(), modifiedBy: userId } 
    if (nome !== undefined) dataToUpdate.nome = nome
    if (email !== undefined) dataToUpdate.email = email
    if (tpUsuId !== undefined) dataToUpdate.tipo = { connect: { id: tpUsuId } }

    if (senha !== undefined) {
      const senhaForte = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(senha)
      if (!senhaForte) return res.status(400).json({ error: 'A senha deve ter no mínimo 8 caracteres, com letras e números' })

      dataToUpdate.senha = await bcrypt.hash(senha, 10)
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: Number(id) },
      data: dataToUpdate
    })

    res.json(usuarioAtualizado)
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message })
  }
}

export const deleteUsuario = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const usuario = await findUsuarioById(Number(id))
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' })

    await prisma.usuario.delete({ where: { id: Number(id) } })
    res.json({ message: 'Usuário deletado com sucesso' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário' })
  }
}

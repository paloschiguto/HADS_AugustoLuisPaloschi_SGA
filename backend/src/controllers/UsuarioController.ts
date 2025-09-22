import { Request, Response } from 'express'
import { prisma } from '../prismaClient'

export const getUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: { tipo: true } // inclui o tipo de usuário
    })
    if (!usuarios.length) return res.status(404).json({ error: 'Nenhum usuário cadastrado.' })
    res.json(usuarios)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' })
  }
}

export const getUsuarioById = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) },
      include: { tipo: true }
    })
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json(usuario)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário' })
  }
}

export const createUsuario = async (req: Request, res: Response) => {
  const { nome, email, senha, tpUsuId, createdBy } = req.body
  try {
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha,
        tpUsuId,
        createdBy,
        createdOn: new Date()
      }
    })
    res.json(novoUsuario)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email já cadastrado' })
    }
    //res.status(500).json({ error: 'Erro ao criar usuário' })
    res.status(500).json({ error: error.message, details: error })
  }
}


export const updateUsuario = async (req: Request, res: Response) => {
  const { id } = req.params
  const { nome, email, senha, tpUsuId, modifiedBy } = req.body
  try {
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: Number(id) },
      data: {
        nome,
        email,
        senha,
        tpUsuId,
        modifiedBy,
        modifiedOn: new Date()
      }
    })
    res.json(usuarioAtualizado)
  } catch (error: any) {
    if (error.code === 'P2025') { // registro não encontrado
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }
    res.status(500).json({ error: 'Erro ao atualizar usuário' })
  }
}

export const deleteUsuario = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    await prisma.usuario.delete({ where: { id: Number(id) } })
    res.json({ message: 'Usuário deletado com sucesso' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário' })
  }
}
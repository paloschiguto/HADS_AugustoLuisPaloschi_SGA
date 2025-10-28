import { Request, Response } from 'express'
import { prisma } from '../prismaClient'
import { Prisma } from '@prisma/client'
import jwt from 'jsonwebtoken'

// Função para obter usuário logado e suas permissões pelo tipo
const getUserFromReq = async (req: Request) => {
  const token = req.cookies?.token
  if (!token) return null
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: number, tpUsuId: number }

    const tipo = await prisma.tipoDeUsuario.findUnique({
      where: { id: payload.tpUsuId },
      include: { permissoes: true }
    })

    return {
      id: payload.id,
      tpUsuId: payload.tpUsuId,
      permissoes: tipo?.permissoes.map(p => p.nome) || []
    }
  } catch {
    return null
  }
}

// Função auxiliar para buscar tipo por ID
export const findTipoById = async (id: number) => {
  return prisma.tipoDeUsuario.findUnique({ where: { id }, include: { permissoes: true } })
}

// Listar todos os tipos
export const getTipos = async (_req: Request, res: Response) => {
  try {
    const tipos = await prisma.tipoDeUsuario.findMany({ include: { permissoes: true } })
    if (!tipos.length) return res.status(404).json({ error: 'Nenhum tipo de usuário cadastrado.' })
    res.json(tipos)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tipos de usuário' })
  }
}

// Buscar tipo por ID
export const getTipoById = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const tipo = await findTipoById(Number(id))
    if (!tipo) return res.status(404).json({ error: 'Tipo de usuário não encontrado' })
    res.json(tipo)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tipo de usuário' })
  }
}

export const getTipoByDescricao = async (req: Request, res: Response) => {
  const { descricao } = req.query
  if (!descricao) return res.status(400).json({ error: 'Parâmetro descricao é obrigatório' })
  try {
    const tipos = await prisma.tipoDeUsuario.findMany({
      where: { descricao: { contains: descricao.toString(), mode: 'insensitive' } },
      include: { permissoes: true }
    })
    res.json(tipos)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tipos de usuário' })
  }
}


// Criar novo tipo
export const createTipo = async (req: Request, res: Response) => {
  const user = await getUserFromReq(req)
  if (!user) return res.status(401).json({ error: 'Usuário não autenticado' })

  // Controle granular por objeto
  if (!user.permissoes.includes('Tipo de Usuário')) {
    return res.status(403).json({ error: 'Sem permissão para criar tipos de usuário' })
  }

  const { descricao, permissoesIds } = req.body
  try {
    const novoTipo = await prisma.tipoDeUsuario.create({
      data: {
        descricao,
        createdBy: user.id,
        createdOn: new Date(),
        permissoes: {
          connect: permissoesIds?.map((id: number) => ({ id })) || []
        }
      },
      include: { permissoes: true }
    })
    res.json(novoTipo)
  } catch (error: any) {
    res.status(500).json({ error: error.message, details: error })
  }
}

// Atualizar tipo
export const updateTipo = async (req: Request, res: Response) => {
  const user = await getUserFromReq(req)
  if (!user) return res.status(401).json({ error: 'Usuário não autenticado' })

  if (!user.permissoes.includes('Tipo de Usuário')) {
    return res.status(403).json({ error: 'Sem permissão para atualizar tipos de usuário' })
  }

  const { id } = req.params
  const { descricao, permissoesIds } = req.body

  try {
    const tipo = await findTipoById(Number(id))
    if (!tipo) return res.status(404).json({ error: 'Tipo de usuário não encontrado' })

    const dataToUpdate: Prisma.TipoDeUsuarioUpdateInput = {
      modifiedBy: user.id,
      modifiedOn: new Date()
    }
    if (descricao !== undefined) dataToUpdate.descricao = descricao
    if (permissoesIds !== undefined) {
      dataToUpdate.permissoes = { set: permissoesIds.map((id: number) => ({ id })) }
    }

    const tipoAtualizado = await prisma.tipoDeUsuario.update({
      where: { id: Number(id) },
      data: dataToUpdate,
      include: { permissoes: true }
    })
    res.json(tipoAtualizado)
  } catch (error: any) {
    res.status(500).json({ error: error.message, details: error })
  }
}

// Deletar tipo
export const deleteTipo = async (req: Request, res: Response) => {
  const user = await getUserFromReq(req)
  if (!user) return res.status(401).json({ error: 'Usuário não autenticado' })

  if (!user.permissoes.includes('Tipo de Usuário')) {
    return res.status(403).json({ error: 'Sem permissão para deletar tipos de usuário' })
  }

  const { id } = req.params
  try {
    const tipo = await findTipoById(Number(id))
    if (!tipo) return res.status(404).json({ error: 'Tipo de usuário não encontrado' })

    await prisma.tipoDeUsuario.delete({ where: { id: Number(id) } })
    res.json({ message: 'Tipo de usuário deletado com sucesso' })
  } catch (error: any) {
    res.status(500).json({ error: error.message, details: error })
  }
}

import { Request, Response } from 'express'
import { prisma } from '../prismaClient'
import { Prisma } from '@prisma/client'

export const findTipoById = async (id: number) => {
    return prisma.tipoDeUsuario.findUnique({ where: { id } })
}

export const getTipos = async (_req: Request, res: Response) => {
    try {
        const tipos = await prisma.tipoDeUsuario.findMany()
        if (!tipos.length) {
            return res.status(404).json({ error: 'Nenhum tipo de usuário cadastrado.' })
        }
        res.json(tipos)
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar tipos de usuário' })
    }
}

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
            where: {
                descricao: {
                    contains: descricao.toString(),
                    mode: 'insensitive'
                }
            }
        })
        res.json(tipos)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Erro ao buscar tipos de usuário' })
    }
}

export const createTipo = async (req: Request, res: Response) => {
    const { descricao, createdBy } = req.body
    try {
        const novoTipo = await prisma.tipoDeUsuario.create({
            data: { descricao, createdBy, createdOn: new Date() }
        })
        res.json(novoTipo)
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar tipo de usuário' })
    }
}

export const updateTipo = async (req: Request, res: Response) => {
    const { id } = req.params
    const { descricao, modifiedBy } = req.body

    try {
        const tipo = await findTipoById(Number(id))
        if (!tipo) return res.status(404).json({ error: 'Tipo de usuário não encontrado' })

        const dataToUpdate: Prisma.TipoDeUsuarioUpdateInput = { modifiedOn: new Date() }
        if (descricao !== undefined) dataToUpdate.descricao = descricao
        if (modifiedBy !== undefined) dataToUpdate.modifiedBy = modifiedBy

        const tipoAtualizado = await prisma.tipoDeUsuario.update({
            where: { id: Number(id) },
            data: dataToUpdate
        })
        res.json(tipoAtualizado)
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar tipo de usuário' })
    }
}

export const deleteTipo = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const tipo = await findTipoById(Number(id))
        if (!tipo) return res.status(404).json({ error: 'Tipo de usuário não encontrado' })

        await prisma.tipoDeUsuario.delete({ where: { id: Number(id) } })
        res.json({ message: 'Tipo de usuário deletado com sucesso' })
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar tipo de usuário' })
    }
}

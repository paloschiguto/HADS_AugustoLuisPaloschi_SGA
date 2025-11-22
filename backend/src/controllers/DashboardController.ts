import { Request, Response } from 'express'
import { prisma } from '../prismaClient'
import jwt from 'jsonwebtoken'

// Função para obter usuário logado
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

// Estatísticas para médico
export const estatisticasMedico = async (req: Request, res: Response) => {
    const user = await getUserFromReq(req)
    if (!user) return res.status(401).json({ error: 'Usuário não autenticado' })

    try {
        const totalAtendimentos = await prisma.atendimento.count({
            where: { createdBy: user.id }
        })

        const totalPendentes = await prisma.atendimento.count({
            where: { createdBy: user.id, finalizado: false }
        })

        const totalOutros = await prisma.atendimento.count({
            where: { createdBy: { not: user.id } }
        })

        res.json({
            meusAtendimentos: totalAtendimentos ?? 0,
            meusPendentes: totalPendentes ?? 0,
            totalAtendimentos: totalOutros ?? 0
        })
    } catch (err: any) {
        console.error(err)
        res.status(500).json({ error: 'Erro ao buscar estatísticas do médico', details: err.message })
    }
}

// Atendimentos recentes do médico
export const atendimentosRecentesMedico = async (req: Request, res: Response) => {
    const user = await getUserFromReq(req)
    if (!user) return res.status(401).json({ error: 'Usuário não autenticado' })

    try {
        const atendimentos = await prisma.atendimento.findMany({
            where: { createdBy: user.id },
            orderBy: { createdOn: 'desc' },
            take: 10,
            include: { paciente: true }
        })

        const resultado = atendimentos.map(a => ({
            id: a.id,
            pacienteNome: a.paciente.nome,
            data: a.createdOn,
            finalizado: a.finalizado
        }))

        res.json(resultado)
    } catch (err: any) {
        console.error(err)
        res.status(500).json({ error: 'Erro ao buscar atendimentos recentes do médico', details: err.message })
    }
}

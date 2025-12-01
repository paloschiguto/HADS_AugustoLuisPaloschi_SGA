import { Request, Response } from 'express'
import { prisma } from '../prismaClient'
import jwt from 'jsonwebtoken'
import { addHours, startOfDay, endOfDay } from 'date-fns'


const getUserFromReq = (req: Request) => {
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

export const createPrescricao = async (req: Request, res: Response) => {

  const userToken = getUserFromReq(req)
  if (!userToken) return res.status(401).json({ error: 'Usuário não autenticado' })

  try {
    const usuarioLogado = await prisma.usuario.findUnique({
      where: { id: userToken.id },
      include: { tipo: true } 
    })

    if (!usuarioLogado) {
      return res.status(404).json({ error: 'Usuário logado não encontrado no banco.' })
    }

    const tipoDescricao = usuarioLogado.tipo.descricao

    console.log(`Tentativa de prescrição por: ${usuarioLogado.nome} | Cargo: ${tipoDescricao}`)

    const cargosPermitidos = ['Médico', 'ADM']

    if (!cargosPermitidos.includes(tipoDescricao)) {
      return res.status(403).json({
        error: `Permissão negada. Apenas Médicos ou Administradores podem prescrever. Seu cargo atual é: ${tipoDescricao}`
      })
    }

    const { pacienteId, medicamentoId, dosagem, frequenciaHoras, dataInicio, dataFim } = req.body

    if (!pacienteId || !medicamentoId || !dosagem || !frequenciaHoras || !dataInicio) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios (paciente, medicamento, dosagem, frequencia, dataInicio) devem ser preenchidos.' })
    }

    const result = await prisma.$transaction(async (tx) => {

      const novaPrescricao = await tx.prescricao.create({
        data: {
          pacienteId: Number(pacienteId),
          medicamentoId: Number(medicamentoId),
          dosagem,
          frequenciaHoras: Number(frequenciaHoras),
          dataInicio: new Date(dataInicio),
          dataFim: dataFim ? new Date(dataFim) : null,
          createdBy: usuarioLogado.id, 
          createdOn: new Date()
        }
      })

      const itensAgenda = []
      let dataHoraAtual = new Date(dataInicio)

      const limiteData = dataFim ? new Date(dataFim) : addHours(new Date(), 24 * 7)

      while (dataHoraAtual <= limiteData) {
        itensAgenda.push({
          prescricaoId: novaPrescricao.id,
          dataHoraPrevista: new Date(dataHoraAtual),
          status: 'PENDENTE'
        })

        dataHoraAtual = addHours(dataHoraAtual, Number(frequenciaHoras))
      }

      if (itensAgenda.length > 0) {
        await tx.itemAgenda.createMany({
          data: itensAgenda
        })
      }

      return novaPrescricao
    })

    return res.status(201).json({ message: 'Prescrição criada com sucesso!', prescricao: result })

  } catch (error: any) {
    console.error('Erro ao criar prescrição:', error)
    return res.status(500).json({ error: 'Erro interno ao processar prescrição', details: error.message })
  }
}

export const getAgendaDoDia = async (req: Request, res: Response) => {
  const user = getUserFromReq(req)
  if (!user) return res.status(401).json({ error: 'Usuário não autenticado' })

  const dataQuery = req.query.data ? String(req.query.data) : new Date()
  const dataBusca = new Date(dataQuery)

  try {
    const agenda = await prisma.itemAgenda.findMany({
      where: {
        dataHoraPrevista: {
          gte: startOfDay(dataBusca),
          lte: endOfDay(dataBusca)
        },
        status: { not: 'CANCELADO' }
      },
      include: {
        prescricao: {
          include: {
            paciente: { select: { nome: true } },
            medicamento: { select: { descricao: true } }
          }
        }
      },
      orderBy: {
        dataHoraPrevista: 'asc'
      }
    })

    if (!agenda.length) return res.status(200).json([])

    res.json(agenda)

  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar agenda', details: error.message })
  }
}


export const realizarBaixaAgenda = async (req: Request, res: Response) => {
  const user = getUserFromReq(req)
  if (!user) return res.status(401).json({ error: 'Usuário não autenticado' })
  
  const { itemAgendaId, temperatura } = req.body

  if (!itemAgendaId) return res.status(400).json({ error: 'ID do item é obrigatório.' })
  
  if (temperatura === undefined || temperatura === null || temperatura === '') {
    return res.status(400).json({ error: 'A medição da temperatura é obrigatória para realizar a baixa.' })
  }

  const tempFloat = parseFloat(String(temperatura).replace(',', '.'))
  if (isNaN(tempFloat)) {
    return res.status(400).json({ error: 'Temperatura inválida.' })
  }

  try {
    const itemExistente = await prisma.itemAgenda.findUnique({
      where: { id: Number(itemAgendaId) },
      include: { prescricao: true }
    })

    if (!itemExistente) return res.status(404).json({ error: 'Item não encontrado.' })
    if (itemExistente.status === 'REALIZADO') return res.status(400).json({ error: 'Já realizado.' })

    await prisma.$transaction(async (tx) => {

      const dadosAtendimento = {
        descricao: 'Administração de Medicamento (Via Agenda)',
        pacId: itemExistente.prescricao.pacienteId,
        finalizado: true,
        cidade: '', 
        uf: '',
        createdBy: user.id,
        createdOn: new Date(),
        
        temperatura: tempFloat, 

        obs: `Medicamento entregue. Temp: ${tempFloat}°C. Sinais vitais checados.`
      }

      const novoAtendimento = await tx.atendimento.create({
        data: dadosAtendimento
      })

      await tx.medicamentosAtend.create({
        data: {
          atendimentoId: novoAtendimento.id,
          medicamentoId: itemExistente.prescricao.medicamentoId,
          dosagem: itemExistente.prescricao.dosagem,
          frequencia: `Prescrito via agenda (${itemExistente.prescricao.frequenciaHoras}h)`,
          observacao: 'Baixa realizada com aferição de temperatura.',
        }
      })

      await tx.itemAgenda.update({
        where: { id: Number(itemAgendaId) },
        data: {
          status: 'REALIZADO',
          dataHoraRealizada: new Date(),
          realizadoPor: user.id,
          atendimentoId: novoAtendimento.id
        }
      })
    })

    res.json({ message: 'Medicamento administrado e temperatura registrada!' })

  } catch (error: any) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao realizar baixa', details: error.message })
  }
}
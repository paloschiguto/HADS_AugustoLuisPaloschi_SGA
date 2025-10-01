import { Request, Response } from 'express'
import { prisma } from '../prismaClient'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { enviarCodigoRecuperacao } from '../controllers/EnviaEmail'

// Solicitar código de recuperação
export const solicitarRecuperacao = async (req: Request, res: Response) => {
  const { email } = req.body

  if (!email) return res.status(400).json({ error: 'Email é obrigatório' })

  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario || !usuario.ativo) {
    return res.status(500).json({ message: 'Erro ao enviar o código para o e-mail informado.' })
  }

  const nome = usuario.nome.split(' ')[0]

  const codigo = crypto.randomInt(100000, 999999).toString()
  const hashCodigo = await bcrypt.hash(codigo, 10)

  await prisma.passwordReset.create({
    data: {
      usuId: usuario.id,
      codigo: hashCodigo
    }
  })

  // envia o código para o e-mail do usuário
  await enviarCodigoRecuperacao(email, nome, codigo)

  res.json({ message: 'Código enviado para o e-mail informado.' })
}

// Redefinir senha
export const redefinirSenha = async (req: Request, res: Response) => {
  const { email, codigo, novaSenha } = req.body

  if (!email || !codigo || !novaSenha) {
    return res.status(400).json({ error: 'Email, código e nova senha são obrigatórios' })
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario || !usuario.ativo) return res.status(400).json({ error: 'Usuário inválido ou inativo' })

  const reset = await prisma.passwordReset.findFirst({
    where: { usuId: usuario.id, used: false },
    orderBy: { created_on: 'desc' }
  })

  if (!reset) return res.status(400).json({ error: 'Código inválido' })

  const expiracao = new Date(reset.created_on.getTime() + 15 * 60 * 1000)
  if (expiracao < new Date()) return res.status(400).json({ error: 'Código expirado' })

  const codigoValido = await bcrypt.compare(codigo, reset.codigo)
  if (!codigoValido) return res.status(400).json({ error: 'Código inválido' })

  const senhaIgual = await bcrypt.compare(novaSenha, usuario.senha)
  if (senhaIgual) return res.status(400).json({ error: 'A nova senha não pode ser igual à antiga' })

  const senhaForte = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(novaSenha)
  if (!senhaForte) return res.status(400).json({ error: 'A senha deve ter no mínimo 8 caracteres, com letras e números' })

  const hashNova = await bcrypt.hash(novaSenha, 10)
  await prisma.usuario.update({
    where: { email },
    data: {
      senha: novaSenha,
      modifiedBy: usuario.id, 
      modifiedOn: new Date()
    }
  })


  await prisma.passwordReset.update({
    where: { id: reset.id },
    data: { used: true }
  })

  res.json({ message: 'Senha alterada com sucesso' })
}
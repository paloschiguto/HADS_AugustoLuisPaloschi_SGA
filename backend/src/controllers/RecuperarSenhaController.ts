// import { Request, Response } from 'express'
// import { prisma } from '../prismaClient'
// import bcrypt from 'bcryptjs'
// import { Usuario } from '@prisma/client'

// export const solicitarRecuperacao = async (req: Request, res: Response) => {
//   const { email } = req.body
//   if (!email) return res.status(400).json({ error: 'Email é obrigatório' })

//   try {
//     const usuario: Usuario | null = await prisma.usuario.findUnique({ where: { email } })
//     if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' })
//     if (!usuario.ativo) return res.status(403).json({ error: 'Usuário inativo' })

//     const codigoRecuperacao = Math.floor(100000 + Math.random() * 900000).toString()

//     // TODO: enviar códigoRecuperacao por email
//     await prisma.usuario.update({
//       where: { id: usuario.id },
//       data: { resetCode: codigoRecuperacao } // você precisa criar a coluna resetCode no schema
//     })

//     res.json({ message: 'Código de recuperação enviado para o email cadastrado' })
//   } catch (error: any) {
//     res.status(500).json({ error: 'Erro interno ao tentar recuperar senha', details: error.message })
//   }
// }

// export const resetarSenha = async (req: Request, res: Response) => {
//   const { email, codigo, novaSenha } = req.body
//   if (!email || !codigo || !novaSenha) return res.status(400).json({ error: 'Campos obrigatórios ausentes' })
//   if (novaSenha.length < 8) return res.status(400).json({ error: 'Senha deve ter no mínimo 8 caracteres' })

//   try {
//     const usuario: Usuario | null = await prisma.usuario.findUnique({ where: { email } })
//     if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' })
//     if (!usuario.ativo) return res.status(403).json({ error: 'Usuário inativo' })

//     if (usuario.resetCode !== codigo) return res.status(400).json({ error: 'Código de recuperação inválido' })

//     const senhaHash = await bcrypt.hash(novaSenha, 10)
//     if (await bcrypt.compare(novaSenha, usuario.senha)) return res.status(400).json({ error: 'Nova senha não pode ser igual à antiga' })

//     await prisma.usuario.update({
//       where: { id: usuario.id },
//       data: { senha: senhaHash, resetCode: null } // limpa o código após uso
//     })

//     res.json({ message: 'Senha alterada com sucesso' })
//   } catch (error: any) {
//     res.status(500).json({ error: 'Erro interno ao tentar resetar senha', details: error.message })
//   }
// }
import nodemailer from 'nodemailer'

export const enviarCodigoRecuperacao = async (para: string, nome: string, codigo: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  })

  await transporter.sendMail({
    from: '"SGA" <no-reply@sga.com>',
    to: para,
    subject: 'Código de recuperação de senha',
    text: `Olá ${nome}, tudo bem?
O código para redefinir sua senha é: ${codigo}`
  })
}

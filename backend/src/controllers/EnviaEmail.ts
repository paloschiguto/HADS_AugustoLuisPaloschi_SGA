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
    subject: 'Redefinição de senha - SGA 🔑',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #0056b3;">Olá, ${nome}!</h2>
        <p>Recebemos uma solicitação para redefinir a sua senha no <strong>Sistema de Gerenciamento de Asilo (SGA)</strong>.</p>
        <p>O seu código de recuperação é:</p>
        <p style="font-size: 20px; font-weight: bold; color: #d9534f;">${codigo}</p>
        <p><strong>⚠️ Atenção:</strong> este código é válido apenas por alguns minutos.</p>
        <p>Se você não fez essa solicitação, pode ignorar este e-mail com segurança.</p>
        <br>
        <p>Atenciosamente,<br>
        <strong>Equipe SGA</strong></p>
      </div>
    `
  })
}

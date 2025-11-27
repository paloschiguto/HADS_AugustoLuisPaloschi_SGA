import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const objetos = [
    'Medicamento',
    'Paciente',
    'Atendimento',
    'Usuário',
    'Tipo de Usuário',
    'Agenda'
  ]

  for (const nome of objetos) {
    await prisma.permissao.upsert({
      where: { nome },
      update: {},
      create: { nome }
    })
  }

  console.log('Seed de objetos finalizado!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

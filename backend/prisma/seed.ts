import { PrismaClient, Role } from '@prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await argon2.hash('admin1234')
  const guestPassword = await argon2.hash('guest1234')

  await prisma.user.upsert({
    where: { email: 'admin@nexio.dev' },
    update: {},
    create: {
      email: 'admin@nexio.dev',
      password: adminPassword,
      role: Role.admin,
    },
  })

  await prisma.user.upsert({
    where: { email: 'guest@nexio.dev' },
    update: {},
    create: {
      email: 'guest@nexio.dev',
      password: guestPassword,
      role: Role.guest,
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

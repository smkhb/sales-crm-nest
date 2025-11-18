import { PrismaClient, SalespersonRole } from '@prisma/client';
import { hash } from 'bcryptjs'; // ou sua lib de hash

const prisma = new PrismaClient();

async function main() {
  // Verifica se já existe um admin para não duplicar
  const adminExists = await prisma.salesperson.findUnique({
    where: { email: 'admin@crm.com' },
  });

  if (!adminExists) {
    const passwordHash = await hash('password', 6);

    await prisma.salesperson.create({
      data: {
        name: 'Super Admin',
        email: 'admin@crm.com',
        password: passwordHash,
        phone: '999999999',
        role: SalespersonRole.manager,
        isActive: true,
      },
    });
    console.log('👑 Admin criado com sucesso!');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

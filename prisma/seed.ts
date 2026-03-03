import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('password123', 10);
  const userPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin'
    }
  });

  await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Sample User',
      password: userPassword,
      role: 'customer'
    }
  });

  await prisma.test.create({
    data: {
      title: 'Smoke Test',
      description: 'Validate critical flows before release.',
      status: 'active'
    }
  });

  await prisma.test.create({
    data: {
      title: 'Regression Pack',
      description: 'Run full suite on staging environment.',
      status: 'draft'
    }
  });

  await prisma.test.create({
    data: {
      title: 'Archived Scenario',
      description: 'Legacy scenario no longer required.',
      status: 'archived'
    }
  });

  console.log(`Seeded admin: ${admin.email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

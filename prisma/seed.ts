import { PrismaClient, TestItemStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.admin,
      passwordHash,
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      email: 'editor@example.com',
      name: 'Editor User',
      role: UserRole.editor,
      passwordHash,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      name: 'Viewer User',
      role: UserRole.viewer,
      passwordHash,
    },
  });

  await prisma.testItem.deleteMany();

  await prisma.testItem.createMany({
    data: [
      {
        name: 'Regression Suite A',
        description: 'Baseline regression test set for core flows.',
        status: TestItemStatus.active,
      },
      {
        name: 'Payment Gateway Smoke',
        description: 'Smoke tests for payment integration.',
        status: TestItemStatus.draft,
      },
      {
        name: 'Archived Load Scenario',
        description: 'Legacy load test scenario for historical reference.',
        status: TestItemStatus.archived,
      },
      {
        name: 'Checkout Flow Validation',
        description: 'Validates checkout flow across browsers.',
        status: TestItemStatus.active,
      },
      {
        name: 'Mobile QA Set',
        description: 'QA checklist focused on mobile screens.',
        status: TestItemStatus.draft,
      },
    ],
  });

  console.log({ admin, editor, viewer });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

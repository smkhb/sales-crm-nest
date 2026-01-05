import { PrismaClient } from '@prisma/client';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient();

function generateUniqueDatabaseURL(schemaID: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set('schema', `e2e_${schemaID}`);
  return url.toString();
}

const schemaID = randomUUID();

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaID);
  process.env.DATABASE_URL = databaseURL;

  execSync('pnpm prisma migrate deploy');
});

afterAll(async () => {
  await prisma.$executeRawUnsafe(
    `DROP SCHEMA IF EXISTS "e2e_${schemaID}" CASCADE;`,
  );
  await prisma.$disconnect();
});

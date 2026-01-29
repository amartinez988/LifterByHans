import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db =
  global.prisma ||
  new PrismaClient({
    log: ["error", "warn"]
  });

// Cache globally to prevent connection exhaustion in serverless
global.prisma = db;

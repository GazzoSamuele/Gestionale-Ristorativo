import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

// Su Vercel la variabile va impostata dal pannello. Se manca, senza questo
// controllo l'errore arriva da dentro "pg" ed e' incomprensibile.
if (!connectionString) {
  throw new Error(
    "DATABASE_URL non impostata. In locale mettila nel file .env (vedi .env.example), " +
      "in produzione nelle Environment Variables del progetto."
  );
}

const adapter = new PrismaPg({
  connectionString
});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

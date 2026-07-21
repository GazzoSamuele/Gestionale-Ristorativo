import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// La stringa di connessione arriva dal .env — mai scritta dentro il codice.
const connectionString = process.env.DATABASE_URL;

// L'adapter è il "raccordo": unisce Prisma al driver pg, che parla con PostgreSQL.
const adapter = new PrismaPg({
  connectionString
});

// Il "cassetto globale".
// globalThis sopravvive alle ricariche di Next.js in sviluppo: le variabili normali
// vengono azzerate a ogni salvataggio, questa no.
// Il doppio "as" serve perché TypeScript non sa che ci mettiamo dentro un client:
// prima gli diciamo "dimentica cosa credi che sia" (as unknown),
// poi "consideralo un oggetto che PUÒ avere una proprietà prisma" (as { prisma?: ... }).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Se nel cassetto c'è già un client usa quello, altrimenti creane uno nuovo.
// L'operatore ?? significa esattamente "altrimenti".
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

// Solo in sviluppo: metti il client nel cassetto, così la prossima ricarica lo ritrova
// invece di aprire una connessione nuova. In produzione il codice si carica una volta
// sola, quindi il cassetto non serve.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

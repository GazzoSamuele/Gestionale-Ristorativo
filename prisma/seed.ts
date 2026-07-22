import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const tavoli = [
  { numero: 1, capienza: 2, posX: 40, posY: 40 },
  { numero: 2, capienza: 4, posX: 20, posY: 60 },
  { numero: 3, capienza: 6, posX: 40, posY: 90 },
  { numero: 4, capienza: 8, posX: 10, posY: 70 }
];

async function main() {
  for (const tavolo of tavoli) {
    await prisma.tavolo.upsert({
      where: { numero: tavolo.numero },
      update: tavolo,
      create: tavolo
    });
  }

  console.log(`Seed completato: ${tavoli.length} tavoli.`);
}
main()
  .catch((errore) => {
    console.error(errore);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

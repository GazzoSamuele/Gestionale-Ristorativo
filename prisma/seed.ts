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

  await prisma.piatto.deleteMany();
  await prisma.categoria.deleteMany();

  const primi = await prisma.categoria.create({ data: { nome: "Primi", ordine: 1 } });
  const secondi = await prisma.categoria.create({ data: { nome: "Secondi", ordine: 2 } });
  const bevande = await prisma.categoria.create({ data: { nome: "Bevande", ordine: 3 } });

  await prisma.piatto.createMany({
    data: [
      { nome: "Carbonara", prezzo: 12, categoriaId: primi.id },
      { nome: "Amatriciana", prezzo: 11, categoriaId: primi.id },
      { nome: "Tagliata di manzo", prezzo: 18, categoriaId: secondi.id },
      { nome: "Grigliata mista", prezzo: 20, categoriaId: secondi.id },
      { nome: "Acqua 1L", prezzo: 2, categoriaId: bevande.id },
      { nome: "Vino della casa", prezzo: 9, categoriaId: bevande.id }
    ]
  });

  console.log(`Seed completato: ${tavoli.length} tavoli, 3 categorie, 6 piatti.`);
}

main()
  .catch((errore) => {
    console.error(errore);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
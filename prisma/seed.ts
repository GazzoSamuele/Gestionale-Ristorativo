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

  await prisma.ordine.deleteMany();
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

  await prisma.presenza.deleteMany();
  await prisma.utente.deleteMany();

  const marco = await prisma.utente.create({ data: { nome: "Marco Verdi" } });
  const sara = await prisma.utente.create({ data: { nome: "Sara Gialli" } });
  const alessandro = await prisma.utente.create({ data: { nome: "Alessandro Rossi" } });
  const simone = await prisma.utente.create({ data: { nome: "Simone Neri" } });
  const fabio = await prisma.utente.create({ data: { nome: "Fabio Aranci" } });
  const alessia = await prisma.utente.create({ data: { nome: "Alessia Azzurri" } });

  await prisma.presenza.createMany({
    data: [
      { utenteId: marco.id },
      { utenteId: sara.id }
    ]
  });

  await prisma.prodotto.deleteMany();

  await prisma.prodotto.createMany({
    data: [
      { nome: "Guanciale", quantita: 10, limiteMinimo: 15, unita: "KG", fornitore: "RomaTravel" },
      { nome: "Pecorino romano", quantita: 2, limiteMinimo: 8, unita: "KG", fornitore: "Caseificio Aurelio" },
      { nome: "Pomodoro pelato", quantita: 6, limiteMinimo: 20, unita: "KG", fornitore: "OrtoSud" },
      { nome: "Spaghetti", quantita: 18, limiteMinimo: 20, unita: "KG", fornitore: "Pastificio Conti" },
      { nome: "Olio extravergine", quantita: 12, limiteMinimo: 10, unita: "L", fornitore: "Frantoio Verde" },
      { nome: "Uova", quantita: 180, limiteMinimo: 120, unita: "PZ", fornitore: "Cascina Bianca" },
      { nome: "Vino rosso della casa", quantita: 45, limiteMinimo: 24, unita: "L", fornitore: "Cantina Lupo" },
      { nome: "Farina 00", quantita: 60, limiteMinimo: 25, unita: "KG", fornitore: "Molino Sereni" }
    ]
  });

  await prisma.premio.deleteMany();
  await prisma.premio.createMany({
    data: [
      { nome: "Caffè omaggio", puntiRichiesti: 100 },
      { nome: "Dolce della casa", puntiRichiesti: 250 },
      { nome: "Sconto 15%", puntiRichiesti: 400 },
      { nome: "Menu degustazione", puntiRichiesti: 800 }
    ]
  });

  await prisma.cliente.deleteMany();
  await prisma.cliente.createMany({
    data: [
      { nome: "Mario Rossi", telefono: "3401234567", primaVisita: new Date("2024-03-12"), visite: 14, punti: 340 },
      { nome: "Anna Bianchi", telefono: "3487654321", primaVisita: new Date("2024-06-01"), visite: 6, punti: 120 },
      { nome: "Luca Ferrari", telefono: null, primaVisita: new Date("2025-01-20"), visite: 2, punti: 40 }
    ]
  });

  console.log(
    `Seed completato: ${tavoli.length} tavoli, 3 categorie, 6 piatti, 6 utenti, 2 presenze, 8 prodotti, 4 premi, 3 clienti`
  );
}

main()
  .catch((errore) => {
    console.error(errore);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
// SEED = riempire il database con dati di partenza.
// Serve per lavorare su qualcosa di realistico senza inserire tutto a mano ogni volta.

// Questo script gira FUORI da Next.js (lo lanci da terminale), quindi:
// - carica il .env da solo con dotenv
// - usa un percorso relativo per il client, non l'alias "@/" (che lo risolve Next)
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// I 4 tavoli finti. posX/posY sono le coordinate sulla pianta della sala.
const tavoli = [
  { numero: 1, capienza: 2, posX: 40, posY: 40 },
  { numero: 2, capienza: 4, posX: 200, posY: 40 },
  { numero: 3, capienza: 6, posX: 40, posY: 200 },
  { numero: 4, capienza: 8, posX: 200, posY: 200 }
];

async function main() {
  for (const tavolo of tavoli) {
    // upsert = "se esiste aggiornalo, se non esiste crealo".
    // Lo cerca per "numero" (che nello schema è @unique).
    // Così puoi rilanciare il seed quante volte vuoi senza creare doppioni.
    await prisma.tavolo.upsert({
      where: { numero: tavolo.numero },
      update: tavolo,
      create: tavolo
    });
  }

  console.log(`Seed completato: ${tavoli.length} tavoli.`);
}

// main() è asincrona (parla col database, quindi serve aspettare).
// .finally() chiude la connessione sia che vada bene sia che vada male:
// senza, lo script resterebbe appeso senza terminare.
main()
  .catch((errore) => {
    console.error(errore);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

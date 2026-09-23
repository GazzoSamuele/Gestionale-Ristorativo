import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { addHours, subDays, startOfDay, addMinutes } from "date-fns";
import { auth } from "../src/lib/auth";

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
  await prisma.occupazione.deleteMany();
  await prisma.prenotazione.deleteMany();
  await prisma.ingrediente.deleteMany();
  await prisma.fornitura.deleteMany();
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

  const ricercaPiatti = await prisma.piatto.findMany();
  const numeri = [2,1,7,4,3,5,6,4,3,2,6,1,7,4];

  for (let i = 0; i < 14; i++) {
    const giorno =  subDays(new Date(), i);
      for (let j = 0; j < numeri[i]; j++) {
        const piatto = ricercaPiatti[j % ricercaPiatti.length]
         await prisma.ordine.create({
          data: {                        
            nomeCliente: "Sara",
            creatoIl: giorno,
            statoDalle: giorno,
            stato: "PRONTI",
            fonte: "ASPORTO",
            righe: {
              create: [
                { piattoId: piatto.id, quantita: 2, prezzoUnitario: piatto.prezzo }
              ]
            }
          }
        });  
      }
    }
  
  await prisma.presenza.deleteMany();
  await prisma.utente.deleteMany();

  const ricercaTavoli = await prisma.tavolo.findMany({
    orderBy: { numero: "asc"}
  });
  const tavoliServiti = [0,7,10,9,2,4,6,7,9,10,9,2,4,6];
  const durataPermanenzaTavoli = [50, 75, 60, 90, 45, 105];

  for (let i = 0; i < 14; i++) {
    const giornoPartenzaCalcolo = subDays(new Date(), i);

      for (let k = 0; k < tavoliServiti[i]; k++) {
        const tavolo = ricercaTavoli[k % ricercaTavoli.length];
        const piatto = ricercaPiatti[k % ricercaPiatti.length];
        const inizio = addHours(startOfDay(giornoPartenzaCalcolo), 12 + k);
        const fine = addMinutes(inizio, durataPermanenzaTavoli[k % durataPermanenzaTavoli.length]);
        const occupazione = await prisma.occupazione.create({
            data: {
              tavoloId: tavolo.id,
              iniziataAlle: inizio,
              terminataAlle: fine,
              oraPagamento: fine, 
              copertiPresenti: tavolo.capienza
            }
          })

        await prisma.ordine.create({
          data: {                        
            creatoIl: addMinutes(inizio, 10),
            statoDalle: addMinutes(inizio, 10),
            occupazioneId: occupazione.id,
            stato: "PRONTI",
            fonte: "SALA",
            righe: {
              create: [
                { piattoId: piatto.id, quantita: tavolo.capienza, prezzoUnitario: piatto.prezzo }
              ]
            }
          }
        });  
      }
  }

  const prenotazioniPerGiorno = [0,4,5,6,7,8,9,10,11,12,8,4,9,3];
  const stati = ["IN_ATTESA", "IN_ATTESA", "IN_ATTESA", "ANNULLATA", "IN_ATTESA", "NON_PRESENTATA"] as const;

  for (let i = 0; i < 14; i++) {
      const giornoPartenzaCalcoloPrenotazioni = subDays(new Date(), i);

        for (let k = 0; k < prenotazioniPerGiorno[i]; k++) {
          const inizio = addHours(startOfDay(giornoPartenzaCalcoloPrenotazioni), 19 + (k % 4));
            await prisma.prenotazione.create({
              data: {
                nome: "Cliente di prova",
                dataOra: inizio,
                copertiPrenotati: 2 + (k % 5),
                stato: stati [k % stati.length],

              }
            })
      }
    }

    const staff = [
      { nome: "Samu", email: "samu@gestionale.local", ruolo: "SUPER_ADMIN" },
      { nome: "Locale", email: "locale@gestionale.local", ruolo: "OPERATORE" },
      { nome: "Marco Verdi", email: "marco.verdi@gestionale.local", ruolo: "OPERATORE" },
      { nome: "Sara Gialli", email: "sara.gialli@gestionale.local", ruolo: "OPERATORE" },
      { nome: "Alessandro Rossi", email: "alessandro.rossi@gestionale.local", ruolo: "ADMIN" },
      { nome: "Simone Neri", email: "simone.neri@gestionale.local", ruolo: "OPERATORE" },
      { nome: "Fabio Aranci", email: "fabio.aranci@gestionale.local", ruolo: "OPERATORE" },
      { nome: "Alessia Azzurri", email: "alessia.azzurri@gestionale.local", ruolo: "ADMIN" },
    ] as const;

    const utentiCreati = [];

    for (const riga of staff) {
      const risultato = await auth.api.signUpEmail({
        body: {
          name: riga.nome,
          email: riga.email,
          password: "gestionale2026"
        }
      });

      await prisma.utente.update({
        where: { id: risultato.user.id },
        data: { ruolo: riga.ruolo }
      });

      utentiCreati.push(risultato.user);
    }

    const marco = utentiCreati.find((u) => u.email === "marco.verdi@gestionale.local");
    const sara  = utentiCreati.find((u) => u.email === "sara.gialli@gestionale.local");

    if (!marco || !sara) {
      throw new Error(`Utenti non validi`);
    }

    await prisma.presenza.createMany({
      data: [
        { utenteId: marco.id },
        { utenteId: sara.id }
      ]
    });

  await prisma.prodotto.deleteMany();

  await prisma.prodotto.createMany({
    data: [
      { nome: "Guanciale", quantita: 10, limiteMinimo: 15, unita: "KG", fornitore: "RomaTravel", daOrdinare: true },
      { nome: "Pecorino romano", quantita: 2, limiteMinimo: 8, unita: "KG", fornitore: "Caseificio Aurelio", daOrdinare: true },
      { nome: "Pomodoro pelato", quantita: 6, limiteMinimo: 20, unita: "KG", fornitore: "OrtoSud" },
      { nome: "Spaghetti", quantita: 18, limiteMinimo: 20, unita: "KG", fornitore: "Pastificio Conti" },
      { nome: "Olio extravergine", quantita: 12, limiteMinimo: 10, unita: "L", fornitore: "Frantoio Verde" },
      { nome: "Uova", quantita: 180, limiteMinimo: 120, unita: "PZ", fornitore: "Cascina Bianca" },
      { nome: "Vino rosso della casa", quantita: 45, limiteMinimo: 24, unita: "L", fornitore: "Cantina Lupo" },
      { nome: "Farina 00", quantita: 60, limiteMinimo: 25, unita: "KG", fornitore: "Molino Sereni" }
    ]
  });

  const ricercaProdotti = await prisma.prodotto.findMany();

  const ricette = [
    { piatto: "Carbonara", prodotto: "Spaghetti", quantita: 0.1 },
    { piatto: "Carbonara", prodotto: "Guanciale", quantita: 0.05 },
    { piatto: "Carbonara", prodotto: "Uova", quantita: 1 },
    { piatto: "Carbonara", prodotto: "Pecorino romano", quantita: 0.015 },
    { piatto: "Amatriciana", prodotto: "Spaghetti", quantita: 0.1 },
    { piatto: "Amatriciana", prodotto: "Guanciale", quantita: 0.04 },
    { piatto: "Amatriciana", prodotto: "Pomodoro pelato", quantita: 0.1 },
    { piatto: "Amatriciana", prodotto: "Pecorino romano", quantita: 0.015 },
    { piatto: "Tagliata di manzo", prodotto: "Olio extravergine", quantita: 0.01 },
    { piatto: "Grigliata mista", prodotto: "Olio extravergine", quantita: 0.015 },
    { piatto: "Vino della casa", prodotto: "Vino rosso della casa", quantita: 0.5 }
  ];

  const alessandro = utentiCreati.find((u) => u.email === "alessandro.rossi@gestionale.local");
  const guanciale = ricercaProdotti.find((p) => p.nome === "Guanciale");
  const spaghetti = ricercaProdotti.find((p) => p.nome === "Spaghetti");

  if (!alessandro || !guanciale || !spaghetti) {
    throw new Error("Seed forniture: responsabile o prodotti non trovati");
  }

  await prisma.fornitura.create({
    data: {
      fornitore: "RomaTravel",
      creatoDaId: alessandro.id,
      righe: {
        create: [
          { prodottoId: guanciale.id, quantita: 10 }
        ]
      }
    }
  });

  await prisma.fornitura.create({
    data: {
      fornitore: "Pastificio Conti",
      creatoDaId: alessandro.id,
      ricevuta: true,
      creatoIl: subDays(new Date(), 4),
      ricevutaIl: subDays(new Date(), 2),
      righe: {
        create: [
          { prodottoId: spaghetti.id, quantita: 8 }
        ]
      },
      note: "Consegnata con un giorno di ritardo",
    }
  });

  for (const riga of ricette) {
    const piatto = ricercaPiatti.find((p) => p.nome === riga.piatto);
    const prodotto = ricercaProdotti.find((p) => p.nome === riga.prodotto);

    if (!piatto || !prodotto) {
      throw new Error(`Ricetta non valida: ${riga.piatto} / ${riga.prodotto}`);
    }

    await prisma.ingrediente.create({
      data: {
        piattoId: piatto.id,
        prodottoId: prodotto.id,
        quantita: riga.quantita
      }
    });
  }

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

    await prisma.segnalazione.createMany({
    data: [
      { testo: "Abbiamo aspettato 30 minuti prima di ordinare", utenteId: marco.id, creatoIl: new Date("2024-03-18"), letta: true },
      { testo: "I camerieri sono freddi e il servizio è stato lento", utenteId: sara.id, creatoIl: new Date("2024-03-18"), letta: false }
    ]
  });

  console.log(
    `Seed completato: ${tavoli.length} tavoli, 3 categorie, 6 piatti, 6 utenti, 2 presenze, 8 prodotti, 4 premi, 3 clienti, 2 segnalazioni`
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
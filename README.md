# 🍽️ Gestionale Ristorativo

Applicazione web per la gestione operativa di un ristorante: sala, prenotazioni, ordini, cucina, magazzino e personale — pensata per essere usata dallo staff durante il servizio, con schermate moderne e leggibili a colpo d'occhio.

> 🚧 **Progetto in fase di sviluppo attivo.** Quanto descritto qui sotto è funzionante e navigabile.

---

<img src="screen-gestionale-ristorante-1.png" alt="Sezione home dell'app" width="800">
<img src="screen-gestionale-ristorante-2.png" alt="Sezione gestione tavoli sala dell'app" width="800">
<img src="screen-gestionale-ristorante-5.png" alt="Sezione cucina dell'app" width="800">

---

## Cos'è

Uno strumento per aiutare il personale a lavorare meglio in sala e in cucina. Nasce da esperienza diretta nel settore ristorativo, e ogni schermata è progettata attorno a un momento reale del servizio: la calca all'ingresso, la gestione dei tavoli, il flusso degli ordini verso la cucina, il controllo delle scorte.

L'interfaccia è organizzata come un'unica **dashboard** in cui si naviga tra sezioni tramite una barra sempre presente, pensata per schermi da cassa e tablet.

---

## Funzionalità implementate

### Sala
- **Pianta della sala interattiva** — i tavoli sono disposti spazialmente come nel locale (posizione salvata su coordinate), con capienza e stato a colpo d'occhio.
- **Occupazione dei tavoli** con supporto ai **walk-in** (clienti senza prenotazione) e **timer** che misura da quanto un tavolo è occupato (base per il turnover).
- **Stato tavoli** — quadro riepilogativo (chi deve ancora pagare, chi deve ancora arrivare).
- **Consultazione menu** — piatti e bevande organizzati per categoria.
- **Presenze dipendenti** — elenco di chi è al lavoro.
- **Tessere punti** — scheda cliente con visite e punti fedeltà.

### Prenotazioni
- **Agenda a calendario** per consultare le prenotazioni.
- **Creazione e modifica** prenotazione tramite form (nome, telefono, coperti, data/ora, note).

### Ordini
- **Board in stile Kanban a 3 stati** (nuovi arrivati → in corso → pronti) per tracciare gli ordini.
- **Compositore ordine** per creare un asporto selezionando i piatti dal menu.

### Cucina
- **Coda di cucina (KDS)** divisa tra ordini di sala e asporti.
- **Magazzino** — scorte con quantità, limite minimo, unità di misura e fornitore.

---

## Stack tecnologico

| Ambito | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Linguaggio | TypeScript |
| Stile | SCSS (CSS Modules) |
| ORM | Prisma 7 (adapter `pg`) |
| Database | PostgreSQL |
| Form & validazione | React Hook Form + Zod |
| Dati lato client | TanStack Query |
| Interfaccia | Lucide React (icone), Sonner (notifiche), Recharts (grafici) |
| Utility | clsx, date-fns |

Le mutazioni sui dati (creazione/aggiornamento di tavoli, prenotazioni e ordini) sono gestite tramite **Server Actions** di Next.js.

---

## Modello dati

Lo schema Prisma modella il dominio ristorativo, tra cui:

- **Tavolo** — con coordinate sulla pianta e relazioni verso prenotazioni e occupazioni.
- **Prenotazione** e **Occupazione** — entità distinte: una prenotazione è una *previsione*, un'occupazione è il tavolo realmente in servizio (così i walk-in, che non hanno prenotazione, sono gestiti nativamente, e si distinguono i *coperti prenotati* dai *coperti presenti*).
- **Piatto** / **Categoria** — il menu come dati; i prezzi usano `Decimal` per la precisione monetaria.
- **Ordine** / **RigaOrdine** — con fonte (sala/asporto) e stato del flusso di lavorazione.
- **Utente** con ruoli (`OPERATORE`, `ADMIN`, `SUPER_ADMIN`) e **Presenza**.
- **Prodotto** (magazzino), **Cliente** e **Premio** (fidelizzazione).

L'evoluzione dello schema è versionata tramite **migrazioni Prisma**.

---

## Avvio in locale

### Prerequisiti
- **Node.js** (LTS)
- **PostgreSQL** in esecuzione

### Passi

1. Installa le dipendenze:
   ```bash
   npm install
   ```

2. Crea un file `.env` nella radice con la stringa di connessione al database:
   ```bash
   DATABASE_URL="postgresql://UTENTE:PASSWORD@localhost:5432/gestionale_ristorativo?schema=public"
   ```

3. Applica le migrazioni al database:
   ```bash
   npx prisma migrate deploy
   ```

4. (Opzionale) Popola il database con dati di esempio:
   ```bash
   npx tsx prisma/seed.ts
   ```

5. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```

L'app sarà disponibile su **http://localhost:3000**.

### Script disponibili

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | Avvia il server di sviluppo |
| `npm run build` | Genera il client Prisma e compila per la produzione |
| `npm run start` | Avvia la build di produzione |
| `npm run lint` | Esegue ESLint |
| `npm run db:deploy` | Applica le migrazioni al database |

---

## Struttura del progetto

```
src/
├── app/
│   └── operatore/          Area operativa (sala, ordini, cucina, prenotazioni)
│       ├── sala/           tavoli · stato-tavoli · menu · presenze · tessere-punti
│       ├── ordini/         traccia (Kanban) · crea-asporto
│       ├── cucina/         asporti · sala · magazzino
│       └── prenotazioni/   agenda · gestisci
├── generated/prisma/       Client Prisma generato
└── lib/                    Utility condivise (client Prisma, ecc.)

prisma/
├── schema.prisma           Modello dati
├── migrations/             Storico delle migrazioni
└── seed.ts                 Dati di esempio
```

Ogni sezione tiene i propri componenti in una cartella `_components/` e il proprio stile in file `*.module.scss`.

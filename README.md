# 🍽️ Gestionale Ristorativo

Applicazione web per la gestione operativa di un ristorante: sala, prenotazioni, ordini, cucina, magazzino e personale — pensata per essere usata dallo staff durante il servizio, con schermate moderne e leggibili a colpo d'occhio.

> 🚧 **Progetto in fase di sviluppo attivo.** Quanto descritto qui sotto è funzionante e navigabile.

---

## 🔗 Demo online

**👉 [gestionale-ristorativo.vercel.app](https://gestionale-ristorativo.vercel.app)**

Accedi con uno degli account demo. La password è la stessa per tutti: **`gestionale2026`**

| Account | Ruolo | Cosa vede |
| --- | --- | --- |
| `samu@gestionale.local` | Titolare (`SUPER_ADMIN`) | Area **Titolare** (analytics, menu, segnalazioni) e area Operatore |
| `locale@gestionale.local` | Operatore (`OPERATORE`) | Area **Operatore**: il tablet del locale, con sala, ordini, prenotazioni e cucina |
| `alessandro.rossi@gestionale.local` | Responsabile di sala (`ADMIN`) | Area Operatore |

Dopo il login si entra direttamente nell'area del proprio ruolo.

> ℹ️ I dati sono **inventati** e condivisi tra tutti i visitatori: puoi creare ordini, occupare tavoli e modificare il menu liberamente. Il database viene riportato periodicamente allo stato iniziale.

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
- **Consegne** — prodotti che stanno finendo, forniture in arrivo e ricevute di recente.

### Area Titolare
- **Analytics** — venduto, turnover dei tavoli, prenotazioni, ordini e consumo di materie prime, con filtro per periodo.
- **Menu** — disponibilità dei piatti e creazione di nuovi piatti.
- **Segnalazioni** — le note lasciate dal personale, con lo stato letta/non letta.
- **Zone di lavoro** — panoramica dell'occupazione della sala.

### Accesso e ruoli
- **Login** con email e password (Better Auth), sessioni salvate nel database.
- **Tre ruoli**: `OPERATORE` (il tablet del locale), `ADMIN` (responsabile di sala), `SUPER_ADMIN` (titolare).
- Ogni area è protetta nel proprio `layout.tsx`, e **ogni Server Action verifica da sola sessione e ruolo** (`src/lib/sessione.ts`): una Server Action è un endpoint pubblico, quindi proteggere solo la pagina non basta.

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
| Autenticazione | Better Auth (email e password, ruoli) |
| Form & validazione | React Hook Form + Zod |
| Interfaccia | Sonner (notifiche), Recharts (grafici) |
| Utility | clsx, date-fns |
| Test | Vitest |
| Deploy | Vercel (Francoforte) + Neon (PostgreSQL serverless, Francoforte) |

Le mutazioni sui dati (creazione/aggiornamento di tavoli, prenotazioni e ordini) sono gestite tramite **Server Actions** di Next.js.

---

## Test

I test sono scritti con **Vitest**. Login e database sono sostituiti da *mock*, quindi i test non hanno bisogno di un database acceso.

Cosa verificano oggi:
- senza login, `creaOrdine` risponde "Non autorizzato" e **non scrive nulla nel database**;
- un operatore (non titolare) non può creare piatti nel menu.

```bash
npm test
```

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

2. Crea un file `.env` nella radice (vedi `.env.example`):
   ```bash
   DATABASE_URL="postgresql://UTENTE:PASSWORD@localhost:5432/gestionale_ristorativo?schema=public"
   BETTER_AUTH_SECRET="una-stringa-casuale-lunga"
   BETTER_AUTH_URL="http://localhost:3000"
   ```
   Per generare un segreto casuale:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

3. Applica le migrazioni al database:
   ```bash
   npx prisma migrate deploy
   ```

4. Popola il database con i dati di esempio, compresi gli account demo:
   ```bash
   npx prisma db seed
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
| `npm run build` | Genera il client Prisma, applica le migrazioni e compila per la produzione |
| `npm run start` | Avvia la build di produzione |
| `npm run lint` | Esegue ESLint |
| `npm test` | Esegue i test (Vitest) |
| `npm run db:deploy` | Applica le migrazioni al database |

---

## Deploy

L'app è pubblicata su **Vercel**, collegata al ramo `main`: ogni push crea un nuovo deploy.

- **Database**: PostgreSQL su **Neon**, nella stessa regione delle funzioni Vercel (Francoforte, `fra1` in `vercel.json`).
- **Migrazioni**: lo script `build` esegue `prisma migrate deploy`, quindi a ogni deploy il database online riceve le migrazioni nuove.
- **Connessioni**: l'app usa `DATABASE_URL` (connessione *pooled*, adatta alle tante richieste brevi); il comando `prisma` usa `DATABASE_URL_UNPOOLED` (connessione diretta, necessaria per le migrazioni), come configurato in `prisma.config.ts`.
- **Variabili d'ambiente** su Vercel: `DATABASE_URL` e `DATABASE_URL_UNPOOLED` (create dall'integrazione Neon), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.

---

## Struttura del progetto

```
src/
├── app/
│   ├── login/              Pagina di accesso
│   ├── api/auth/           Endpoint di Better Auth
│   ├── operatore/          Area operativa (sala, ordini, cucina, prenotazioni)
│   │   ├── sala/           tavoli · stato-tavoli · menu · presenze · tessere-punti
│   │   ├── ordini/         traccia (Kanban) · crea-asporto
│   │   ├── cucina/         asporti · sala · magazzino · consegne
│   │   └── prenotazioni/   agenda · gestisci
│   └── titolare/           Area del titolare
│       ├── analytics/      venduto · turnover · prenotazioni · ordini · materie-prime
│       ├── menu/           gestione dei piatti
│       ├── segnalazioni/
│       └── zone-di-lavoro/
├── generated/prisma/       Client Prisma generato
└── lib/
    ├── prisma.ts           Client Prisma condiviso
    ├── auth.ts             Configurazione di Better Auth
    └── sessione.ts         Controlli di sessione e ruolo per le Server Actions

prisma/
├── schema.prisma           Modello dati
├── migrations/             Storico delle migrazioni
└── seed.ts                 Dati di esempio
```

Ogni sezione tiene i propri componenti in una cartella `_components/` e il proprio stile in file `*.module.scss`.

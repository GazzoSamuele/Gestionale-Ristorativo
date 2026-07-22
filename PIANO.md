# PIANO — ordine di costruzione

Documento **operativo**: cosa si fa e in che ordine.
Le idee e le decisioni di prodotto stanno in `STRUTTURA.md` — questo è solo la fila.

---

## Regole d'ingaggio

- **Fette verticali**: una funzionalità dal database fino allo schermo, finita e funzionante,
  poi la successiva. Mai "prima tutti i modelli, poi tutte le pagine".
- **Si taglia**: il v1 sono **tre schermate** (Sala · Prenotazioni · Cucina), non le 11 di
  `STRUTTURA.md`. Il resto non è cancellato, è in fila.
- **Le domande difficili si affrontano quando arrivano**, non prima. Eccezione: le decisioni
  che sono porte a senso unico (costano una migrazione su dati veri) — quelle si decidono subito.
- Progetto **da solo, non esperto**: se una cosa non si conclude, va tagliata o rimandata.

---

## ✅ Fase 0 — Far arrivare un dato dal DB allo schermo — **COMPLETATA** (21 lug 2026)

Obiettivo unico: vedere una tabella nascere in Postgres e i suoi dati comparire in una pagina.
Niente sala, niente prenotazioni.

- [x] 1. Creare il database in PostgreSQL (pgAdmin o `createdb`) — nome `gestionale_dev`
- [x] 2. Verificare `DATABASE_URL` in `.env` (utente, password, porta 5432, nome db)
- [x] 3. Scrivere **un solo modello** in `schema.prisma`: `Tavolo` (id, numero, capienza, posX, posY)
      - `numero` è `@unique` → è ciò che rende il seed rilanciabile senza doppioni
- [x] 4. `npx prisma migrate dev --name init` → migrazione `20260721141730_init` applicata
- [x] 5. Client singleton in `src/lib/prisma.ts` con adapter `@prisma/adapter-pg`
      - ⚠️ import da `@/generated/prisma`, **non** da `@prisma/client` (Prisma 7)
      - ⚠️ pattern "singleton globale": in dev Next ricarica a ogni salvataggio → senza, apri
        centinaia di connessioni
- [x] 6. Un seed che inserisce 4 tavoli finti (`prisma/seed.ts`, idempotente con `upsert`)
- [x] 7. Pagina `/test`: Server Component che legge i tavoli e li stampa

**Verificato**: 4 righe reali in PostgreSQL, `tsc --noEmit` pulito.

### Code da chiudere (5 minuti, non bloccanti)
- [x] Seed agganciato: `seed: "tsx prisma/seed.ts"` nel blocco `migrations` di `prisma.config.ts`,
      con `tsx` dichiarato in `devDependencies` (c'era solo di rimbalzo da Prisma).
      Gesto ufficiale: `npx prisma db seed`
- [ ] `connectionString` può essere `undefined`: controllo esplicito all'avvio con un messaggio
      leggibile, o l'errore che arriva è incomprensibile

### Lezione da tenere
**"Non ha dato errore" ≠ "ha funzionato".** Un comando che non fa nulla è silenzioso come uno
che riesce. L'unica verifica che vale è guardare il risultato (tabella o schermo).
Vale doppio con le Server Actions della Fetta 1.

### Note su Prisma 7 (verificate su questo progetto)
- `datasource db` **non** contiene più `url` → sta in `prisma.config.ts`.
  Ogni guida che dice di mettere `env("DATABASE_URL")` nello schema è vecchia.
- `.env` non viene caricato in automatico → lo fa `import "dotenv/config"` in `prisma.config.ts`.
- Generator `prisma-client` (non `-js`), output in `src/generated/prisma`, **non versionato**
  → chi clona il repo deve lanciare `prisma generate` prima di buildare.

---

## Fetta 1 — Sala

Trapianto del **progetto drag & drop già esistente**.

Trapianto dal progetto **App_Gestione_Tavoli_Ristorante**
(`C:\Users\Samuele\Desktop\progetto-luglio\App_Gestione_Tavoli_Ristorante`)
— React 19 + Vite + TS + SCSS davanti, Express + Mongoose + MongoDB dietro.
Inventario fatto il 21 lug 2026: lo stack del frontend **combacia**, è un trasloco fra
appartamenti dello stesso palazzo.

### 1. Schema
- [x] `posX` / `posY` da `Int` a **`Float`** (migrazione `coordinate_percentuali`)
      → il progetto vecchio salva le coordinate **in percentuale**
        (`(e.clientX - start) / rect.width * 100`, reso come `left: {x}%`).
        Con `Int` i decimali si perdono e il tavolo scatta durante il trascinamento.
- [x] Seed con valori **tra 0 e 100**
- [ ] ⏸️ **`sala` rimandato di proposito**: il concetto si tiene, la colonna si aggiunge
      **quando si porta dentro il selettore delle piantine** — con il componente davanti si
      saprà se è una stringa o un modello `Sala` a sé.
      ⚠️ Nel progetto vecchio l'identità della sala è **il percorso dell'SVG**
      (`/piantine-sale/piantina1.svg`): rinomini il file e perdi il legame con ogni tavolo.
      Serve un identificativo stabile. Se si aggiunge, `numero @unique` → `@@unique([numero, sala])`
- [ ] Modelli `Prenotazione` e `Occupazione` (⚠️ entità **distinte** dal Tavolo) ← **prossimo passo**

### 2. 🔴 Il cambiamento strutturale
Nel progetto vecchio lo stato del tavolo **non è un dato**: è dedotto dalla prenotazione
(`stato={prenotazione ? 'occupato' : 'libero'}`, App.tsx:334).
**Qui non regge**: un walk-in non ha prenotazione → non potrebbe mai occupare un tavolo.
- [ ] Il tavolo è occupato perché esiste un'**Occupazione aperta**, con o senza prenotazione
- [ ] Bonus dello stesso cambiamento: l'occupazione ha un istante d'inizio → da lì escono
      gratis il timer "da quanto è seduto" e il turnover per le Analytics

### 3. 🪤 La trappola architetturale
Il vecchio è una **SPA**: un componente carica tutto in `useState` + `fetch`, ogni modifica
aggiorna prima il server e poi lo stato locale. Next App Router fa l'inverso.
- [ ] `useState<Tavolo[]>` e i due `useEffect` con `fetch` **non si portano dentro**:
      il server legge, il client mostra, le modifiche tornano con le **Server Actions**
- [ ] ⚠️ Ma lo `useState({x, y})` **dentro** `TavoloCard` **resta**: non è dato del server,
      è la posizione del dito mentre trascini (60 volte al secondo, nel browser)
- [ ] Confine server/client: la pagina è Server Component, solo la tela trascinabile è
      `'use client'` — il più in basso possibile
- [ ] Salvataggio posizioni **al rilascio**, in modo ottimistico **con ritorno indietro**
      se fallisce (nel vecchio manca: `handleMuovi` non gestisce l'errore)

### 4. Cosa si porta / si butta / si riscrive

| ✅ Si porta | ❌ Si butta | 🔧 Si riscrive |
|---|---|---|
| Logica di drag `handlePointerDown/Move/Up` (~40 righe, zero dipendenze, copre già il touch) | Tutta la cartella `server/` | `App.tsx` 471 righe → componenti separati |
| `TavoloCard` come componente | `fetch(API_URL…)` + i due `useEffect` | `App.scss` 1309 righe → SCSS Modules |
| I 4 SVG in `public/piantine-sale/` | `_id` di Mongo → `id` | `alert()` → **sonner** (già installato) |
| Evidenziazione tavolo al click sulla prenotazione | **FontAwesome** (qui c'è `lucide-react`) | Pannello Totali/Liberi/Occupati (buono, da ricollegare) |
| Pannelli laterali collassabili | **WhatsApp** (è Fase 2) | `ora`/`data` da stringa a `DateTime` |
| | `react-calendar` → si rivaluta nella Fetta 2 | |

### 5. Azioni e rifiniture
- [ ] Azioni: siedi · libera · **walk-in**
- [ ] Allargare la maniglia di trascinamento: nel vecchio è solo l'`<h2>`, bersaglio
      troppo piccolo per un dito su tablet in servizio
- [ ] Bloccare le coordinate tra 0 e 100 (oggi puoi trascinare un tavolo fuori e perderlo)

---

## Fetta 2 — Prenotazioni

- [ ] Agenda (creazione/modifica)
- [ ] Lista arrivi di stasera, ottimizzata per velocità
- [ ] Si aggancia al modello `Prenotazione` già creato nella Fetta 1

---

## Fetta 3 — Menu e Ordini

- [ ] Modelli `Categoria`, `Piatto`
- [ ] Modelli `Ordine`, `RigaOrdine`
- [ ] ⚠️ **Porta a senso unico**: il prezzo va salvato **anche sulla riga d'ordine**, non solo
      sul piatto. Un campo, zero lavoro oggi; senza, lo storico venduto si falsa a ogni
      cambio di prezzo e non è più ricostruibile.
- [ ] ⚠️ Modello `Utente` da creare **qui**, così le relazioni "chi ha creato l'ordine"
      nascono giuste (il login arriva dopo)

---

## Fetta 4 — Cucina (KDS)

- [ ] Coda ticket, filtrata per fonte (sala / asporto)
- [ ] Timer "da quanto aspetta", note e allergie in evidenza
- [ ] Non aggiunge modelli nuovi: riusa Ordine/RigaOrdine

---

## Fetta 5 — Autenticazione e ruoli

**Volutamente ultima.** Fino a qui si lavora con un utente finto fissato nel codice.
Auth.js all'inizio sono giorni di configurazione senza vedere nulla funzionare, e il cancello
sui ruoli è additivo: si mette dopo senza rifare niente.

- [ ] Auth.js v5 + adapter Prisma
- [ ] Cancello sul ruolo nei `layout.tsx` di area
- [ ] Login staff (PIN come piano A — passkey sperimentale)

---

## Dopo

Magazzino · Personale · Area Titolare · Analytics — nell'ordine che servirà.

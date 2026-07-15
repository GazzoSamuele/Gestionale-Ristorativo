# Stack Tecnologico — Gestionale Ristorativo

Guida operativa all'uso di ogni strumento dello stack, contestualizzata al progetto.
Non è una roadmap: è un manuale di "come si usa cosa" e "chi fa cosa".

**Stack:** Next.js · React · TypeScript · SCSS (moduli, al posto di Tailwind) · Auth.js · Prisma ORM · PostgreSQL

---

## Indice
1. [Visione d'insieme: chi fa cosa](#1-visione-dinsieme-chi-fa-cosa)
2. [Next.js — il framework applicativo](#2-nextjs--il-framework-applicativo)
3. [React — la UI a componenti](#3-react--la-ui-a-componenti)
4. [TypeScript — il contratto sui dati](#4-typescript--il-contratto-sui-dati)
5. [SCSS — i fogli di stile](#5-scss--i-fogli-di-stile)
6. [Prisma ORM — l'accesso ai dati](#6-prisma-orm--laccesso-ai-dati)
7. [PostgreSQL — il database](#7-postgresql--il-database)
8. [Auth.js — autenticazione e ruoli](#8-authjs--autenticazione-e-ruoli)
9. [Come i pezzi si parlano tra loro](#9-come-i-pezzi-si-parlano-tra-loro)
10. [Struttura delle cartelle consigliata](#10-struttura-delle-cartelle-consigliata)
11. [Variabili d'ambiente](#11-variabili-dambiente)
12. [Dipendenze consigliate](#12-dipendenze-consigliate)

---

## 1. Visione d'insieme: chi fa cosa

In un gestionale ristorativo hai tipicamente: **menu/prodotti**, **tavoli e sale**, **ordini/comande**, **cucina (KDS)**, **cassa/conto**, **magazzino**, **utenti con ruoli** (admin, cameriere, cuoco, cassiere).

| Livello | Strumento | Responsabilità |
|---|---|---|
| Framework | **Next.js (App Router)** | Routing, rendering server/client, API, orchestrazione |
| UI | **React** | Componenti riutilizzabili (tabelle, card ordine, form) |
| Tipi | **TypeScript** | Contratto tra DB, server e UI; niente `any` |
| Stile | **SCSS** | Design system, temi, layout responsive (touch-friendly) |
| Dati (codice) | **Prisma** | Query type-safe, migrazioni, schema come fonte di verità |
| Dati (storage) | **PostgreSQL** | Persistenza transazionale, integrità referenziale |
| Sicurezza | **Auth.js** | Login, sessioni, ruoli, protezione route |

Regola mentale: **il dato nasce nello schema Prisma → PostgreSQL lo conserva → il Server Component lo legge → React lo mostra → SCSS lo veste → Auth.js decide chi può vederlo.**

---

## 2. Next.js — il framework applicativo

Usa **App Router** (`src/app/`). È il cuore: decide cosa gira sul server e cosa sul client.

### Server Components (default)
Ogni componente è un **Server Component** finché non scrivi `"use client"`. Sfruttalo per leggere i dati direttamente da Prisma senza passare da un'API:

```tsx
// src/app/(dashboard)/ordini/page.tsx
import { prisma } from "@/lib/prisma";

export default async function OrdiniPage() {
  const ordini = await prisma.ordine.findMany({
    where: { stato: "APERTO" },
    include: { tavolo: true, righe: { include: { prodotto: true } } },
  });
  return <ListaOrdini ordini={ordini} />;
}
```

**Quando serve un Server Component:** pagine che leggono dati (lista menu, storico ordini, report incassi). Non spedisce JS inutile al browser e tiene le credenziali DB sul server.

### Client Components (`"use client"`)
Servono quando c'è **interattività**: stato locale, `onClick`, form controllati, `useEffect`. Nel gestionale: la comanda che aggiorni tavolo per tavolo, il carrello del cameriere, la modale "aggiungi prodotto".

```tsx
"use client";
import { useState } from "react";
// gestione stato della comanda in corso...
```

Regola: **tieni i Client Components il più in basso possibile** nell'albero. La pagina è server, solo il widget interattivo è client.

### Server Actions
Per **scrivere** dati (creare ordine, chiudere conto, aggiornare stato in cucina) usa le Server Actions invece di scrivere API a mano:

```tsx
// src/app/(dashboard)/ordini/actions.ts
"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function aggiornaStatoOrdine(id: string, stato: StatoOrdine) {
  const session = await auth();
  if (!session) throw new Error("Non autorizzato");
  await prisma.ordine.update({ where: { id }, data: { stato } });
  revalidatePath("/cucina");
}
```

**Usale per:** ogni mutazione lanciata da un form o da un bottone. `revalidatePath`/`revalidateTag` aggiornano la UII senza ricaricare.

### Route Handlers (`route.ts`)
Usa le API REST vere (`src/app/api/.../route.ts`) solo quando serve un **endpoint HTTP esterno**: webhook del sistema di pagamento, un display cucina su un altro dispositivo che fa polling, integrazioni con stampanti fiscali/comande.

### Route Groups e layout
- `(auth)/` → login, senza sidebar.
- `(dashboard)/` → area protetta con layout condiviso (sidebar, header).
- `layout.tsx` per la shell comune; `loading.tsx` per gli stati di caricamento (utile su liste ordini che caricano dal DB).

### Caching / dati "live"
La cucina e la sala hanno dati che cambiano in continuazione. Per dati sempre freschi usa `export const dynamic = "force-dynamic"` sulla pagina, oppure `revalidateTag` dopo ogni mutazione. Non cachare gli ordini aperti.

---

## 3. React — la UI a componenti

React qui è lo strumento per **non ripeterti**. Modella la UI del ristorante come componenti riutilizzabili:

- `TavoloCard`, `TavoliMappa` (pianta della sala)
- `RigaComanda`, `Comanda`, `TicketCucina`
- `MenuItem`, `CategoriaMenu`
- `Conto`, `RipartizioneConto`
- Componenti generici: `Button`, `Modal`, `Table`, `Badge` (stato ordine), `QuantitaStepper`

Linee guida:
- **Props tipizzate** con TypeScript (vedi sotto). Ogni componente riceve dati già pronti.
- **Composizione**, non props booleane infinite: `<Badge variant="in-preparazione" />` invece di dieci flag.
- **Stato locale** (`useState`) per interazioni effimere (modale aperta, campo input). Per stato condiviso complesso (la comanda in costruzione tra più componenti) usa `useContext` + `useReducer`, o una libreria di stato solo se davvero necessario.
- **Custom hooks** per logica riusabile: `useComanda()`, `usePolling(intervallo)` per il display cucina.

---

## 4. TypeScript — il contratto sui dati

TypeScript è ciò che tiene insieme lo stack: lo **stesso tipo** viaggia dal DB alla UI.

- **I tipi vengono da Prisma.** Non ridefinire a mano `Ordine`, `Prodotto`, `Tavolo`: importali generati da Prisma Client.
  ```ts
  import type { Ordine, Prodotto, RigaOrdine } from "@prisma/client";
  ```
- **Enum condivisi** per gli stati: definiscili nello schema Prisma (`StatoOrdine`, `RuoloUtente`) e usali ovunque. Un solo posto per "APERTO | IN_PREPARAZIONE | SERVITO | PAGATO".
- **Tipi compositi** per le query con `include`:
  ```ts
  import type { Prisma } from "@prisma/client";
  type OrdineCompleto = Prisma.OrdineGetPayload<{
    include: { righe: { include: { prodotto: true } }; tavolo: true };
  }>;
  ```
- `tsconfig.json`: tieni `"strict": true`. Configura il path alias `"@/*": ["./src/*"]` per import puliti.
- Evita `any`. Per dati esterni (webhook pagamenti) valida con uno schema (es. Zod) e ricava il tipo da lì.

---

## 5. SCSS — i fogli di stile

Al posto di Tailwind usi SCSS. Organizzalo come un **design system**, non come CSS sparso. Usa i **CSS Modules SCSS** (`*.module.scss`) di Next.js per lo scoping automatico, più una cartella globale per token e utility.

### Struttura
```
src/styles/
  abstracts/
    _variables.scss    // colori, spaziature, breakpoint
    _mixins.scss       // media query, flex helper, focus-ring
    _functions.scss
  base/
    _reset.scss
    _typography.scss
  themes/
    _light.scss
    _dark.scss
  main.scss            // importa base globali
```

### Token con `@use` (moderno, non `@import`)
```scss
// abstracts/_variables.scss
$colore-primario: #c0392b;      // rosso "brand" ristorante
$stato-aperto:    #e67e22;
$stato-servito:   #27ae60;
$spazio-1: 0.5rem;
$spazio-2: 1rem;
$radius: 0.5rem;
$bp-tablet: 768px;   // i camerieri usano tablet: pensa touch-first
```

```scss
// abstracts/_mixins.scss
@mixin tablet-up { @media (min-width: 768px) { @content; } }
@mixin card { border-radius: $radius; box-shadow: 0 1px 3px rgba(0,0,0,.12); }
```

### Uso nei componenti (CSS Module)
```scss
// TavoloCard.module.scss
@use "@/styles/abstracts/variables" as v;
@use "@/styles/abstracts/mixins" as m;

.card {
  @include m.card;
  padding: v.$spazio-2;
  min-height: 96px;               // area toccabile ampia
  &--occupato { border-left: 4px solid v.$stato-aperto; }
  &--libero   { border-left: 4px solid v.$stato-servito; }
}
```

```tsx
import styles from "./TavoloCard.module.scss";
<div className={`${styles.card} ${styles["card--occupato"]}`} />
```

### Temi e variabili CSS
Per il tema chiaro/scuro (sala luminosa vs cucina) esponi i token come **CSS custom properties** e cambia solo `data-theme` sull'`<html>`. SCSS genera i valori, le variabili CSS permettono lo switch a runtime senza ricompilare.

Regole:
- **Mobile/tablet first**: i camerieri lavorano su schermi piccoli e col dito. Bottoni grandi, `min-height` generosi.
- Convenzione **BEM** (`block__element--modifier`) per leggibilità.
- Configura in Next.js: SCSS funziona out-of-the-box, basta `npm i -D sass`. Per i token globali senza import ripetuti puoi usare `sassOptions.additionalData` in `next.config.js`.

---

## 6. Prisma ORM — l'accesso ai dati

Prisma è **l'unico modo** in cui il codice tocca il database. Lo schema è la fonte di verità.

### Schema (`prisma/schema.prisma`)
Modella il dominio ristorativo. Esempio scheletrico:
```prisma
model Utente {
  id       String  @id @default(cuid())
  email    String  @unique
  nome     String
  ruolo    Ruolo   @default(CAMERIERE)
  ordini   Ordine[]
}

enum Ruolo { ADMIN CAMERIERE CUOCO CASSIERE }

model Tavolo {
  id      String   @id @default(cuid())
  numero  Int      @unique
  sala    String
  ordini  Ordine[]
}

model Prodotto {
  id         String       @id @default(cuid())
  nome       String
  prezzo     Decimal      @db.Decimal(10, 2)   // MAI Float per il denaro
  categoria  Categoria    @relation(fields: [categoriaId], references: [id])
  categoriaId String
  righe      RigaOrdine[]
  disponibile Boolean     @default(true)
}

model Ordine {
  id         String       @id @default(cuid())
  stato      StatoOrdine  @default(APERTO)
  tavolo     Tavolo       @relation(fields: [tavoloId], references: [id])
  tavoloId   String
  cameriere  Utente       @relation(fields: [camiereId], references: [id])
  camiereId  String
  righe      RigaOrdine[]
  creatoIl   DateTime     @default(now())
}

enum StatoOrdine { APERTO IN_PREPARAZIONE SERVITO PAGATO ANNULLATO }

model RigaOrdine {
  id         String   @id @default(cuid())
  ordine     Ordine   @relation(fields: [ordineId], references: [id])
  ordineId   String
  prodotto   Prodotto @relation(fields: [prodottoId], references: [id])
  prodottoId String
  quantita   Int      @default(1)
  note       String?  // "senza cipolla"
}
```

Punti chiave per un gestionale:
- **`Decimal` per i prezzi e i conti**, mai `Float` (errori di arrotondamento sui soldi).
- **Relazioni esplicite** per garantire integrità (una riga ordine deve appartenere a un ordine reale).
- **Enum** per gli stati, condivisi con TypeScript.

### Client singleton
Evita di aprire mille connessioni in dev (hot reload):
```ts
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Query e transazioni
- Leggi con `findMany` / `findUnique`, usa `include` e `select` per prendere solo ciò che serve.
- **Operazioni multiple atomiche** con `prisma.$transaction`: chiudere un conto = creare il pagamento + aggiornare lo stato ordine + scalare il magazzino, tutto o niente.
  ```ts
  await prisma.$transaction([
    prisma.ordine.update({ where: { id }, data: { stato: "PAGATO" } }),
    prisma.pagamento.create({ data: { ordineId: id, importo } }),
  ]);
  ```

### Comandi che userai
- `npx prisma migrate dev --name <nome>` → crea/applica migrazione in sviluppo.
- `npx prisma generate` → rigenera il client tipizzato (dopo ogni modifica allo schema).
- `npx prisma studio` → GUI per ispezionare i dati (comodissimo in dev).
- `npx prisma migrate deploy` → applica migrazioni in produzione.
- `prisma/seed.ts` → popola dati iniziali (menu di esempio, tavoli, utente admin).

---

## 7. PostgreSQL — il database

È lo **storage transazionale**. Prisma ci parla per te, ma devi sapere perché è la scelta giusta qui:
- **Transazioni ACID**: fondamentali per conti e pagamenti (niente ordini "a metà").
- **Integrità referenziale**: le foreign key impediscono ordini orfani.
- **Tipi solidi**: `numeric/DECIMAL` per il denaro, `timestamptz` per orari di servizio.

In pratica:
- In **sviluppo** fai girare Postgres in locale (o via Docker: `postgres:16`).
- La connessione passa **solo** da `DATABASE_URL` (vedi env). Nessuna query SQL scritta a mano nel codice applicativo: passa da Prisma.
- Per report pesanti (incassi per turno, prodotti più venduti) puoi usare `prisma.$queryRaw` con SQL, ma tipizzalo.
- In **produzione** usa un Postgres gestito (es. servizio cloud) e attiva il **connection pooling** (importante con serverless/Next.js): usa l'URL con pooler per l'app e un URL diretto per le migrazioni.

---

## 8. Auth.js — autenticazione e ruoli

Auth.js (NextAuth v5) gestisce **chi entra e cosa può fare**. In un ristorante i ruoli sono centrali.

### Setup base
```ts
// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      // login con email+password o PIN del cameriere
      authorize: async (creds) => { /* verifica hash password */ },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.ruolo = (user as any).ruolo;
      return token;
    },
    session({ session, token }) {
      session.user.ruolo = token.ruolo;   // il ruolo arriva alla UI
      return session;
    },
  },
});
```
- Il **PrismaAdapter** salva utenti/sessioni nel tuo Postgres (aggiungi i model Auth.js allo schema Prisma: `Account`, `Session`, `VerificationToken`, oppure usa strategy `jwt` per i camerieri con login rapido a PIN).
- **Provider**: `Credentials` per staff interno (email+password o PIN). Se vuoi login social per l'admin, aggiungi Google/GitHub.
- Hasha sempre le password (es. `bcrypt`/`argon2`); Auth.js non lo fa per te con Credentials.

### Proteggere le route
```ts
// src/app/(dashboard)/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const session = await auth();
  if (!session) redirect("/login");
  return <Shell>{children}</Shell>;
}
```

### Autorizzazione per ruolo
Il **login** dice chi sei; l'**autorizzazione** è compito tuo. Controlla `session.user.ruolo` sia nel Server Component (per nascondere UI) sia nelle Server Actions (per bloccare l'azione davvero):
```ts
"use server";
export async function annullaOrdine(id: string) {
  const session = await auth();
  if (session?.user.ruolo !== "ADMIN" && session?.user.ruolo !== "CASSIERE")
    throw new Error("Permesso negato");
  // ...
}
```
Regola d'oro: **non fidarti mai del solo controllo lato UI**. Il vero cancello sono Server Actions e Route Handlers.

### Middleware
Usa `middleware.ts` per redirigere al login le rotte protette prima ancora del rendering (protezione di primo livello). L'autorizzazione fine per ruolo resta nel server.

---

## 9. Come i pezzi si parlano tra loro

Flusso completo di **"il cameriere aggiunge un piatto a un tavolo"**:

1. **Auth.js** ha già stabilito che l'utente è un `CAMERIERE` loggato (sessione).
2. Il cameriere apre `/tavoli/12` → **Next.js Server Component** legge il tavolo e l'ordine aperto con **Prisma** da **PostgreSQL**.
3. La pagina passa i dati (tipati da **TypeScript**) a un **Client Component** `<Comanda>`.
4. Il cameriere tocca "Aggiungi Carbonara" → `<Comanda>` (React, stato locale) aggiorna la UI, vestita da **SCSS**.
5. Al "Conferma" parte una **Server Action** che verifica il ruolo (**Auth.js**) e scrive la `RigaOrdine` via **Prisma** in **PostgreSQL**, dentro una transazione.
6. `revalidatePath("/cucina")` → il display cucina vede la nuova comanda.

Ogni strumento ha un solo lavoro; TypeScript garantisce che il dato sia lo stesso in tutti i passaggi.

---

## 10. Struttura delle cartelle consigliata

```
Gestionale-Ristorativo/
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts
├─ src/
│  ├─ app/
│  │  ├─ (auth)/login/page.tsx
│  │  ├─ (dashboard)/
│  │  │  ├─ layout.tsx           // protezione + shell
│  │  │  ├─ tavoli/
│  │  │  ├─ ordini/
│  │  │  ├─ cucina/              // KDS, dati live
│  │  │  ├─ menu/
│  │  │  └─ report/
│  │  ├─ api/
│  │  │  └─ auth/[...nextauth]/route.ts
│  │  └─ layout.tsx
│  ├─ components/                // React riutilizzabili + .module.scss accanto
│  ├─ lib/
│  │  ├─ prisma.ts
│  │  └─ auth.ts
│  ├─ styles/                    // token, mixin, temi SCSS
│  └─ types/                     // tipi condivisi non generati da Prisma
├─ middleware.ts
├─ next.config.js
├─ tsconfig.json
└─ .env
```

---

## 11. Variabili d'ambiente

```bash
# .env  (NON committare)
DATABASE_URL="postgresql://user:pass@localhost:5432/gestionale?schema=public"
# In produzione serverless: URL con pooler per l'app + DIRECT_URL per le migrazioni
DIRECT_URL="postgresql://user:pass@localhost:5432/gestionale"

AUTH_SECRET="genera-con: npx auth secret"
AUTH_URL="http://localhost:3000"
```
- `.env` in `.gitignore`. Committa solo `.env.example` con le chiavi vuote.
- `AUTH_SECRET` è obbligatorio per firmare i JWT delle sessioni.

---

## 12. Dipendenze consigliate

Elenco delle librerie da installare, **a cosa servono nel gestionale** e come si incastrano con lo stack base.

### Dipendenze principali

| Pacchetto | npm | A cosa serve nel progetto |
|---|---|---|
| Prisma Client | `@prisma/client` | Il client tipizzato con cui leggi/scrivi il DB (già visto nella sez. 6). |
| Prisma PostgreSQL Adapter | `@prisma/adapter-pg` | Driver adapter di Prisma: fa girare le query sul driver `pg` nativo. Utile per pooling ed edge/serverless. |
| PostgreSQL Driver | `pg` | Il driver Postgres vero e proprio, usato dall'adapter sopra. |
| dotenv | `dotenv` | Carica le variabili da `.env` (DATABASE_URL, AUTH_SECRET) in contesti non-Next (es. `seed.ts`, script CLI). |
| Zod | `zod` | Validazione e tipizzazione dei dati in ingresso: form comande, payload webhook pagamenti. Fonte di verità per i tipi runtime. |
| React Hook Form | `react-hook-form` | Gestione performante dei form: nuovo prodotto, modifica menu, login, dati tavolo. Pochi re-render. |
| Hook Form Resolvers | `@hookform/resolvers` | Ponte tra React Hook Form e Zod: validi il form con lo **stesso** schema Zod usato lato server. |
| Auth.js | `next-auth` | Autenticazione e sessioni (sez. 8). |
| bcrypt | `bcrypt` | Hashing delle password/PIN dello staff. Auth.js con Credentials non lo fa da solo. |
| TanStack Query | `@tanstack/react-query` | Cache/refetch lato client per dati **live**: display cucina (KDS), stato tavoli in tempo reale, polling. |
| clsx | `clsx` | Compone condizionalmente i `className` SCSS (`clsx(styles.card, occupato && styles['card--occupato'])`). |
| date-fns | `date-fns` | Date e orari: turni, orari comanda, report per fascia oraria. Leggera e tree-shakeable. |
| Lucide React | `lucide-react` | Set di icone (tavolo, piatto, stampa, carrello, stati ordine). |
| Sonner | `sonner` | Toast/notifiche: "Ordine inviato in cucina", "Conto chiuso", errori. |
| Recharts | `recharts` | Grafici per i report: incassi per turno, prodotti più venduti, andamento giornaliero. |

### Dipendenze di sviluppo

| Pacchetto | npm | A cosa serve |
|---|---|---|
| Prisma CLI | `prisma` | Comandi `migrate`, `generate`, `studio`, `seed` (sez. 6). |
| PostgreSQL Types | `@types/pg` | Tipi TypeScript per il driver `pg`. |
| bcrypt Types | `@types/bcrypt` | Tipi TypeScript per `bcrypt`. |

### Installazione

```bash
# principali
npm i @prisma/client @prisma/adapter-pg pg dotenv zod \
      react-hook-form @hookform/resolvers next-auth bcrypt \
      @tanstack/react-query clsx date-fns lucide-react sonner recharts

# sviluppo
npm i -D prisma @types/pg @types/bcrypt sass
```

### Come si combinano — esempi rapidi

**Zod + React Hook Form + Server Action (un solo schema per client e server):**
```ts
// schema condiviso
import { z } from "zod";
export const prodottoSchema = z.object({
  nome: z.string().min(1),
  prezzo: z.coerce.number().positive(),
  categoriaId: z.string().cuid(),
});
export type ProdottoInput = z.infer<typeof prodottoSchema>;
```
```tsx
// form lato client
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm<ProdottoInput>({ resolver: zodResolver(prodottoSchema) });
```
```ts
// stessa validazione dentro la Server Action, prima di scrivere con Prisma
"use server";
export async function creaProdotto(input: unknown) {
  const dati = prodottoSchema.parse(input); // blocca dati non validi
  await prisma.prodotto.create({ data: dati });
}
```

**bcrypt in Auth.js (Credentials):**
```ts
import bcrypt from "bcrypt";
// creazione utente: const hash = await bcrypt.hash(password, 12);
// login (authorize): const ok = await bcrypt.compare(password, utente.passwordHash);
```

**Prisma con adapter `pg`:**
```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
```

**TanStack Query per il display cucina (dati live):**
```tsx
"use client";
import { useQuery } from "@tanstack/react-query";
const { data: comande } = useQuery({
  queryKey: ["comande", "cucina"],
  queryFn: () => fetch("/api/cucina").then(r => r.json()),
  refetchInterval: 5000, // aggiorna ogni 5s
});
```
> Nota: TanStack Query richiede un `QueryClientProvider` in un Client Component alla radice della dashboard. Convive con i Server Components: usa i Server Components per il primo caricamento e TanStack Query per gli aggiornamenti live lato client.

**clsx + Sonner + Lucide insieme:**
```tsx
"use client";
import clsx from "clsx";
import { toast } from "sonner";
import { Check } from "lucide-react";
import styles from "./TicketCucina.module.scss";

<button
  className={clsx(styles.ticket, pronto && styles["ticket--pronto"])}
  onClick={() => toast.success("Piatto pronto", { icon: <Check /> })}
/>
```
> Ricorda: `<Toaster />` di Sonner va montato una volta nel layout della dashboard.

---

### Promemoria finale
- **Denaro** → `Decimal`, sempre. Mai float.
- **Scritture** → Server Actions + transazioni Prisma, con controllo ruolo.
- **Dati live** (cucina/sala) → niente cache, `revalidate` dopo ogni mutazione.
- **UI touch** → SCSS mobile-first, aree toccabili ampie.
- **Sicurezza** → il vero controllo è sul server, mai solo lato client.

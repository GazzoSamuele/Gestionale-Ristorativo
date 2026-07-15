# Guida Didattica alle Librerie — Come Funzionano

Questo file spiega **da zero** ogni strumento dello stack: a cosa serve, il modello mentale per capirlo, e come funziona con un esempio preso dal gestionale ristorativo. È pensato per chi non ha mai usato questi strumenti.

> Differenza con `STACK.md`: quel file dice *cosa usare e dove* nel progetto. Questo file spiega *come funziona ciascuna cosa*, come se te la insegnassero per la prima volta.

Un gestionale di ristorante ha sempre le stesse sezioni (menu, tavoli, ordini, cucina, conto, report, utenti): per questo gli esempi qui sotto tornano utili così come sono.

---

## Indice

**Le fondamenta**
1. [TypeScript](#1-typescript--javascript-che-ti-avvisa-degli-errori)
2. [React](#2-react--linterfaccia-fatta-di-mattoncini)
3. [Next.js](#3-nextjs--la-casa-che-tiene-insieme-tutto)
4. [SCSS](#4-scss--css-con-i-superpoteri)

**I dati**
5. [PostgreSQL](#5-postgresql--il-magazzino-dei-dati)
6. [Prisma](#6-prisma--il-traduttore-tra-codice-e-database)
7. [Zod](#7-zod--il-controllore-allingresso)

**Autenticazione**
8. [Auth.js](#8-authjs--il-buttafuori)
9. [bcrypt](#9-bcrypt--la-cassaforte-delle-password)

**I form**
10. [React Hook Form](#10-react-hook-form--i-moduli-senza-fatica)
11. [Hook Form Resolvers](#11-hook-form-resolvers--il-ponte-verso-zod)

**Dati lato client e utilità**
12. [TanStack Query](#12-tanstack-query--i-dati-sempre-aggiornati)
13. [date-fns](#13-date-fns--le-date-senza-mal-di-testa)
14. [clsx](#14-clsx--accendere-e-spegnere-le-classi-css)

**Interfaccia**
15. [Lucide React](#15-lucide-react--le-icone)
16. [Sonner](#16-sonner--le-notifiche-toast)
17. [Recharts](#17-recharts--i-grafici-dei-report)

**Il contorno**
18. [dotenv](#18-dotenv--i-segreti-fuori-dal-codice)
19. [pg e Prisma Adapter](#19-pg-e-prisma-adapter--il-tubo-verso-postgres)

---

# Le fondamenta

## 1. TypeScript — JavaScript che ti avvisa degli errori

**Il problema che risolve.** JavaScript non controlla i tipi: puoi scrivere `prezzo * "ciao"` e te ne accorgi solo quando il programma è già rotto davanti al cliente. TypeScript aggiunge un controllo *mentre scrivi*.

**Modello mentale.** È JavaScript + le etichette che dicono *che tipo di dato* è ogni cosa. Un piatto ha un `nome` (testo), un `prezzo` (numero), `disponibile` (vero/falso). Se sbagli, l'editor te lo segnala in rosso prima ancora di far partire l'app.

**Come funziona.**
```ts
// Definisci la "forma" di un dato con un type
type Prodotto = {
  nome: string;       // testo
  prezzo: number;     // numero
  disponibile: boolean;
};

function applicaSconto(p: Prodotto, percentuale: number): number {
  return p.prezzo - (p.prezzo * percentuale / 100);
}

applicaSconto(carbonara, 10);   // ok
applicaSconto(carbonara, "10"); // ERRORE segnalato subito: "10" è testo, non numero
```
- `: string`, `: number` sono le **annotazioni di tipo**.
- `?` rende un campo opzionale: `note?: string` significa "le note possono mancare".
- `type` e `interface` servono a dare un nome a queste forme.

**Nel gestionale:** ogni entità (Tavolo, Ordine, Prodotto) ha un tipo. Così quando un componente riceve un ordine, l'editor sa già che ha `righe`, `tavolo`, `stato` e ti autocompleta tutto. È la rete di sicurezza che tiene insieme tutto il resto.

---

## 2. React — l'interfaccia fatta di mattoncini

**Il problema che risolve.** Costruire interfacce a mano (creare/aggiornare elementi HTML uno per uno) diventa ingestibile. React ti fa **descrivere come deve apparire** la UI e pensa lui ad aggiornare lo schermo.

**Modello mentale.** Costruisci l'interfaccia con **componenti**: mattoncini riutilizzabili. Un `TavoloCard` è un mattoncino; la sala è tanti `TavoloCard` messi insieme. Quando i dati cambiano (il tavolo si occupa), React ridisegna **solo** quel mattoncino.

**Come funziona.** Un componente è una funzione che restituisce qualcosa che sembra HTML (si chiama JSX):
```tsx
function TavoloCard({ numero, occupato }: { numero: number; occupato: boolean }) {
  return (
    <div className="card">
      Tavolo {numero} — {occupato ? "Occupato" : "Libero"}
    </div>
  );
}

// Uso: passi i dati come "props" (proprietà)
<TavoloCard numero={12} occupato={true} />
```

**I due concetti chiave:**
- **Props** = i dati che *entrano* in un componente dall'esterno (come i parametri di una funzione). Sono in sola lettura.
- **State (stato)** = i dati che il componente *ricorda e può cambiare* nel tempo. Si crea con `useState`:
  ```tsx
  const [quantita, setQuantita] = useState(1); // parte da 1
  // ...
  <button onClick={() => setQuantita(quantita + 1)}>+</button>
  ```
  Quando chiami `setQuantita`, React ridisegna il componente col nuovo valore. Questo è il cuore di React: **cambi lo stato → lo schermo si aggiorna da solo**.

**Nel gestionale:** la comanda che il cameriere compila è uno "stato" che cresce a ogni piatto aggiunto; ogni riga è un componente; la pianta della sala è una griglia di `TavoloCard`.

---

## 3. Next.js — la casa che tiene insieme tutto

**Il problema che risolve.** React da solo disegna solo l'interfaccia nel browser. Ma un gestionale ha bisogno anche di: pagine con indirizzi (`/tavoli`, `/cucina`), codice che gira sul **server** (per parlare col database in sicurezza), e organizzazione. Next.js è il framework che avvolge React e fornisce tutto questo.

**Modello mentale.** Se React è "come fare i mobili", Next.js è "la casa già costruita" dove i mobili vanno al loro posto. La regola più importante di Next.js moderno (App Router): **una cartella = un indirizzo web**.

**Come funziona — il routing per cartelle.**
```
src/app/
  tavoli/page.tsx      →  il sito /tavoli
  cucina/page.tsx      →  il sito /cucina
  ordini/[id]/page.tsx →  /ordini/123  (l'id è variabile)
```
Crei una cartella con dentro un `page.tsx`, e quella pagina esiste a quell'indirizzo. Non devi configurare nulla.

**Il concetto più importante da capire: Server vs Client.**

Next.js esegue il codice in due posti diversi:

| | Server Component (default) | Client Component (`"use client"`) |
|---|---|---|
| Dove gira | Sul server, prima di arrivare al browser | Nel browser dell'utente |
| Può | Leggere il database direttamente, tenere i segreti | Reagire ai click, usare `useState`, animazioni |
| Non può | Usare `onClick`, `useState` | Toccare il database direttamente |

```tsx
// Server Component: legge i dati (nessun "use client" in cima)
export default async function TavoliPage() {
  const tavoli = await prisma.tavolo.findMany(); // parla col DB, in sicurezza
  return <MappaSala tavoli={tavoli} />;
}
```
```tsx
// Client Component: gestisce l'interazione
"use client";
export function MappaSala({ tavoli }) {
  const [selezionato, setSelezionato] = useState(null);
  // ...click, stato, ecc.
}
```

**Le Server Actions** — il modo di *salvare* dati senza scrivere un'API: una funzione con `"use server"` gira sul server ma la puoi chiamare da un bottone.
```ts
"use server";
export async function chiudiConto(ordineId: string) {
  await prisma.ordine.update({ where: { id: ordineId }, data: { stato: "PAGATO" } });
}
```

**Nel gestionale:** ogni schermata (menu, tavoli, cucina, report) è una cartella. Le pagine che *mostrano* dati sono Server Components; i widget interattivi (comanda, carrello) sono Client Components; ogni salvataggio è una Server Action.

---

## 4. SCSS — CSS con i superpoteri

**Il problema che risolve.** Il CSS normale funziona ma è ripetitivo: riscrivi lo stesso colore rosso 40 volte, e se lo devi cambiare le tocchi tutte. SCSS aggiunge variabili, funzioni e organizzazione. Alla fine SCSS viene **convertito in CSS normale** automaticamente.

**Modello mentale.** È il CSS che già conosci, più gli strumenti di un vero linguaggio: variabili, riuso, annidamento.

**Come funziona — le cose che il CSS normale non ha:**

**Variabili** (definisci una volta, usi ovunque):
```scss
$colore-brand: #c0392b;
$spazio: 1rem;

.bottone { background: $colore-brand; padding: $spazio; }
```

**Annidamento** (riflette la struttura HTML):
```scss
.card {
  padding: 1rem;
  .titolo { font-weight: bold; }   // = .card .titolo
  &--occupato { border-left: 4px solid orange; } // = .card--occupato
}
```

**Mixin** (blocchi di stile riutilizzabili, come funzioni):
```scss
@mixin tablet { @media (min-width: 768px) { @content; } }

.sidebar {
  display: none;
  @include tablet { display: block; } // appare solo su schermi larghi
}
```

**CSS Modules** (Next.js) — file `.module.scss`: le classi diventano **locali** al componente, così due componenti possono avere entrambi `.card` senza scontrarsi.
```scss
/* TavoloCard.module.scss */
.card { padding: 1rem; }
```
```tsx
import styles from "./TavoloCard.module.scss";
<div className={styles.card} />  // React inserisce il nome giusto
```

**Nel gestionale:** definisci una volta i colori degli stati (aperto/servito/pagato) e le spaziature, poi li riusi ovunque. Pensa **touch-first**: i camerieri usano tablet, quindi bottoni grandi.

---

# I dati

## 5. PostgreSQL — il magazzino dei dati

**Il problema che risolve.** I dati devono sopravvivere allo spegnimento del computer e restare coerenti. PostgreSQL è un **database relazionale**: conserva i dati in tabelle collegate tra loro.

**Modello mentale.** Immagina fogli Excel (tabelle) che si parlano tra loro. Una tabella `Ordini`, una `Tavoli`: ogni ordine "punta" a un tavolo. Il database garantisce che non esistano ordini che puntano a un tavolo inesistente.

**Come funziona (concetti, non sintassi — la sintassi la gestisce Prisma per te):**
- **Tabella** = un tipo di cosa (Prodotti, Tavoli, Ordini).
- **Riga** = un elemento (la Carbonara, il Tavolo 12).
- **Colonna** = un attributo (nome, prezzo).
- **Chiave primaria** = l'identità unica di ogni riga (`id`).
- **Chiave esterna (foreign key)** = il collegamento tra tabelle ("questo ordine appartiene al tavolo 12").
- **Transazione** = un gruppo di operazioni "tutto o niente": chiudere un conto = registrare il pagamento **e** aggiornare lo stato. Se una fallisce, si annulla tutto. Fondamentale per i soldi.

**Perché Postgres per un ristorante:** i conti e i pagamenti devono essere esatti e affidabili (proprietà **ACID**), e i tipi numerici per il denaro sono precisi (nessun errore di arrotondamento).

**Nota importante:** in questo progetto **non scrivi SQL a mano**. Parli con Postgres tramite Prisma (prossima sezione).

---

## 6. Prisma — il traduttore tra codice e database

**Il problema che risolve.** Parlare col database richiede SQL, un linguaggio a parte, facile da sbagliare e senza controllo dei tipi. Prisma ti fa scrivere query in TypeScript normale, con autocompletamento e sicurezza sui tipi.

**Modello mentale.** Prisma è un traduttore: tu scrivi codice TypeScript (`trova tutti gli ordini aperti`), lui lo traduce in SQL, lo manda a Postgres e ti riporta i risultati **già tipizzati**.

**Come funziona — tre passi:**

**Passo 1 — descrivi i dati in un file `schema.prisma`** (la fonte di verità):
```prisma
model Prodotto {
  id        String  @id @default(cuid())
  nome      String
  prezzo    Decimal @db.Decimal(10, 2)   // Decimal per il denaro, mai Float
  righe     RigaOrdine[]
}

model Ordine {
  id       String       @id @default(cuid())
  stato    StatoOrdine  @default(APERTO)
  tavolo   Tavolo       @relation(fields: [tavoloId], references: [id])
  tavoloId String
  righe    RigaOrdine[]
}

enum StatoOrdine { APERTO IN_PREPARAZIONE SERVITO PAGATO }
```

**Passo 2 — Prisma crea la tabella e il client.**
- `npx prisma migrate dev` → crea le tabelle in Postgres a partire dallo schema.
- `npx prisma generate` → crea il "client", il codice tipizzato con cui fai le query.

**Passo 3 — usa il client nel codice:**
```ts
// LEGGERE
const ordini = await prisma.ordine.findMany({
  where: { stato: "APERTO" },
  include: { tavolo: true, righe: { include: { prodotto: true } } },
});

// CREARE
await prisma.ordine.create({ data: { tavoloId: "abc", stato: "APERTO" } });

// AGGIORNARE
await prisma.ordine.update({ where: { id }, data: { stato: "PAGATO" } });
```
Nota `include`: chiedi a Prisma di portarti anche i dati collegati (l'ordine **con** il suo tavolo e le sue righe).

**Il regalo più bello:** i tipi TypeScript nascono da qui. Non li scrivi a mano: `import type { Ordine } from "@prisma/client"`.

**Strumenti utili:** `npx prisma studio` apre una schermata web per vedere/modificare i dati a mano (comodissimo mentre sviluppi).

---

## 7. Zod — il controllore all'ingresso

**Il problema che risolve.** I dati che arrivano dall'esterno (un form compilato dall'utente, un webhook di pagamento) non sono affidabili: potrebbero avere il prezzo scritto come testo, campi mancanti, valori assurdi. Zod li **controlla prima** che entrino nel sistema.

**Modello mentale.** È il controllore all'ingresso del locale: definisci le regole ("il prezzo deve essere un numero positivo") e Zod respinge chi non le rispetta.

**Come funziona.** Definisci uno "schema" delle regole, poi lo usi per validare:
```ts
import { z } from "zod";

const prodottoSchema = z.object({
  nome: z.string().min(1, "Il nome è obbligatorio"),
  prezzo: z.coerce.number().positive("Il prezzo deve essere positivo"),
  disponibile: z.boolean(),
});

// Validazione: se i dati sono sbagliati, lancia un errore chiaro
const dati = prodottoSchema.parse(inputDalForm);
// Se arriviamo qui, "dati" è sicuramente valido e tipizzato
```

**Il trucco più potente — un tipo dallo schema:**
```ts
type ProdottoInput = z.infer<typeof prodottoSchema>;
// TypeScript ricava il tipo automaticamente dalle regole. Un solo posto da mantenere.
```

**Nel gestionale:** stesso schema Zod usato in **due posti** — nel form (per avvisare l'utente subito) e nella Server Action (per bloccare davvero dati sbagliati prima di scrivere nel DB). Non ti fidi mai solo del controllo lato browser.

---

# Autenticazione

## 8. Auth.js — il buttafuori

**Il problema che risolve.** Devi sapere *chi* sta usando l'app e *cosa può fare*. Un cameriere non deve poter cancellare il menu; solo l'admin sì. Auth.js gestisce login, sessioni e identità.

**Modello mentale.** È il buttafuori all'ingresso: controlla chi entra (login), gli dà un braccialetto (sessione) e sul braccialetto c'è scritto il ruolo (cameriere, cuoco, admin).

**Due concetti da distinguere:**
- **Autenticazione** = *chi sei* (fai il login). ← questo lo fa Auth.js.
- **Autorizzazione** = *cosa puoi fare* (controllo del ruolo). ← questo lo scrivi tu, usando il ruolo che Auth.js ti mette a disposizione.

**Come funziona.** Configuri una volta i "provider" (i modi di fare login) e delle "callback" per aggiungere il ruolo alla sessione:
```ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({ // login con email+password o PIN
      authorize: async (creds) => { /* verifica la password */ },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      session.user.ruolo = token.ruolo; // il ruolo arriva fino alla UI
      return session;
    },
  },
});
```
Poi, ovunque, chiedi chi è l'utente:
```ts
const session = await auth();
if (!session) redirect("/login");          // non loggato → fuori
if (session.user.ruolo !== "ADMIN") throw new Error("Vietato"); // ruolo sbagliato
```

**Regola d'oro:** il controllo del ruolo che conta va fatto **sul server** (Server Actions, pagine), non solo nascondendo un bottone. Nascondere un bottone è cortesia; il vero cancello è il controllo server.

---

## 9. bcrypt — la cassaforte delle password

**Il problema che risolve.** Le password non vanno **mai** salvate come sono. Se qualcuno ruba il database, non deve trovare "password123". bcrypt le trasforma in un codice illeggibile e irreversibile.

**Modello mentale.** È un tritacarne a senso unico: metti dentro la password, esce un "hash" (un codice). Dall'hash **non** si può tornare indietro alla password. Per il login non "decifri" nulla: tritur di nuovo la password inserita e confronti i due codici.

**Come funziona — due sole operazioni:**
```ts
import bcrypt from "bcrypt";

// Quando CREI un utente: salvi solo l'hash, mai la password
const hash = await bcrypt.hash(passwordInChiaro, 12); // 12 = quanto "lavoro"
// -> salvi "hash" nel campo passwordHash del DB

// Quando l'utente fa LOGIN: confronti
const corretta = await bcrypt.compare(passwordInserita, utente.passwordHash);
// corretta = true/false, senza mai decifrare nulla
```
Il numero `12` (i "salt rounds") è quanto è costoso calcolare l'hash: più alto = più sicuro ma più lento. 10-12 va bene.

**Nel gestionale:** Auth.js con Credentials non hasha da solo — bcrypt è il pezzo che usi dentro `authorize` per verificare la password, e quando crei gli account dello staff.

---

# I form

## 10. React Hook Form — i moduli senza fatica

**Il problema che risolve.** Gestire i form in React a mano è noioso: tenere il valore di ogni campo, i messaggi d'errore, quando validare... React Hook Form fa tutto questo in modo veloce e con poco codice.

**Modello mentale.** Invece di controllare tu ogni tasto premuto, "registri" i campi e la libreria li tiene d'occhio per te. È efficiente perché evita di ridisegnare tutto a ogni lettera digitata.

**Come funziona.**
```tsx
"use client";
import { useForm } from "react-hook-form";

function FormProdotto() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (dati) => { /* salva il prodotto */ };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("nome")} placeholder="Nome piatto" />
      <input {...register("prezzo")} placeholder="Prezzo" />
      {errors.prezzo && <span>Prezzo non valido</span>}
      <button type="submit">Salva</button>
    </form>
  );
}
```
- `register("nome")` collega l'input al form (lo "arruola").
- `handleSubmit` raccoglie tutti i valori e li passa alla tua funzione solo se la validazione passa.
- `errors` contiene gli errori da mostrare.

**Nel gestionale:** ogni modulo (nuovo prodotto, modifica menu, login, dati tavolo) usa questo schema. Da solo React Hook Form sa validare regole semplici; per regole serie si abbina a Zod (prossima sezione).

---

## 11. Hook Form Resolvers — il ponte verso Zod

**Il problema che risolve.** Hai già scritto le regole di validazione in Zod (sez. 7). Non vuoi riscriverle dentro il form. Questo pacchetto (`@hookform/resolvers`) collega i due: React Hook Form valida usando **il tuo schema Zod**.

**Modello mentale.** È l'adattatore che fa parlare React Hook Form e Zod. Una regola sola (Zod), usata sia nel form sia sul server.

**Come funziona.**
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { prodottoSchema } from "@/lib/schemi";

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(prodottoSchema), // ← il ponte
});
// Ora il form valida con le stesse regole Zod usate nella Server Action.
// I messaggi d'errore di Zod ("Il prezzo deve essere positivo") appaiono in "errors".
```

**Nel gestionale:** definisci `prodottoSchema` una volta; lo usi qui nel form **e** nella Server Action. Se domani cambi la regola del prezzo, la cambi in un posto solo.

---

# Dati lato client e utilità

## 12. TanStack Query — i dati sempre aggiornati

**Il problema che risolve.** Alcune schermate devono restare **vive**: il display della cucina deve mostrare le nuove comande senza che nessuno ricarichi la pagina. Gestire a mano "richiedi i dati, riprova ogni tot, tieni la cache, gestisci gli errori" è complicato. TanStack Query lo fa per te.

**Modello mentale.** È un cameriere instancabile che continua a chiedere alla cucina "ci sono novità?" e aggiorna lo schermo appena ce ne sono, tenendo in memoria l'ultima risposta.

**Come funziona.**
```tsx
"use client";
import { useQuery } from "@tanstack/react-query";

function DisplayCucina() {
  const { data: comande, isLoading } = useQuery({
    queryKey: ["comande", "cucina"],           // il "nome" di questi dati
    queryFn: () => fetch("/api/cucina").then(r => r.json()), // come prenderli
    refetchInterval: 5000,                      // richiedili di nuovo ogni 5s
  });

  if (isLoading) return <p>Caricamento…</p>;
  return <ListaComande comande={comande} />;
}
```
- `queryKey` = l'etichetta con cui identifica e mette in cache questi dati.
- `queryFn` = la funzione che va a prenderli.
- `refetchInterval` = ogni quanto ricontrollare (perfetto per la cucina).

**Come convive con Next.js:** i Server Components caricano i dati la prima volta (veloce); TanStack Query li tiene aggiornati dopo, lato browser, dove serve il "live". Richiede di avvolgere la dashboard in un `QueryClientProvider` una volta sola.

**Nel gestionale:** cucina (KDS), stato dei tavoli in tempo reale, notifiche di nuovi ordini.

---

## 13. date-fns — le date senza mal di testa

**Il problema che risolve.** Lavorare con date e orari in JavaScript puro è scomodo e pieno di trappole. date-fns offre funzioni semplici per formattare, confrontare e calcolare date.

**Modello mentale.** Una cassetta di attrezzi per le date: ogni operazione è una funzione con un nome chiaro. Prendi solo le funzioni che usi (resta leggera).

**Come funziona.**
```ts
import { format, isToday, differenceInMinutes } from "date-fns";
import { it } from "date-fns/locale";

format(ordine.creatoIl, "HH:mm", { locale: it });   // "20:45"
format(ordine.creatoIl, "d MMMM yyyy", { locale: it }); // "14 luglio 2026"
isToday(ordine.creatoIl);                            // true/false
differenceInMinutes(new Date(), ordine.creatoIl);    // da quanti minuti è in attesa
```

**Nel gestionale:** orario di ogni comanda, "in attesa da 12 minuti" in cucina, filtri dei report per giorno/turno, formattazione delle date in italiano.

---

## 14. clsx — accendere e spegnere le classi CSS

**Il problema che risolve.** Spesso una classe CSS va applicata *solo a certe condizioni* (il tavolo è occupato → bordo arancione). Comporre queste stringhe a mano è brutto e pieno di errori. clsx lo fa in modo pulito.

**Modello mentale.** Un interruttore per le classi: gli dai una lista e lui include solo quelle "accese" (vere).

**Come funziona.**
```tsx
import clsx from "clsx";
import styles from "./TavoloCard.module.scss";

<div className={clsx(
  styles.card,                          // sempre presente
  occupato && styles["card--occupato"], // solo se occupato è vero
  selezionato && styles["card--attivo"] // solo se selezionato è vero
)} />
```
Se `occupato` è falso, quella classe semplicemente non compare. Niente `if` e concatenazioni di stringhe.

**Nel gestionale:** stati visivi ovunque — tavolo libero/occupato, ordine in preparazione/pronto, riga selezionata.

---

# Interfaccia

## 15. Lucide React — le icone

**Il problema che risolve.** Servono icone pulite e coerenti (piatto, tavolo, stampa, carrello). Lucide te le dà come componenti React pronti.

**Modello mentale.** Ogni icona è un componente React che usi come un tag, e la personalizzi con le props (dimensione, colore).

**Come funziona.**
```tsx
import { Table2, ChefHat, Printer, ShoppingCart } from "lucide-react";

<Table2 size={20} />
<ChefHat color="#c0392b" />
<button><Printer size={16} /> Stampa comanda</button>
```
Cerchi il nome dell'icona sul sito di Lucide, la importi, la usi. Si colora e si dimensiona come vuoi.

**Nel gestionale:** icone nella sidebar, sui bottoni azione, accanto agli stati.

---

## 16. Sonner — le notifiche toast

**Il problema che risolve.** Serve dare un riscontro rapido all'utente ("Ordine inviato in cucina", "Errore, riprova") senza bloccare lo schermo con una finestra. I "toast" sono quei messaggini che appaiono e spariscono da soli.

**Modello mentale.** Il campanello del passavivande: un avviso breve che compare, si fa notare e scompare.

**Come funziona.** Monti il contenitore una volta nel layout, poi chiami `toast()` da qualsiasi punto:
```tsx
// nel layout della dashboard, una sola volta:
import { Toaster } from "sonner";
<Toaster position="top-right" />

// ovunque, quando serve:
import { toast } from "sonner";
toast.success("Ordine inviato in cucina");
toast.error("Impossibile chiudere il conto");
toast.loading("Salvataggio…");
```

**Nel gestionale:** conferme di invio comanda, chiusura conto, errori di rete, avvisi di prodotto esaurito.

---

## 17. Recharts — i grafici dei report

**Il problema che risolve.** I report (incassi, piatti più venduti) si capiscono meglio con dei grafici. Recharts disegna grafici componendo componenti React, senza dover imparare a disegnare a mano.

**Modello mentale.** Costruisci un grafico come costruisci una UI React: assembli pezzi (`<BarChart>`, `<Bar>`, `<XAxis>`, `<Tooltip>`) e gli passi i dati.

**Come funziona.**
```tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const dati = [
  { turno: "Pranzo", incasso: 1240 },
  { turno: "Cena",   incasso: 2870 },
];

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={dati}>
    <XAxis dataKey="turno" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="incasso" fill="#c0392b" />
  </BarChart>
</ResponsiveContainer>
```
Gli dai un array di dati e indichi quali campi usare per gli assi (`dataKey`).

**Nel gestionale:** incassi per turno/giorno, classifica dei piatti, andamento settimanale. È un Client Component (gira nel browser).

---

# Il contorno

## 18. dotenv — i segreti fuori dal codice

**Il problema che risolve.** Password del database, chiavi segrete: non devono stare scritte nel codice (finirebbero su Git, visibili a tutti). Si mettono in un file `.env` separato, e dotenv le carica.

**Modello mentale.** Una cassaforte fuori dal codice. Il codice dice "dammi la chiave DATABASE_URL", senza sapere qual è: il valore vive nel `.env`, che **non** si condivide.

**Come funziona.**
```bash
# file .env (NON va su Git — mettilo in .gitignore)
DATABASE_URL="postgresql://user:pass@localhost:5432/gestionale"
AUTH_SECRET="una-stringa-lunga-e-segreta"
```
```ts
// nel codice leggi così:
process.env.DATABASE_URL
```
Next.js carica il `.env` da solo. dotenv serve soprattutto negli **script fuori da Next** (es. `seed.ts`, comandi da terminale) dove Next non è in mezzo:
```ts
import "dotenv/config"; // carica il .env all'avvio dello script
```

**Nel gestionale:** connessione al DB, segreto di Auth.js, eventuali chiavi di servizi esterni (pagamenti). Committa solo un `.env.example` con le chiavi vuote, come promemoria.

---

## 19. pg e Prisma Adapter — il tubo verso Postgres

**Il problema che risolve.** Qualcuno deve fisicamente aprire la connessione di rete verso PostgreSQL e trasportare i dati avanti e indietro. `pg` è il **driver** ufficiale che fa questo; il Prisma Adapter (`@prisma/adapter-pg`) fa sì che Prisma usi proprio quel driver.

**Modello mentale.** `pg` è il tubo idraulico che collega l'app al database. Prisma è il traduttore che decide *cosa* mandare nel tubo. L'adapter è il raccordo che li unisce. Nella maggior parte del codice **non li tocchi**: lavori con Prisma e basta. Li configuri una volta sola.

**Come funziona (configurazione, una volta):**
```ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
// Da qui in poi usi solo "prisma.qualcosa", come nella sezione 6.
```

**Perché esistono:** dare a Prisma il controllo diretto della connessione tramite `pg` aiuta con il **connection pooling** (gestire tante connessioni brevi senza sovraccaricare il DB), utile in produzione e in ambienti serverless.

**Nel gestionale:** è infrastruttura invisibile. La imposti all'inizio in `lib/prisma.ts`, poi te ne dimentichi e usi Prisma normalmente.

---

## Come tutto si tiene insieme — riepilogo in una frase

**TypeScript** dà i tipi a tutto; **React** disegna l'interfaccia; **Next.js** la ospita e decide server/client; **SCSS** la veste; **Prisma** parla con **PostgreSQL** (attraverso **pg**/adapter) usando i segreti caricati da **dotenv**; **Zod** controlla i dati in ingresso, condiviso tra i form di **React Hook Form** (collegati via **Resolvers**) e le Server Actions; **Auth.js** con **bcrypt** decide chi entra e cosa può fare; **TanStack Query** tiene vive le schermate della cucina; **date-fns**, **clsx**, **Lucide**, **Sonner** e **Recharts** rifiniscono orari, stili, icone, notifiche e grafici.

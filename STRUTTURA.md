# Struttura del Progetto — Gestionale Ristorativo

Documento di riferimento per l'organizzazione delle schermate e delle cartelle.
Nasce dagli schemi Figma dei ruoli. **Non** è codice: è la mappa di destinazione.

> Principio guida: **si separa in superficie, si condivide in profondità.**
> UI/rotte separate per ruolo, ma logica dei dati (in `src/lib/`) unica e condivisa.
> Le cartelle si creano **una alla volta**, quando si costruisce quella schermata (YAGNI).

---

## I tre livelli (da non confondere)

1. **Schermate / sezioni** → diventano *rotte* (cartelle in `src/app/`).
2. **Funzionalità dentro una schermata** → diventano *componenti*, non cartelle-rotta.
3. **Integrazioni esterne / idee ambiziose** → "Fase 2", fuori dalla struttura iniziale.

---

## I due ruoli (utenti dell'app = solo staff)

Il cliente del ristorante **non** è utente dell'app: tocca il sistema solo dall'esterno
(WhatsApp, recensioni). Gli utenti autenticati sono soltanto:

- **TITOLARE (Super Admin)** — osserva da remoto, prevalentemente sola lettura.
- **OPERATORE (Admin)** — lavora nel locale, area operativa.

---

## Mappa delle rotte (Livello 1)

```
src/app/
├── login/                     ← unica, condivisa
│
├── operatore/                 ← AREA OPERATORE (chi lavora nel locale)
│   ├── (home)                 → riassunti di ogni postazione
│   ├── sala/                  → dashboard "Gestione-Tavoli", prenotazioni, interazioni cliente
│   ├── ordini/                → asporti (WhatsApp/tel), delivery terzi (Glovo), pannelli
│   └── cucina/                → "mole di lavoro": sezione asporti / sezione sala
│
└── titolare/                  ← AREA TITOLARE (osserva da remoto, sola lettura)
    ├── (home)                 → riassunti di ogni postazione
    ├── sala/                  → dashboard sala (numeri, real-time)
    ├── cucina/                → dashboard cucina (numeri, real-time)
    └── analytics/             → prenotazioni, ordini+Glovo, turnover, materie prime, incassi
```

Ogni cartella-area (`operatore/`, `titolare/`) avrà il proprio `layout.tsx` che:
1. disegna la cornice dell'area (sidebar/header propri del ruolo);
2. fa da **cancello**: controlla il ruolo (Auth.js) e blocca chi non è autorizzato.

---

## Dettaglio delle sezioni (Livello 2 — funzionalità/componenti)

### Area OPERATORE

**Home** — piccoli riassunti di ogni postazione lavorativa.

**Sala**
- Dashboard "Gestione-Tavoli" per la sala.
- Gestione delle prenotazioni (dall'app).
- Interazione con il cliente durante e a fine pasto:
  - Fidelizzazione: recensioni; "tessera punti" (senza iscrizione, dati dalla prenotazione,
    sconto al raggiungimento di un massimale).
  - Gettoni: virtuale su WhatsApp → ruota della fortuna con sconti; fisico → macchina
    con peluche/gadget stampati in 3D del ristorante.

**Ordini**
- Asporti su WhatsApp o telefono: dashboard orari, pannello ingredienti in esaurimento,
  pannello orari real-time ordini Glovo/delivery, pulsante messaggi WhatsApp precompilati.
- Glovo / delivery da terzi: accetta/rifiuta ordini, pannello ingredienti in esaurimento,
  pannello orari real-time ordini WhatsApp/telefonici.

**Cucina** — dashboard "mole di lavoro":
- Sezione Asporti / Sezione Sala.
- Per ogni comanda: orari, cosa ordinato, quantità ingredienti utilizzati, note particolari.

### Area TITOLARE

**Home** — riassunti di ogni postazione lavorativa.

**Sala** — dashboard (tavoli prenotati, ordini in attesa, totale ordini serata, turnover tavoli).

**Cucina** — dashboard (ordini in esecuzione, utilizzo cibo/bevande/materiali).

**Analytics** — dashboard con grafici giornaliero / mensile / annuale:
- Totale prenotazioni
- Totale ordini e Glovo
- Totale turnover dei tavoli
- Totale uso materie prime e materiali
- Totale incassi

---

## Integrazioni esterne (Livello 3 — "Fase 2", parcheggiate)

Idee da integrare *dopo* il cuore dell'app. Ognuna è un mini-progetto a sé:

- **WhatsApp**: ricezione ordini/asporti, messaggi precompilati, gettone virtuale.
- **Glovo / delivery terzi**: ricezione e gestione ordini.
- **Ruota della fortuna**: mini-sito per sconti collegato al gettone virtuale.
- **Distributore di peluche/gadget 3D**: macchina fisica (hardware) col gettone fisico.

---

## Obiettivi futuri (progetti separati, dopo la conclusione di questo)

Non fanno parte di questo progetto, ma sono pensati per integrarsi con esso in seguito
e rendere l'applicazione completa e competitiva:

1. **App per telefono per prendere gli ordini.**
2. **App personalizzata per il ristorante** — prenotazioni, info sulle serate a tema, buoni regalo.
3. **App per la gestione degli inventari e ordini fornitori** — programmazione ordini in
   calendario, limite scorte, visualizzazione prodotti in sconto dei fornitori.

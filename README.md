# 🍽️ Gestionale Ristorativo

Un'applicazione web moderna e reattiva per la gestione completa di un'attività ristorativa. Il sistema è progettato per semplificare il flusso di lavoro del personale, dalla presa degli ordini alla gestione dei tavoli, fino alla comunicazione diretta con la cucina.

## 🌟 Funzionalità Principali

Il gestionale è diviso in moduli specifici per coprire ogni aspetto della ristorazione:

*   **📱 Area Operatore:** Un'interfaccia dedicata allo staff per la gestione quotidiana del ristorante.
*   **🍳 Modulo Cucina:** Visualizzazione e gestione in tempo reale delle comande in preparazione.
*   **📝 Gestione Ordini:** Creazione, modifica e tracciamento dello stato degli ordini dei clienti.
*   **📅 Prenotazioni:** Sistema di registrazione e organizzazione delle prenotazioni.
*   **🗺️ Gestione Sala e Tavoli:** Mappatura visuale della sala con piantine personalizzate per monitorare i tavoli liberi e occupati.

## 🛠️ Tecnologie Utilizzate

Questo progetto è costruito con uno stack moderno basato su React e Node.js:

*   **Framework:** [Next.js]
*   **Linguaggio:** [TypeScript]
*   **Styling:** SCSS / CSS Modules
*   **Database & ORM:** [Prisma]con PostgreSQL

## 📁 Struttura del Progetto

La codebase è organizzata in modo modulare sfruttando l'App Router di Next.js:

```text
Gestionale-Ristorativo/
├── prisma/                 # Schema del database e migrazioni Prisma
├── public/
│   └── piantine-sale/      # Asset grafici per la mappatura dei tavoli
├── src/
│   └── app/
│       ├── operatore/      # Root dell'interfaccia gestionale
│       │   ├── _components/# Componenti UI riutilizzabili
│       │   ├── cucina/     # Pagine relative alla cucina
│       │   ├── ordini/     # Pagine relative agli ordini
│       │   ├── prenotazioni/# Pagine relative alle prenotazioni
│       │   └── sala/       # Pagine per la gestione della sala
│       ├── globals.scss    # Stili globali
│       └── layout.tsx / page.tsx # Entry points dell'applicazione
├── next.config.ts          # Configurazione Next.js
└── package.json            # Dipendenze e script di progetto

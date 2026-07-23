export type Voce = {
  href: string;
  sezione: string;
  etichetta: string;
  sottoSchede?: { href: string; etichetta: string }[];
};

export const voci: Voce[] = [
  { href: "/operatore", sezione: "/operatore", etichetta: "Home" },
  {
    href: "/operatore/sala/tavoli",
    sezione: "/operatore/sala",
    etichetta: "Sala",
    sottoSchede: [
      { href: "/operatore/sala/tavoli", etichetta: "Tavoli" },
      { href: "/operatore/sala/stato-tavoli", etichetta: "Stato Tavoli" },
      { href: "/operatore/sala/menu", etichetta: "Menu" },
      { href: "/operatore/sala/presenze-dipendenti", etichetta: "Presenze Dipendenti" },
      { href: "/operatore/sala/tessere-punti", etichetta: "Tessere Punti" }
    ]
  },
  {
    href: "/operatore/ordini/traccia",
    sezione: "/operatore/ordini",
    etichetta: "Ordini",
    sottoSchede: [
      { href: "/operatore/ordini/traccia", etichetta: "Traccia" },
      { href: "/operatore/ordini/crea-asporto", etichetta: "Crea Asporto" }
    ]
  },
  {
    href: "/operatore/prenotazioni/agenda",
    sezione: "/operatore/prenotazioni",
    etichetta: "Prenotazioni",
    sottoSchede: [
      { href: "/operatore/prenotazioni/agenda", etichetta: "Agenda" },
      { href: "/operatore/prenotazioni/gestisci", etichetta: "Gestisci" }
    ]
  },
  {
    href: "/operatore/cucina/sala",
    sezione: "/operatore/cucina",
    etichetta: "Cucina",
    sottoSchede: [
      { href: "/operatore/cucina/sala", etichetta: "Sala" },
      { href: "/operatore/cucina/asporti", etichetta: "Asporti" },
      { href: "/operatore/cucina/magazzino", etichetta: "Magazzino" }
    ]
  }
];
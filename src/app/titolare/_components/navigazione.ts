export type Voce = {
  href: string;
  sezione: string;
  etichetta: string;
};

export const voci: Voce[] = [
  { href: "/titolare", sezione: "/titolare", etichetta: "Home" },
  {
    href: "/titolare/segnalazioni",
    sezione: "/titolare/segnalazioni",
    etichetta: "Segnalazioni",
  },
  {
    href: "/titolare/zone-di-lavoro",
    sezione: "/titolare/zone-di-lavoro",
    etichetta: "Zone di lavoro",
  },
  {
    href: "/titolare/menu",
    sezione: "/titolare/menu",
    etichetta: "Menu",
  },
  {
    href: "/titolare/analytics",
    sezione: "/titolare/analytics",
    etichetta: "Analytics",
  }
];
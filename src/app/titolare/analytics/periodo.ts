import { format } from "date-fns";
import { it } from "date-fns/locale";

export const periodi = [
  { giorni: 7, etichetta: "7 giorni" },
  { giorni: 30, etichetta: "30 giorni" }
];

export function leggiPeriodo(valore: string | undefined | null) {
  return valore === "30" ? 30 : 7;
}

export function giorniFa(giorni: number) {
  return Array.from({ length: giorni }, (_, indice) => giorni - 1 - indice);
}

export function etichettaGiorno(data: Date, giorni: number) {
  return giorni > 7 ? format(data, "d/M") : format(data, "EEE", { locale: it });
}

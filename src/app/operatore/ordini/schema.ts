import { z } from "zod";

export const rigaOrdineSchema = z.object({
  piattoId: z.string().min(1),
  quantita: z.coerce.number().int().min(1),
  note: z.string().optional()
});

export const ordineSchema = z.object({
  fonte: z.enum(["SALA", "ASPORTO"]),
  occupazioneId: z.string().optional(),
  nomeCliente: z.string().optional(),
  righe: z.array(rigaOrdineSchema).min(1, "Aggiungi almeno un piatto")
});

export type OrdineInput = z.output<typeof ordineSchema>;
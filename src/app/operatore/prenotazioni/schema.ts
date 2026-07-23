import { z } from "zod";

export const prenotazioneSchema = z.object({
  nome: z.string().min(1, "Il nome è obbligatorio"),
  telefono: z.string().optional(),
  copertiPrenotati: z.coerce.number().int().min(1, "Almeno 1 coperto"),
  dataOra: z.coerce.date(),
  note: z.string().optional(),
  tavoloId: z.string().optional()
});
export type PrenotazioneForm = z.input<typeof prenotazioneSchema>;
export type PrenotazioneInput = z.infer<typeof prenotazioneSchema>;
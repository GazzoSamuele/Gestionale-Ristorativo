import { z } from "zod";

export const piattoSchema = z.object({
  nome: z.string().min(1, "Il nome è obbligatorio"),
  prezzo: z.coerce.number().positive("Il prezzo deve essere maggiore di 0"),
  categoriaId: z.string().min(1, "Seleziona una categoria")
});
export type PiattoForm = z.input<typeof piattoSchema>;
export type PiattoInput = z.infer<typeof piattoSchema>;
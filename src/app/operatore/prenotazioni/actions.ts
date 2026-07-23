'use server'

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { prenotazioneSchema } from "./schema";

export async function creaPrenotazione(input: unknown) {
  const controllo = prenotazioneSchema.safeParse(input);

  if (!controllo.success) {
    return { ok: false as const, errore: "Dati non validi" };
  }

  const dati = controllo.data;

  await prisma.prenotazione.create({
    data: {
      nome: dati.nome,
      telefono: dati.telefono || null,
      copertiPrenotati: dati.copertiPrenotati,
      dataOra: dati.dataOra,
      note: dati.note || null,
      tavoloId: dati.tavoloId || null
    }
  });

  revalidatePath("/operatore/prenotazioni/agenda");

  return { ok: true as const };
}
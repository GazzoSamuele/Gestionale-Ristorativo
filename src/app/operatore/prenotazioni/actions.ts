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

export async function siediPrenotazione(prenotazioneId: string) {
  const prenotazione = await prisma.prenotazione.findUnique({
    where: { id: prenotazioneId }
  });

  if (!prenotazione) {
    return { ok: false as const, errore: "Prenotazione non trovata" };
  }

  if (!prenotazione.tavoloId) {
    return { ok: false as const, errore: "Assegna prima un tavolo" };
  }

  const giaOccupato = await prisma.occupazione.findFirst({
    where: { tavoloId: prenotazione.tavoloId, terminataAlle: null }
  });

  if (giaOccupato) {
    return { ok: false as const, errore: "Il tavolo è già occupato" };
  }

  await prisma.occupazione.create({
    data: {
      tavoloId: prenotazione.tavoloId,
      prenotazioneId: prenotazione.id,
      copertiPresenti: prenotazione.copertiPrenotati
    }
  });

  revalidatePath("/operatore/sala/tavoli");
  revalidatePath("/operatore/prenotazioni/gestisci");

  return { ok: true as const };
}
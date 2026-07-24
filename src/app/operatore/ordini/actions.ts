'use server'

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ordineSchema } from "./schema";

export async function creaOrdine(input: unknown) {
  const controllo = ordineSchema.safeParse(input);

  if (!controllo.success) {
    return { ok: false as const, errore: "Dati non validi" };
  }

  const { fonte, occupazioneId, nomeCliente, righe } = controllo.data;

  if (fonte === "SALA") {
    if (!occupazioneId) {
      return { ok: false as const, errore: "Seleziona il tavolo" };
    }

    const occupazione = await prisma.occupazione.findFirst({
      where: { id: occupazioneId, terminataAlle: null }
    });

    if (!occupazione) {
      return { ok: false as const, errore: "Il tavolo non è più occupato" };
    }
  }

  if (fonte === "ASPORTO" && !nomeCliente?.trim()) {
    return { ok: false as const, errore: "Indica il nome del cliente" };
  }

  const piatti = await prisma.piatto.findMany({
    where: { id: { in: righe.map((r) => r.piattoId) }, disponibile: true }
  });

  const prezzi = new Map(piatti.map((p) => [p.id, p.prezzo]));

  const righeDaCreare = [];

  for (const riga of righe) {
    const prezzo = prezzi.get(riga.piattoId);

    if (!prezzo) {
      return { ok: false as const, errore: "Un piatto non è più disponibile" };
    }

    righeDaCreare.push({
      piattoId: riga.piattoId,
      quantita: riga.quantita,
      note: riga.note || null,
      prezzoUnitario: prezzo
    });
  }

  await prisma.ordine.create({
    data: {
      fonte,
      occupazioneId: fonte === "SALA" ? occupazioneId : null,
      nomeCliente: fonte === "ASPORTO" ? nomeCliente : null,
      righe: {
        create: righeDaCreare
      }
    }
  });

  revalidatePath("/operatore/ordini/traccia");

  return { ok: true as const };
}
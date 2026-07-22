'use server'

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const SpostaTavoloInput = z.object({
  id: z.string().min(1),
  posX: z.number().min(0).max(100),
  posY: z.number().min(0).max(100)
});

export async function spostaTavolo(input: { id: string; posX: number; posY: number }) {

  const controllo = SpostaTavoloInput.safeParse(input);

  if (!controllo.success) {
    return { ok: false as const, errore: "Coordinate non valide" };
  }

  const { id, posX, posY } = controllo.data;

  try {
    await prisma.tavolo.update({
      where: { id },
      data: { posX, posY }
    });
  } catch {
    return { ok: false as const, errore: "Tavolo non trovato" };
  }

  revalidatePath("/operatore/sala/tavoli");

  return { ok: true as const };
}

const OccupaTavoloInput = z.object({
  tavoloId: z.string().min(1),
  copertiPresenti: z.number().int().min(1)
});

export async function occupaTavolo(input: { tavoloId: string; copertiPresenti: number }) {
  const controllo = OccupaTavoloInput.safeParse(input);

  if (!controllo.success) {
    return { ok: false as const, errore: "Dati non validi" };
  }

  const { tavoloId, copertiPresenti } = controllo.data;

  const giaOccupato = await prisma.occupazione.findFirst({
    where: { tavoloId, terminataAlle: null }
  });

  if (giaOccupato) {
    return { ok: false as const, errore: "Il tavolo è già occupato" };
  }

  await prisma.occupazione.create({
    data: { tavoloId, copertiPresenti }
  });

  revalidatePath("/operatore/sala/tavoli");

  return { ok: true as const };
}

const LiberaTavoloInput = z.object({
  tavoloId: z.string().min(1)
});

export async function liberaTavolo(input: { tavoloId: string }) {
  const controllo = LiberaTavoloInput.safeParse(input);

  if (!controllo.success) {
    return { ok: false as const, errore: "Dati non validi" };
  }

  const { tavoloId } = controllo.data;

  const occupazione = await prisma.occupazione.findFirst({
    where: { tavoloId, terminataAlle: null }
  });

  if (!occupazione) {
    return { ok: false as const, errore: "Il tavolo è già libero" };
  }

  await prisma.occupazione.update({
    where: { id: occupazione.id },
    data: { terminataAlle: new Date() }
  });

  revalidatePath("/operatore/sala/tavoli");

  return { ok: true as const };
}
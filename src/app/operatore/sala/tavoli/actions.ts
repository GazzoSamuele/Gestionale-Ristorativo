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

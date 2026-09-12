'use server'

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function toggleDisponibilita(piattoId:string) {
    const ricercaPiatto = await prisma.piatto.findUnique({ 
        where: { 
            id: piattoId 
        }
    });

    if (!ricercaPiatto) {
        return { ok: false as const, errore: "Piatto non trovato" }
    }
    
  await prisma.piatto.update({ 
    where: { id: piattoId }, 
    data: { disponibile: !ricercaPiatto.disponibile } 
    })

    revalidatePath("/titolare/menu")

     return { ok: true as const };
}
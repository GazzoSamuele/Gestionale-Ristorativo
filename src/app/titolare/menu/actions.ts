'use server'

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { piattoSchema } from "./schema";

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

export async function creaPiatto(input: unknown) {

    const controllo = piattoSchema.safeParse(input);

    if (!controllo.success) {
        return { ok: false as const, errore: "Dati non validi" };
    }

    const dati = controllo.data;

    const categoriaTrovata = await prisma.categoria.findUnique({
        where: {
            id: dati.categoriaId
        }
    }); 

    if (!categoriaTrovata) {
        return { ok: false as const, errore: "Categoria non trovata"}
    }

    await prisma.piatto.create({
        data: { 
            nome: dati.nome,  
            prezzo: dati.prezzo,
            categoriaId: dati.categoriaId
        }
    })

    revalidatePath("/titolare/menu")

    return { ok: true as const }
    
}
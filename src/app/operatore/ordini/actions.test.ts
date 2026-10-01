import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/sessione", () => ({
  leggiSessione: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    ordine: { create: vi.fn() },
    occupazione: { findFirst: vi.fn() },
    piatto: { findMany: vi.fn() },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { creaOrdine } from "./actions";
import { leggiSessione } from "@/lib/sessione";
import { prisma } from "@/lib/prisma";

describe("creaOrdine", () => {
  it("senza login risponde Non autorizzato e non tocca il database", async () => {
    // 1. Prepara: nessuno ha fatto il login
    vi.mocked(leggiSessione).mockResolvedValue(null);

    // 2. Esegui
    const risultato = await creaOrdine({
      fonte: "ASPORTO",
      nomeCliente: "Rossi",
      righe: [],
    });

    // 3. Verifica
    expect(risultato).toEqual({ ok: false, errore: "Non autorizzato" });
    expect(prisma.ordine.create).not.toHaveBeenCalled();
  });
});

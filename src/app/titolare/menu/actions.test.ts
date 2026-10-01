import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/sessione", () => ({
  eTitolare: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    piatto: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    categoria: { findUnique: vi.fn() },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { creaPiatto } from "./actions";
import { eTitolare } from "@/lib/sessione";
import { prisma } from "@/lib/prisma";

describe("creaPiatto", () => {
  it("un operatore non può creare un piatto", async () => {
    // 1. Prepara: nessuno ha fatto il login
    vi.mocked(eTitolare).mockResolvedValue(false);

    // 2. Esegui
    const risultato = await creaPiatto({
      nome: "Carbonara",
      prezzo: 12,
      categoriaId: "cat-1",
    });

    // 3. Verifica
    expect(risultato).toEqual({ ok: false, errore: "Non autorizzato" });
    expect(prisma.piatto.create).not.toHaveBeenCalled();
  });
});

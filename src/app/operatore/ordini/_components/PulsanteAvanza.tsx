'use client'

import { toast } from "sonner";
import { avanzaOrdine } from "../actions";

export default function PulsanteAvanza({ ordineId }: { ordineId: string }) {
  const handleClick = async () => {
    const esito = await avanzaOrdine(ordineId);

    if (esito.ok) {
      toast.success("Ordine inviato");
    } else {
      toast.error(esito.errore);
    }
  };

  return (
    <button type="button" onClick={handleClick}>
      Invia Ordine
    </button>
  );
}
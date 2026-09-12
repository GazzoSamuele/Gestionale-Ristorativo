'use client'

import { useState } from "react";
import { toast } from "sonner";
import { toggleDisponibilita } from "../actions";

export default function ToggleDisponibilita({ piattoId, disponibile, className }: { piattoId: string; disponibile: boolean; className?: string }) {
  const [invio, setInvio] = useState(false);

  const handleClick = async () => {
    setInvio(true);

    const esito = await toggleDisponibilita(piattoId);

    setInvio(false);

    if (esito.ok) {
      toast.success("Piatto aggiornato");
    } else {
      toast.error(esito.errore);
    }
  };

  return (
    <button type="button" className={className} onClick={handleClick} disabled={invio}>
      {disponibile ? "Disattiva" : "Riattiva"}
    </button>
  );
}

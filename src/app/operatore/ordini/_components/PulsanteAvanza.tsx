'use client'

import { useState } from "react";
import { toast } from "sonner";
import { avanzaOrdine } from "../actions";
import styles from "./PulsanteAvanza.module.scss";

export default function PulsanteAvanza({ ordineId }: { ordineId: string }) {
  const [invio, setInvio] = useState(false);

  const handleClick = async () => {
    setInvio(true);

    const esito = await avanzaOrdine(ordineId);

    setInvio(false);

    if (esito.ok) {
      toast.success("Ordine inviato");
    } else {
      toast.error(esito.errore);
    }
  };

  return (
    <button type="button" className={styles.avanza} onClick={handleClick} disabled={invio}>
      {invio ? "Invio…" : "Invia Ordine"}
    </button>
  );
}

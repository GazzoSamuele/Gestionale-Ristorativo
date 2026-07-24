'use client'

import { toast } from "sonner";
import { siediPrenotazione } from "../actions";
import styles from "./PulsanteSiedi.module.scss";

export default function PulsanteSiedi({ prenotazioneId }: { prenotazioneId: string }) {
  const handleClick = async () => {
    const esito = await siediPrenotazione(prenotazioneId);

    if (esito.ok) {
      toast.success("Cliente seduto");
    } else {
      toast.error(esito.errore);
    }
  };

  return (
    <button type="button" className={styles.bottone} onClick={handleClick}>
      Arrivato → siedi
    </button>
  );
}
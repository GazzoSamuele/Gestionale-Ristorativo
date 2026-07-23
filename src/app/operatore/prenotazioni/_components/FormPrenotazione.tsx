'use client'

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { prenotazioneSchema, type PrenotazioneForm, type PrenotazioneInput } from "../schema";
import { creaPrenotazione } from "../actions";
import type { Tavolo } from "@/generated/prisma/client";
import styles from "./FormPrenotazione.module.scss";

export default function FormPrenotazione({ tavoli }: { tavoli: Tavolo[] }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PrenotazioneForm, unknown, PrenotazioneInput>({
        resolver: zodResolver(prenotazioneSchema)
    });

  const onSubmit = async (dati: PrenotazioneInput) => {
    const esito = await creaPrenotazione(dati);

    if (esito.ok) {
      toast.success("Prenotazione creata");
      reset();
    } else {
      toast.error(esito.errore);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <label className={styles.campo}>
        <span className={styles.etichetta}>Nome</span>
        <input className={styles.input} type="text" {...register("nome")} />
        {errors.nome && <span className={styles.errore}>{errors.nome.message}</span>}
      </label>

      <label className={styles.campo}>
        <span className={styles.etichetta}>Telefono</span>
        <input className={styles.input} type="tel" {...register("telefono")} />
      </label>

      <div className={styles.riga}>
        <label className={styles.campo}>
          <span className={styles.etichetta}>Tavolo</span>
          <select className={styles.input} {...register("tavoloId")}>
            <option value="">Nessun tavolo</option>
            {tavoli.map((tavolo) => (
              <option key={tavolo.id} value={tavolo.id}>
                Tavolo {tavolo.numero}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.campo}>
          <span className={styles.etichetta}>Coperti</span>
          <input className={styles.input} type="number" min={1} {...register("copertiPrenotati")} />
          {errors.copertiPrenotati && (
            <span className={styles.errore}>{errors.copertiPrenotati.message}</span>
          )}
        </label>
      </div>

      <label className={styles.campo}>
        <span className={styles.etichetta}>Data e ora</span>
        <input className={styles.input} type="datetime-local" {...register("dataOra")} />
        {errors.dataOra && <span className={styles.errore}>{errors.dataOra.message}</span>}
      </label>

      <label className={styles.campo}>
        <span className={styles.etichetta}>Note</span>
        <textarea className={styles.textarea} {...register("note")} />
      </label>

      <button className={styles.bottone} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvataggio…" : "Crea prenotazione"}
      </button>
    </form>
  );
}
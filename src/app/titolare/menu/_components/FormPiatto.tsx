'use client'

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PiattoForm, PiattoInput, piattoSchema } from "../schema";
import { creaPiatto } from "../actions";
import styles from "./FormPrenotazione.module.scss";

export default function FormPiatto({ categorie }: { categorie: { id: string; nome: string }[] }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<PiattoForm, unknown, PiattoInput>({
        resolver: zodResolver(piattoSchema)
    });

    const onSubmit = async (dati: PiattoInput) => {
        const esito = await creaPiatto(dati);

        if (esito.ok) {
            toast.success("Piatto creato");
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
        <span className={styles.etichetta}>Prezzo</span>
        <input className={styles.input} type="number" {...register("prezzo")} />
        {errors.prezzo && <span className={styles.errore}>{errors.prezzo.message}</span>}
      </label>

      <div className={styles.riga}>
        <label className={styles.campo}>
          <span className={styles.etichetta}>Seleziona una categoria</span>
          <select className={styles.input} {...register("categoriaId")}>
            {categorie.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                Categoria {categoria.nome}
              </option>
            ))}
          </select>
        </label>

      </div>

      <button className={styles.bottone} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvataggio…" : "Crea piatto"}
      </button>
    </form>
  );
}
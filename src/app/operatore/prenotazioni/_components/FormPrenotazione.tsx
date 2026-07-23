'use client'

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { prenotazioneSchema, type PrenotazioneForm, type PrenotazioneInput } from "../schema";
import { creaPrenotazione } from "../actions";

export default function FormPrenotazione() {
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>
        Nome
        <input type="text" {...register("nome")} />
      </label>
      {errors.nome && <span>{errors.nome.message}</span>}

      <label>
        Telefono
        <input type="tel" {...register("telefono")} />
      </label>

      <label>
        Coperti
        <input type="number" min={1} {...register("copertiPrenotati")} />
      </label>
      {errors.copertiPrenotati && <span>{errors.copertiPrenotati.message}</span>}

      <label>
        Data e ora
        <input type="datetime-local" {...register("dataOra")} />
      </label>
      {errors.dataOra && <span>{errors.dataOra.message}</span>}

      <label>
        Note
        <textarea {...register("note")} />
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvataggio…" : "Crea prenotazione"}
      </button>
    </form>
  );
}
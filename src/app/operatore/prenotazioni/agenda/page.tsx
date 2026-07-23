import { format } from "date-fns";
import { it } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import FormPrenotazione from "../_components/FormPrenotazione";

export default async function AgendaPage() {
  const tavoli = await prisma.tavolo.findMany({ orderBy: { numero: "asc" } });
  const prenotazioni = await prisma.prenotazione.findMany({ orderBy: { dataOra: "asc" } });

  return (
    <section>
      <h1>Agenda delle prenotazioni</h1>

      <FormPrenotazione tavoli={tavoli} />

      <ul>
        {prenotazioni.map((prenotazione) => (
          <li key={prenotazione.id}>
            {format(prenotazione.dataOra, "d MMMM · HH:mm", { locale: it })}
            {" — "}
            {prenotazione.nome} · {prenotazione.copertiPrenotati} coperti
          </li>
        ))}
      </ul>

      {prenotazioni.length === 0 && <p>Nessuna prenotazione registrata</p>}
    </section>
  );
}
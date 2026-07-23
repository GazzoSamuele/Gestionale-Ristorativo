import FormPrenotazione from "../_components/FormPrenotazione"
import { prisma } from "@/lib/prisma";
import styles from "./page.module.scss";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export default async function AgendaPage() {
  const prenotazioni = await prisma.prenotazione.findMany({
    orderBy: { dataOra: "asc" },
  });

 return (
    <section>
      <h1>Agenda delle prenotazioni</h1>
      <FormPrenotazione/>
      <ul>
         {prenotazioni.map((prenotazione) => (
          <li key={prenotazione.id}>
            {format(prenotazione.dataOra, "d MMMM · HH:mm", { locale: it })}
            {" - "}
            {prenotazione.nome} . {prenotazione.copertiPrenotati} coperti
          </li>      
        ))}
      </ul>
     
      {prenotazioni.length === 0 && <p>Nessuna prenotazione registrata</p>}
    </section>
  );
}






import { format } from "date-fns";
import { it } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import PulsanteSiedi from "../_components/PulsanteSiedi";

export default async function ArriviPage() {

  const oggi = new Date();
  const inizio = startOfDay(oggi);
  const fine = endOfDay(oggi);

  const prenotazioni = await prisma.prenotazione.findMany({
    where: {
      dataOra: { gte: inizio, lte: fine },
      stato: "IN_ATTESA"
    },
    orderBy: { dataOra: "asc" },
    include: {
      tavolo: true
    }
  });

  return (
    <section>
      <ul>
        {prenotazioni.map((prenotazione) => (
          <li key={prenotazione.id}>
            {format(prenotazione.dataOra, "HH:mm", { locale: it })}
              <strong>{prenotazione.nome}</strong>
              <p>{prenotazione.copertiPrenotati} coperti</p>
              <PulsanteSiedi prenotazioneId={prenotazione.id} />
          </li>
          ))}
      </ul>

      {prenotazioni.length === 0 && <p>Nessun arrivo previsto per oggi</p>}

    </section>
  );
}

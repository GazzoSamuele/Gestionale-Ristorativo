import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, format } from "date-fns";
import { it } from "date-fns/locale";
import TempoTrascorso from "../tavoli/TempoTrascorso";

export default async function StatoTavoliPage() {
  const oggi = new Date();
  const inizio = startOfDay(oggi);
  const fine = endOfDay(oggi);

  const tavoli = await prisma.tavolo.findMany({
    orderBy: { numero: "asc" },
    include: {
      occupazioni: {
        where: { terminataAlle: null },
        take: 1,
        include: { prenotazione: true }
      },
      prenotazioni: {
        where: {
          dataOra: { gte: inizio, lte: fine },
          stato: "IN_ATTESA"
        },
        orderBy: { dataOra: "asc" },
        take: 1
      }
    }
  });

  const schede = tavoli.map((tavolo) => {
    const occupazione = tavolo.occupazioni[0];
    const prenotazione = tavolo.prenotazioni[0];

    const stato = occupazione ? "occupato" : prenotazione ? "prenotato" : "libero";

    return { tavolo, occupazione, prenotazione, stato };
  });

  const liberi = schede.filter((s) => s.stato === "libero").length;
  const occupati = schede.filter((s) => s.stato === "occupato").length;
  const prenotati = schede.filter((s) => s.stato === "prenotato").length;

  return (
    <section>
      <header>
        <h1>Stato tavoli</h1>
        <p>
          Totali {schede.length} · Liberi {liberi} · Occupati {occupati} · Prenotati {prenotati}
        </p>
      </header>

      <div>
        {schede.map(({ tavolo, occupazione, prenotazione, stato }) => (
          <article key={tavolo.id}>
            <h2>T{tavolo.numero}</h2>
            <span>{stato}</span>

            {stato === "occupato" && occupazione && (
              <>
                <p>
                  {occupazione.prenotazione
                    ? `${occupazione.prenotazione.nome} · ${format(occupazione.prenotazione.dataOra, "HH:mm", { locale: it })}`
                    : "Walk-in"}
                </p>
                <p>
                  {occupazione.copertiPresenti}/{tavolo.capienza} coperti
                </p>
                <TempoTrascorso da={occupazione.iniziataAlle} />
              </>
            )}

            {stato === "prenotato" && prenotazione && (
              <>
                <p>
                  {prenotazione.nome} · {format(prenotazione.dataOra, "HH:mm", { locale: it })}
                </p>
                <p>atteso · {prenotazione.copertiPrenotati} coperti</p>
              </>
            )}

            {stato === "libero" && <p>{tavolo.capienza} coperti · tocca per sedere</p>}
          </article>
        ))}
      </div>

      {schede.length === 0 && <p>Nessun tavolo in questa sala.</p>}
    </section>
  );
}
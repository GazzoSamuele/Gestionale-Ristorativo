import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, format } from "date-fns";
import { it } from "date-fns/locale";
import clsx from "clsx";
import TempoTrascorso from "../tavoli/TempoTrascorso";
import styles from "./page.module.scss";

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
    <section className={styles.pagina}>
      <header className={styles.intestazione}>
        <h1 className={styles.titolo}>Stato tavoli</h1>
        <div className={styles.contatori}>
          <span className={styles.contatore}>Totali {schede.length}</span>
          <span className={styles.contatore}>Liberi {liberi}</span>
          <span className={styles.contatore}>Occupati {occupati}</span>
          <span className={styles.contatore}>Prenotati {prenotati}</span>
        </div>
      </header>

      <div className={styles.griglia}>
        {schede.map(({ tavolo, occupazione, prenotazione, stato }) => (
          <article key={tavolo.id} className={clsx(styles.scheda, styles[stato])}>
            <div className={styles.riga}>
              <h2 className={styles.numero}>T{tavolo.numero}</h2>
              <span
                className={clsx(
                  styles.stato,
                  stato === "occupato" && styles.statoOccupato,
                  stato === "prenotato" && styles.statoPrenotato,
                  stato === "libero" && styles.statoLibero
                )}
              >
                {stato}
              </span>
            </div>

            {stato === "occupato" && occupazione && (
              <>
                <p className={styles.dettaglio}>
                  {occupazione.prenotazione
                    ? `${occupazione.prenotazione.nome} · ${format(occupazione.prenotazione.dataOra, "HH:mm", { locale: it })}`
                    : "Walk-in"}
                </p>
                <div className={styles.riga}>
                  <p className={styles.dettaglio}>
                    {occupazione.copertiPresenti}/{tavolo.capienza} coperti
                  </p>
                  <TempoTrascorso da={occupazione.iniziataAlle} />
                </div>
              </>
            )}

            {stato === "prenotato" && prenotazione && (
              <>
                <p className={styles.dettaglio}>
                  {prenotazione.nome} · {format(prenotazione.dataOra, "HH:mm", { locale: it })}
                </p>
                <p className={styles.attesa}>
                  atteso · {prenotazione.copertiPrenotati} coperti
                </p>
              </>
            )}

            {stato === "libero" && (
              <p className={styles.vuotoTavolo}>
                {tavolo.capienza} coperti · tocca per sedere
              </p>
            )}
          </article>
        ))}
      </div>

      {schede.length === 0 && <p className={styles.vuoto}>Nessun tavolo in questa sala.</p>}
    </section>
  );
}
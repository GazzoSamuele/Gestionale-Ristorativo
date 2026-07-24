import { format } from "date-fns";
import { it } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import PulsanteSiedi from "../_components/PulsanteSiedi";
import styles from "./page.module.scss";

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
    <section className={styles.pagina}>
      <h1 className={styles.titolo}>Arrivi di stasera</h1>

      <ul className={styles.lista}>
        {prenotazioni.map((prenotazione) => (
          <li key={prenotazione.id} className={styles.arrivo}>
            <span className={styles.ora}>
              {format(prenotazione.dataOra, "HH:mm", { locale: it })}
            </span>
            <div className={styles.info}>
              <span className={styles.nome}>{prenotazione.nome}</span>
              <p className={styles.dettaglio}>
                {prenotazione.copertiPrenotati} coperti
                {prenotazione.tavolo ? ` · Tavolo ${prenotazione.tavolo.numero}` : " · da assegnare"}
              </p>
            </div>
            <PulsanteSiedi prenotazioneId={prenotazione.id} />
          </li>
        ))}
      </ul>

      {prenotazioni.length === 0 && (
        <p className={styles.vuoto}>Nessun arrivo previsto per oggi.</p>
      )}
    </section>
  );
}

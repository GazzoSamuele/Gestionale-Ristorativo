import { format } from "date-fns";
import { it } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import FormPrenotazione from "../_components/FormPrenotazione";
import styles from "./page.module.scss";

export default async function AgendaPage() {
  const tavoli = await prisma.tavolo.findMany({ orderBy: { numero: "asc" } });
  const prenotazioni = await prisma.prenotazione.findMany({ orderBy: { dataOra: "asc" } });

  return (
    <section className={styles.pagina}>
      <div className={styles.colonnaForm}>
        <h1 className={styles.titolo}>Nuova prenotazione</h1>
        <div className={styles.card}>
          <FormPrenotazione tavoli={tavoli} />
        </div>
      </div>

      <div className={styles.colonnaLista}>
        <h2 className={styles.sottotitolo}>Prenotazioni</h2>

        <ul className={styles.lista}>
          {prenotazioni.map((prenotazione) => (
            <li key={prenotazione.id} className={styles.prenotazione}>
              <span className={styles.quando}>
                {format(prenotazione.dataOra, "d MMM · HH:mm", { locale: it })}
              </span>
              <span className={styles.nome}>{prenotazione.nome}</span>
              <span className={styles.coperti}>{prenotazione.copertiPrenotati}p</span>
            </li>
          ))}
        </ul>

        {prenotazioni.length === 0 && (
          <p className={styles.vuoto}>Nessuna prenotazione registrata.</p>
        )}
      </div>
    </section>
  );
}

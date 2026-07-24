import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, format } from "date-fns";
import { it } from "date-fns/locale";
import clsx from "clsx";
import styles from "./page.module.scss";

export default async function PresenzeDipendenti() {
  const oggi = new Date();
  const inizio = startOfDay(oggi);
  const fine = endOfDay(oggi);

  const dipendenti = await prisma.utente.findMany({
    orderBy: { nome: "asc" },
    include: {
      presenze: {
        where: { arrivoAlle: { gte: inizio, lte: fine } }
      }
    }
  });

  const presenti = dipendenti.filter((d) => d.presenze.length > 0).length;

  return (
    <section className={styles.pagina}>
      <div className={styles.intestazione}>
        <h1 className={styles.titolo}>Presenze dipendenti</h1>
        <span className={styles.contatore}>
          {presenti} / {dipendenti.length} presenti oggi
        </span>
      </div>

      <div className={styles.card}>
        <table className={styles.tabella}>
          <thead>
            <tr>
              <th>Nome dipendente</th>
              <th>Presente oggi</th>
              <th>Ora d&apos;arrivo</th>
            </tr>
          </thead>
          <tbody>
            {dipendenti.map((utente) => {
              const presente = utente.presenze.length > 0;
              const arrivo = utente.presenze[0];

              return (
                <tr key={utente.id} className={clsx(!presente && styles.assente)}>
                  <td className={styles.nome}>{utente.nome}</td>
                  <td>
                    <span className={clsx(styles.badge, presente ? styles.si : styles.no)}>
                      {presente ? "Sì" : "No"}
                    </span>
                  </td>
                  <td className={styles.orario}>
                    {presente ? format(arrivo.arrivoAlle, "HH:mm", { locale: it }) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {dipendenti.length === 0 && <p className={styles.vuoto}>Nessun dipendente.</p>}
    </section>
  );
}

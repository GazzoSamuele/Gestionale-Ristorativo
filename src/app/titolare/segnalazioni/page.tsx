import { prisma } from "@/lib/prisma";
import styles from "./page.module.scss";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import clsx from "clsx";

export default async function SegnalazioniPage() {
  const segnalazioni = await prisma.segnalazione.findMany({
    orderBy: { creatoIl: "desc" },
    include: { utente: true }
  });

  return (
     <section className={styles.elenco}>
        <ul className={styles.dispSegnalazioni}>
          {segnalazioni.map((segnalazione) => (
            <li key={segnalazione.id} className={styles.segnalazione}>
                {format(segnalazione.creatoIl, "d MMM · HH:mm", { locale: it })}
              <p className={styles.nome}>{segnalazione.utente.nome}</p>
              <strong className={clsx(styles.nota, !segnalazione.letta && styles.nonLetta)}>{segnalazione.testo}</strong>
            </li>
          ))}
        </ul>

        {segnalazioni.length === 0 && (
          <p className={styles.vuoto}>Nessuna segnalazione.</p>
        )}
    </section>
  )
}
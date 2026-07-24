import { prisma } from "@/lib/prisma";
import TempoTrascorso from "../../sala/tavoli/TempoTrascorso";
import PulsanteAvanza from "../../ordini/_components/PulsanteAvanza";
import styles from "./CodaCucina.module.scss";

export default async function CodaCucina({ fonte }: { fonte: "SALA" | "ASPORTO" }) {
  const ordini = await prisma.ordine.findMany({
    where: { fonte, stato: { not: "PRONTI" } },
    orderBy: { creatoIl: "asc" },
    include: {
      righe: { include: { piatto: true } },
      occupazione: { include: { tavolo: true } }
    }
  });

  return (
    <section className={styles.coda}>
      {ordini.map((ordine) => (
        <article key={ordine.id} className={styles.ticket}>
          <div className={styles.testata}>
            <strong className={styles.cliente}>
              {ordine.occupazione
                ? `Tavolo ${ordine.occupazione.tavolo.numero}`
                : ordine.nomeCliente}
            </strong>
            <TempoTrascorso da={ordine.statoDalle} />
          </div>

          <ul className={styles.righe}>
            {ordine.righe.map((riga) => (
              <li key={riga.id} className={styles.riga}>
                <span className={styles.quantita}>{riga.quantita}×</span>
                <span className={styles.piatto}>{riga.piatto.nome}</span>
              </li>
            ))}
          </ul>

          <PulsanteAvanza ordineId={ordine.id} />
        </article>
      ))}

      {ordini.length === 0 && <p className={styles.vuoto}>Nessun ordine in coda.</p>}
    </section>
  );
}

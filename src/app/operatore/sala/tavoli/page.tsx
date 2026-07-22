import { prisma } from "@/lib/prisma";
import styles from "./page.module.scss";

export default async function TavoliPage() {
  const tavoli = await prisma.tavolo.findMany({
    orderBy: { numero: "asc" }
  });

  return (
    <section className={styles.sala}>
      {tavoli.map((tavolo) => (
        <div
          key={tavolo.id}
          className={`${styles.tavoloCard} ${styles.tavoloLibero}`}
          style={{ left: `${tavolo.posX}%`, top: `${tavolo.posY}%` }}
        >
          <h2>Tavolo {tavolo.numero}</h2>

          <div className={styles.tavoloInfo}>
            <p>{tavolo.capienza} posti</p>
          </div>
        </div>
      ))}

      {tavoli.length === 0 && <p>Nessun tavolo in questa sala.</p>}
    </section>
  );
}

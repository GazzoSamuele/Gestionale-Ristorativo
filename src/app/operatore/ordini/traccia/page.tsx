import { prisma } from "@/lib/prisma";
import clsx from "clsx";
import TempoTrascorso from "@/app/operatore/sala/tavoli/TempoTrascorso";
import PulsanteAvanza from "../_components/PulsanteAvanza";
import styles from "./page.module.scss";

const colonne =  [ 
    { stato: "NUOVI_ARRIVATI", etichetta: "Nuovi arrivati" },
    { stato: "IN_CORSO", etichetta: "In Corso" },
    { stato: "PRONTI", etichetta: "Pronti" }
  ] as const;

export default async function Traccia() {
  const ordini = await prisma.ordine.findMany({
    orderBy: { creatoIl: "asc"},
    include: {
      righe: true,
      occupazione: {
        include: {
          tavolo: true
        }
      }
    }
  });

  return (
    <section className={styles.pagina}>
      <h1 className={styles.titolo}>Gestione ordini</h1>

      <div className={styles.colonne}>
        {colonne.map((colonna) => {
          const ordiniColonna = ordini.filter((ordine) => ordine.stato === colonna.stato);

          return (
            <div key={colonna.stato} className={styles.colonna}>
              <h2 className={clsx(styles.testata, styles[colonna.stato])}>
                {colonna.etichetta}
              </h2>

              <ul className={styles.lista}>
                {ordiniColonna.map((ordine) => (
                  <li key={ordine.id} className={styles.ordine}>
                    <strong className={styles.cliente}>
                      {ordine.occupazione
                        ? `Tavolo ${ordine.occupazione.tavolo.numero}`
                        : ordine.nomeCliente}
                    </strong>
                    <p className={styles.meta}>
                      #{ordine.numero} · {ordine.fonte} · {ordine.righe.length} piatti
                    </p>
                    <TempoTrascorso da={ordine.statoDalle} />

                    <PulsanteAvanza ordineId={ordine.id} />
                  </li>
                ))}
              </ul>

              {ordiniColonna.length === 0 && <p className={styles.vuoto}>Nessun ordine</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

import Link from "next/link";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.schermata}>
      <div className={styles.contenitore}>
        <header className={styles.intestazione}>
          <h1 className={styles.titolo}>Gestionale Ristorativo</h1>
          <p className={styles.sottotitolo}>Scegli l&apos;area con cui lavorare</p>
        </header>

        <div className={styles.scelte}>
          <Link href="/operatore/sala/tavoli" className={`${styles.scheda} ${styles.operatore}`}>
            <span className={styles.etichetta}>In sala</span>
            <h2 className={styles.nomeArea}>Operatore</h2>
            <p className={styles.descrizione}>Tavoli, ordini, prenotazioni e cucina.</p>
            <span className={styles.freccia}>→</span>
          </Link>

          <Link href="/titolare" className={`${styles.scheda} ${styles.titolare}`}>
            <span className={styles.etichetta}>Gestione</span>
            <h2 className={styles.nomeArea}>Titolare</h2>
            <p className={styles.descrizione}>Analytics, menu, segnalazioni e zone di lavoro.</p>
            <span className={styles.freccia}>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

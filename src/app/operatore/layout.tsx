import NavPrincipale from "./_components/NavPrincipale";
import SottoSchede from "./_components/SottoSchedeNavbar";
import styles from "./style-layout.module.scss";

/* Tutta l'area operatore legge dati vivi (tavoli, ordini, magazzino).
   Senza questa riga Next le prerenderizza al build e in produzione
   mostrerebbero la situazione del giorno del deploy, non quella di adesso.
   Vale per questo layout e per ogni pagina sotto /operatore. */
export const dynamic = "force-dynamic";

export default function OperatoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.area}>
      <span className={styles.badgeRuolo}>ADMIN</span>

      <main className={styles.contenuto}>{children}</main>

      <SottoSchede />
      <NavPrincipale />

    </div>
  );
}

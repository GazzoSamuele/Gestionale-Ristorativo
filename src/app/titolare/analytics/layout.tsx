import SchedeAnalytics from "./_components/SchedeAnalytics";
import styles from "./layout.module.scss";

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className={styles.pagina}>
      <header className={styles.intestazione}>
        <h1 className={styles.titolo}>Analytics</h1>
        <span className={styles.periodo}>Ultimi 7 giorni</span>
      </header>

      <SchedeAnalytics />

      {children}
    </section>
  );
}

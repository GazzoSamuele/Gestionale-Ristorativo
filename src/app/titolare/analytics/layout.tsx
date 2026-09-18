import SchedeAnalytics from "./_components/SchedeAnalytics";
import SceltaPeriodo from "./_components/SceltaPeriodo";
import styles from "./layout.module.scss";

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className={styles.pagina}>
      <header className={styles.intestazione}>
        <h1 className={styles.titolo}>Analytics</h1>
        <SceltaPeriodo />
      </header>

      <SchedeAnalytics />

      {children}
    </section>
  );
}

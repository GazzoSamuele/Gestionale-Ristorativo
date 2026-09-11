import NavPrincipale from "./_components/NavPrincipale";
import styles from "./style-layout.module.scss";

export const dynamic = "force-dynamic";

export default function TitolareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.area}>
      <span className={styles.badgeRuolo}>SUPER ADMIN</span>

      <main className={styles.contenuto}>{children}</main>

      <NavPrincipale />

    </div>
  );
}

import NavPrincipale from "./_components/NavPrincipale";
import SottoSchede from "./_components/SottoSchedeNavbar";
import styles from "./style-layout.module.scss";

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
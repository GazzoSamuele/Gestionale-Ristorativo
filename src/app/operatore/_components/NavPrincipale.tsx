'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../style-layout.module.scss";
import { voci } from "./navigazione";

export default function NavPrincipale() {
  const pathname = usePathname();

  return (
    <nav className={styles.navPrincipale}>
      {voci.map((voce) => {
        const attiva =
          voce.sezione === "/operatore"
            ? pathname === "/operatore"
            : pathname.startsWith(voce.sezione);

        return (
          <Link
            key={voce.href}
            href={voce.href}
            className={`${styles.voce} ${attiva ? styles.voceAttiva : ""}`}
          >
            {voce.etichetta}
          </Link>
        );
      })}
    </nav>
  );
}
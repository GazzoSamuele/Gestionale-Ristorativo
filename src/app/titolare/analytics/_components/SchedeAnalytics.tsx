'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import styles from "../layout.module.scss";

const schede = [
  { href: "/titolare/analytics/venduto", etichetta: "Venduto" },
  { href: "/titolare/analytics/turnover", etichetta: "Turnover" }
];

export default function SchedeAnalytics() {
  const pathname = usePathname();

  return (
    <nav className={styles.schede}>
      {schede.map((scheda) => (
        <Link
          key={scheda.href}
          href={scheda.href}
          className={clsx(styles.scheda, pathname === scheda.href && styles.schedaAttiva)}
        >
          {scheda.etichetta}
        </Link>
      ))}
    </nav>
  );
}

'use client'

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { periodi, leggiPeriodo } from "../periodo";
import styles from "../layout.module.scss";

export default function SceltaPeriodo() {
  const pathname = usePathname();
  const giorniAttivi = leggiPeriodo(useSearchParams().get("periodo"));

  return (
    <div className={styles.periodi} role="group" aria-label="Periodo">
      {periodi.map((periodo) => (
        <Link
          key={periodo.giorni}
          href={`${pathname}?periodo=${periodo.giorni}`}
          aria-current={periodo.giorni === giorniAttivi ? "true" : undefined}
          className={clsx(styles.periodo, periodo.giorni === giorniAttivi && styles.periodoAttivo)}
        >
          {periodo.etichetta}
        </Link>
      ))}
    </div>
  );
}

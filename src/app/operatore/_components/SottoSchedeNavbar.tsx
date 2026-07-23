'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { voci } from "./navigazione";
import styles from "../style-layout.module.scss";

export default function SottoSchede() {
  const pathname = usePathname();

  const sezioneAttiva = voci.find(
    (v) => v.sezione !== "/operatore" && pathname.startsWith(v.sezione)
  );

  if (!sezioneAttiva?.sottoSchede) return null;

  return (
    <nav className={styles.navSottoschede}>
      {sezioneAttiva.sottoSchede.map((scheda) => {
        const attiva = pathname === scheda.href;
        return (
          <Link
            key={scheda.href}
            href={scheda.href}
            className={clsx(styles.sottoscheda, attiva && styles.sottoschedaAttiva)}
          >
            {scheda.etichetta}
          </Link>
        );
      })}
    </nav>
  );
}
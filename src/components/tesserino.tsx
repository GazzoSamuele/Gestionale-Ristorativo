"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { authClient } from "@/lib/auth-client";
import styles from "./Tesserino.module.scss";

const coloreRuolo: Record<string, string> = {
  OPERATORE: styles.operatore,
  ADMIN: styles.admin,
  SUPER_ADMIN: styles.superAdmin
};

export default function Tesserino({nome,ruolo}: {
  nome: string | null;
  ruolo: string | null;
}) {
  const router = useRouter();
  const [aperto, setAperto] = useState(false);
  const [uscita, setUscita] = useState(false);

    if(!nome) {
        return <span className={clsx(styles.tesserino, styles.locale)}>Locale</span>;
    }

    const esci = async () => {
        setUscita(true);
        await authClient.signOut();
        router.refresh();
    };

    return (
        <div className={styles.tesserino}>
        <button
            type="button"
            className={clsx(styles.chip, ruolo && coloreRuolo[ruolo])}
            onClick={() => setAperto(!aperto)}
        >
            <span className={styles.nome}>{nome}</span>
            <span className={styles.ruolo}>{ruolo?.replace("_", " ")}</span>
            <span className={styles.freccia}>{aperto ? "▲" : "▼"}</span>
        </button>

        {aperto && (
            <div className={styles.menu}>
            <button type="button" className={styles.esci} onClick={esci} disabled={uscita}>
            {uscita ? "Uscita…" : "Esci"}
            </button>
            </div>
        )}
        </div>
  );
}

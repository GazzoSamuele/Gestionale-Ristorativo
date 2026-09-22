"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import styles from "./page.module.scss";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [invio, setInvio] = useState(false);

    const handleSubmit = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        setInvio(true);

        const esito = await authClient.signIn.email({ email, password });

        setInvio(false);

        if(esito.error) {
            toast.error("Credenziali non valide");
            return;
        }

        router.push("/");
  };

    return (
        <section className={styles.schermata}>
            <div className={styles.scheda}>
                <header className={styles.intestazione}>
                    <h1 className={styles.titolo}>Gestionale Ristorativo</h1>
                    <p className={styles.sottotitolo}>Accedi per iniziare il turno</p>
                </header>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.campo}>
                        <label className={styles.etichetta} htmlFor="email">Email</label>
                        <input
                            className={styles.input}
                            id="email"
                            type="email"
                            autoComplete="username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.campo}>
                        <label className={styles.etichetta} htmlFor="password">Password</label>
                        <input
                            className={styles.input}
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className={styles.bottone} type="submit" disabled={invio}>
                        {invio ? "Accesso…" : "Entra"}
                    </button>
                </form>
            </div>
        </section>
  );
}
'use client'

import { useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { creaOrdine } from "../actions";
import styles from "./CompositoreOrdine.module.scss";

type Piatto = { id: string; nome: string; prezzo: string };
type Categoria = { id: string; nome: string; piatti: Piatto[] };
type RigaCarrello = Piatto & { quantita: number };

export default function CompositoreOrdine({ categorie }: { categorie: Categoria[] }) {
  const [filtro, setFiltro] = useState<string | null>(null);
  const [carrello, setCarrello] = useState<RigaCarrello[]>([]);
  const [nomeCliente, setNomeCliente] = useState("");
  const [invio, setInvio] = useState(false);

  const categorieMostrate = filtro
    ? categorie.filter((categoria) => categoria.id === filtro)
    : categorie;

  const aggiungi = (piatto: Piatto) => {
    setCarrello((attuale) => {
      const gia = attuale.find((riga) => riga.id === piatto.id);

      if (gia) {
        return attuale.map((riga) =>
          riga.id === piatto.id ? { ...riga, quantita: riga.quantita + 1 } : riga
        );
      }

      return [...attuale, { ...piatto, quantita: 1 }];
    });
  };

  const rimuovi = (piattoId: string) => {
    setCarrello((attuale) => attuale.filter((riga) => riga.id !== piattoId));
  };

  const totale = carrello.reduce(
    (somma, riga) => somma + Number(riga.prezzo) * riga.quantita,
    0
  );

  const mandaInCucina = async () => {
    setInvio(true);

    const esito = await creaOrdine({
      fonte: "ASPORTO",
      nomeCliente,
      righe: carrello.map((riga) => ({ piattoId: riga.id, quantita: riga.quantita }))
    });

    setInvio(false);

    if (esito.ok) {
      toast.success("Ordine mandato in cucina");
      setCarrello([]);
      setNomeCliente("");
    } else {
      toast.error(esito.errore);
    }
  };

  return (
    <section className={styles.pagina}>
      <div className={styles.principale}>
        <header className={styles.intestazione}>
          <h1 className={styles.titolo}>Crea ordine</h1>
          <div className={styles.filtri}>
            <button
              type="button"
              className={clsx(styles.filtro, filtro === null && styles.filtroAttivo)}
              onClick={() => setFiltro(null)}
            >
              Tutti
            </button>
            {categorie.map((categoria) => (
              <button
                key={categoria.id}
                type="button"
                className={clsx(styles.filtro, filtro === categoria.id && styles.filtroAttivo)}
                onClick={() => setFiltro(categoria.id)}
              >
                {categoria.nome}
              </button>
            ))}
          </div>
        </header>

        {categorieMostrate.map((categoria) => (
          <div key={categoria.id} className={styles.categoria}>
            <h2 className={styles.titoloCategoria}>{categoria.nome}</h2>
            <div className={styles.piatti}>
              {categoria.piatti.map((piatto) => (
                <article key={piatto.id} className={styles.piatto}>
                  <h3 className={styles.nomePiatto}>{piatto.nome}</h3>
                  <p className={styles.prezzo}>€ {piatto.prezzo}</p>
                  <button
                    type="button"
                    className={styles.aggiungi}
                    onClick={() => aggiungi(piatto)}
                  >
                    Aggiungi
                  </button>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>

      <aside className={styles.carrello}>
        <h2 className={styles.titoloCarrello}>Asporto</h2>

        <input
          type="text"
          className={styles.campoNome}
          placeholder="Nome cliente"
          value={nomeCliente}
          onChange={(e) => setNomeCliente(e.target.value)}
        />

        <ul className={styles.righe}>
          {carrello.map((riga) => (
            <li key={riga.id} className={styles.riga}>
              <span className={styles.dettaglioRiga}>
                <span className={styles.nomeRiga}>{riga.nome}</span>
                <span className={styles.prezzoRiga}>
                  € {riga.prezzo} · {riga.quantita}×
                </span>
              </span>
              <button
                type="button"
                className={styles.rimuovi}
                onClick={() => rimuovi(riga.id)}
              >
                rimuovi
              </button>
            </li>
          ))}
        </ul>

        {carrello.length === 0 && (
          <p className={styles.vuoto}>Nessun piatto selezionato.</p>
        )}

        <p className={styles.totale}>
          <span>Totale</span>
          <span>€ {totale.toFixed(2)}</span>
        </p>

        <button
          type="button"
          className={styles.invia}
          onClick={mandaInCucina}
          disabled={invio || carrello.length === 0 || !nomeCliente.trim()}
        >
          {invio ? "Invio…" : "Manda in cucina"}
        </button>
      </aside>
    </section>
  );
}
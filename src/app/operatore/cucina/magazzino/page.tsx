import { prisma } from "@/lib/prisma";
import clsx from "clsx";
import styles from "./page.module.scss";

export default async function Magazzino() {
  const prodotti = await prisma.prodotto.findMany();

  const ordinati = prodotti.sort(
    (a, b) =>
      Number(a.quantita) / Number(a.limiteMinimo) -
      Number(b.quantita) / Number(b.limiteMinimo)
  );

  return (
    <section className={styles.pagina}>
      <h1 className={styles.titolo}>Magazzino</h1>

      <ul className={styles.lista}>
        {ordinati.map((prodotto) => {
          const inEsaurimento = Number(prodotto.quantita) < Number(prodotto.limiteMinimo);

          return (
            <li
              key={prodotto.id}
              className={clsx(styles.prodotto, inEsaurimento && styles.esaurimento)}
            >
              <span className={styles.nome}>{prodotto.nome}</span>
              <span className={clsx(styles.quantita, inEsaurimento && styles.quantitaAllarme)}>
                {prodotto.quantita.toString()} / min {prodotto.limiteMinimo.toString()} {prodotto.unita}
              </span>
              <span className={styles.fornitore}>{prodotto.fornitore}</span>
              {inEsaurimento && <span className={styles.badge}>In esaurimento</span>}
            </li>
          );
        })}
      </ul>

      {prodotti.length === 0 && <p className={styles.vuoto}>Nessun prodotto in magazzino.</p>}
    </section>
  );
}

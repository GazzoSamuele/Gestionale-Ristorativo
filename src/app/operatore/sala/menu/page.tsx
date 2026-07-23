import { prisma } from "@/lib/prisma";
import styles from "./page.module.scss";

export default async function Menu() {
  const categorie = await prisma.categoria.findMany({
    orderBy: { ordine: "asc" },
    include: {
      piatti: {
        where: { disponibile: true },
        orderBy: { nome: "asc" }
      }
    }
  });

  return (
    <section className={styles.pagina}>
      <div className={styles.card}>
        <header className={styles.intestazione}>
          <h1 className={styles.titolo}>Menu</h1>
          <span className={styles.badge}>Sola lettura · consultazione</span>
        </header>

        <div className={styles.categorie}>
          {categorie.map((categoria) => (
            <div key={categoria.id} className={styles.categoria}>
              <h2 className={styles.titoloCategoria}>{categoria.nome}</h2>
              <ul className={styles.piatti}>
                {categoria.piatti.map((piatto) => (
                  <li key={piatto.id} className={styles.riga}>
                    <span className={styles.nome}>{piatto.nome}</span>
                    <span className={styles.prezzo}>€ {piatto.prezzo.toString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {categorie.length === 0 && (
          <p className={styles.vuoto}>Nessun piatto nel menu.</p>
        )}
      </div>
    </section>
  );
}

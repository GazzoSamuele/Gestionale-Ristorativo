import { prisma } from "@/lib/prisma";
import clsx from "clsx";
import styles from "./page.module.scss";
import PulsanteToggle from "./_components/PulsanteToggle";
import FormPiatto from "./_components/FormPiatto";

export default async function Menu() {
  const categorie = await prisma.categoria.findMany({
    orderBy: { ordine: "asc" },
    include: {
      piatti: {
        orderBy: { nome: "asc" }
      }
    }
  });
  
  const categorieForm = categorie.map((categoria) => ({
    id: categoria.id,
    nome: categoria.nome
  }));

  return (
    <section className={styles.pagina}>
      <div className={styles.card}>
        <header className={styles.intestazione}>
          <h1 className={styles.titolo}>Menu</h1>
          <span className={styles.badge}>Gestione menu</span>
        </header>

        <FormPiatto categorie={categorieForm} />

        <div className={styles.categorie}>
          {categorie.map((categoria) => (
            <div key={categoria.id} className={styles.categoria}>
              <h2 className={styles.titoloCategoria}>{categoria.nome}</h2>
              <ul className={styles.piatti}>
                {categoria.piatti.map((piatto) => (
                  <li key={piatto.id} className={clsx(styles.riga, !piatto.disponibile && styles.disattivato)}>
                    <span className={styles.nome}>{piatto.nome}</span>
                    <span className={styles.prezzo}>€ {piatto.prezzo.toString()}</span>

                    <PulsanteToggle className={styles.bottone} piattoId={piatto.id} disponibile={piatto.disponibile} />
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

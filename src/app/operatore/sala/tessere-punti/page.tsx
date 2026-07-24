import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import clsx from "clsx";
import styles from "./page.module.scss";

export default async function TesserePunti({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const clienti = await prisma.cliente.findMany({
    where: q ? { nome: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { visite: "desc" }
  });

  const cliente = clienti[0];

  const premi = await prisma.premio.findMany({
    orderBy: { puntiRichiesti: "asc" }
  });

  const prossimo = cliente
    ? premi.find((premio) => premio.puntiRichiesti > cliente.punti)
    : undefined;

  const progresso =
    cliente && prossimo ? Math.min(100, (cliente.punti / prossimo.puntiRichiesti) * 100) : 100;

  return (
    <section className={styles.pagina}>
      <div className={styles.schedaCliente}>
        <form className={styles.ricerca}>
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Cerca cliente…"
            className={styles.campoRicerca}
          />
        </form>

        {cliente ? (
          <>
            <h1 className={styles.nome}>{cliente.nome}</h1>
            <p className={styles.sottotitolo}>
              Cliente dal {format(cliente.primaVisita, "dd/MM/yyyy", { locale: it })} ·{" "}
              {cliente.visite} visite
            </p>

            <p className={styles.punti}>
              {cliente.punti}
              <span className={styles.puntiLabel}> punti totali</span>
            </p>

            <div className={styles.barra}>
              <div className={styles.barraPiena} style={{ width: `${progresso}%` }} />
            </div>

            <p className={styles.mancano}>
              {prossimo
                ? `${prossimo.puntiRichiesti - cliente.punti} punti al prossimo premio (${prossimo.puntiRichiesti})`
                : "Ha raggiunto tutti i premi disponibili"}
            </p>

            <div className={styles.azione}>
              <span className={styles.azioneTitolo}>+ Assegna punti a questa visita</span>
              <span className={styles.azioneNota}>
                Al momento del pagamento i punti vengono aggiunti in automatico in base alla spesa
              </span>
            </div>
          </>
        ) : (
          <p className={styles.vuoto}>
            {q ? `Nessun cliente trovato per “${q}”.` : "Nessun cliente registrato."}
          </p>
        )}
      </div>

      <div className={styles.catalogo}>
        <h2 className={styles.catalogoTitolo}>Premi &amp; sconti (consultazione)</h2>

        <ul className={styles.premi}>
          {premi.map((premio) => {
            const raggiunto = cliente ? cliente.punti >= premio.puntiRichiesti : false;

            return (
              <li key={premio.id} className={clsx(styles.premio, !raggiunto && styles.bloccato)}>
                <span className={styles.pallino} data-raggiunto={raggiunto} />
                <span className={styles.premioNome}>{premio.nome}</span>
                <span className={styles.premioPunti}>{premio.puntiRichiesti} pt</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

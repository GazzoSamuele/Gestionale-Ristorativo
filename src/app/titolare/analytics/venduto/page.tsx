import { prisma } from "@/lib/prisma";
import { isSameDay, startOfDay, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { format } from "date-fns";
import clsx from "clsx";
import GraficoBarre from "../_components/GraficoBarre";
import styles from "./page.module.scss";
import schede from "../schede.module.scss";
import { giorniFa, etichettaGiorno, leggiPeriodo } from "../periodo";
import { euro } from "../formato";

export default async function AnalyticsPage({
      searchParams
  }: {
    searchParams: Promise<{ periodo?: string }>;
  }) {
  const { periodo } = await searchParams;
  const giorni = leggiPeriodo(periodo);

  const inizio = startOfDay(subDays(new Date(), giorni - 1));
  const inizioSettimanaScorsa = startOfDay(subDays(new Date(), giorni * 2 - 1));
  const ordini = await prisma.ordine.findMany({
    where: {
      creatoIl: { gte: inizio },
    },
    include: { righe: true },
  });

  const ordiniConTotale = ordini.map((ordine) => ({
    creatoIl: ordine.creatoIl,
    totale: ordine.righe.reduce(
      (sommaRighe, riga) =>
        sommaRighe + Number(riga.prezzoUnitario) * riga.quantita,
      0,
    ),
  }));

  const confrontOrdini = await prisma.ordine.findMany({
    where: {
      creatoIl: { gte: inizioSettimanaScorsa, lt: inizio },
    },
    include: { righe: true },
  });

  const ordiniScorsiConTotale = confrontOrdini.map((ordine) => ({
    creatoIl: ordine.creatoIl,
    totale: ordine.righe.reduce(
      (sommaRighe, riga) =>
        sommaRighe + Number(riga.prezzoUnitario) * riga.quantita,
      0,
    ),
  }));

  const totaleScorso = ordiniScorsiConTotale.reduce(
    (somma, ordine) => somma + ordine.totale,
    0,
  );

  const totale = ordiniConTotale.reduce(
    (somma, ordine) => somma + ordine.totale,
    0,
  );

  const variazione =
    totaleScorso > 0
      ? Math.round(((totale - totaleScorso) / totaleScorso) * 100)
      : 0;

  const scontrinoMedio = ordini.length > 0 ? totale / ordini.length : 0;

  const perGiorno = giorniFa(giorni).map((n) => {
    const data = startOfDay(subDays(new Date(), n));
    const ordiniDelGiorno = ordiniConTotale.filter((ordine) =>
      isSameDay(ordine.creatoIl, data),
    );
    const totale = ordiniDelGiorno.reduce(
      (somma, ordine) => somma + ordine.totale,
      0,
    );

    return {
      giorno: etichettaGiorno(data, giorni),
      giornoEsteso: format(data, "EEEE d MMMM", { locale: it }),
      totale,
    };
  });

  const massimoTotale = Math.max(...perGiorno.map((voce) => voce.totale));
  const giornoMigliore = perGiorno.find(
    (voce) => voce.totale === massimoTotale,
  );

  const piatti = await prisma.piatto.findMany({
    include: {
      righe: {
        where: { ordine: { creatoIl: { gte: inizio } } },
      },
    },
  });

  const piattiRicavi = piatti.map((piatto) => ({
    nome: piatto.nome,
    ricavi: piatto.righe.reduce(
      (sommaRighe, riga) =>
        sommaRighe + Number(riga.prezzoUnitario) * riga.quantita,
      0,
    ),
  }));

  const topPiatti = [...piattiRicavi]
    .sort((a, b) => b.ricavi - a.ricavi)
    .slice(0, 4);
  const piattiVenduti = topPiatti.filter((piatto) => piatto.ricavi > 0);

  return (
    <>
      <div className={schede.kpi}>
        <article className={schede.kpiCard}>
          <h2 className={schede.kpiEtichetta}>Venduto</h2>
          <div className={schede.kpiRiga}>
            <p className={schede.kpiValore}>{euro(totale)}</p>
            <span
              className={clsx(
                styles.delta,
                variazione > 0 && styles.deltaSu,
                variazione < 0 && styles.deltaGiu,
              )}
            >
              {variazione > 0 ? "▲ +" : variazione < 0 ? "▼ " : ""}
              {variazione}% vs periodo precedente
            </span>
          </div>
          <p className={schede.kpiNota}>valore ordini · non incasso fiscale</p>
        </article>

        <article className={schede.kpiCard}>
          <h2 className={schede.kpiEtichetta}>Scontrino medio</h2>
          <p className={schede.kpiValore}>{euro(scontrinoMedio)}</p>
          <p className={schede.kpiNota}>
            per ordine · su {ordini.length} ordini
          </p>
        </article>

        <article className={schede.kpiCard}>
          <h2 className={schede.kpiEtichetta}>Giorno migliore</h2>
          <p className={clsx(schede.kpiValore, styles.giorno)}>
            {massimoTotale > 0 ? giornoMigliore?.giornoEsteso : "—"}
          </p>
          <p className={schede.kpiNota}>
            {massimoTotale > 0 ? euro(massimoTotale) : "nessuna vendita"}
          </p>
        </article>
      </div>

      <div className={schede.corpo}>
        <article className={schede.pannello}>
          <h2 className={schede.pannelloTitolo}>Venduto per giorno</h2>
          <GraficoBarre dati={perGiorno} unita="euro" etichetta="Venduto" />
        </article>

        <article className={schede.pannello}>
          <h2 className={schede.pannelloTitolo}>Top piatti</h2>
          {piattiVenduti.length > 0 ? (
            <table className={styles.tabella}>
              <thead>
                <tr>
                  <th scope="col">Piatto</th>
                  <th scope="col" className={styles.colonnaRicavi}>
                    Ricavi
                  </th>
                </tr>
              </thead>
              <tbody>
                {piattiVenduti.map((piatto, posizione) => (
                  <tr key={piatto.nome}>
                    <td>
                      <span className={styles.posizione}>{posizione + 1}</span>
                      {piatto.nome}
                    </td>
                    <td className={styles.colonnaRicavi}>
                      {euro(piatto.ricavi)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.vuoto}>
              Nessun piatto venduto in questo periodo.
            </p>
          )}
        </article>
      </div>
    </>
  );
}

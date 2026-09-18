import { prisma } from "@/lib/prisma"
import { endOfDay, startOfDay, subDays, isSameDay, format } from "date-fns"
import { it } from "date-fns/locale"
import GraficoBarre from "../_components/GraficoBarre"
import schede from "../schede.module.scss"
import styles from "./page.module.scss"

export default async function PrenotazioniPage() {
    
    const inizio = startOfDay(subDays(new Date(), 6))
    const prenotazioni = await prisma.prenotazione.findMany({
        where: {
            dataOra: { gte: inizio, lte: endOfDay(new Date())}
        }
    })

    const prenotazioniTotali = prenotazioni.length
    const copertiPrenotati = prenotazioni.reduce(
        (somma, prenotazione) => somma + prenotazione.copertiPrenotati,
        0
    )

    const inAttesa = prenotazioni.filter((s) => s.stato === "IN_ATTESA").length;
    const annullata = prenotazioni.filter((s) => s.stato === "ANNULLATA").length;
    const nonPresentata = prenotazioni.filter((s) => s.stato === "NON_PRESENTATA").length;

    const percentualeAnnullate = prenotazioni.length > 0 ? Math.round(annullata / prenotazioni.length * 100) : 0;
    const percentualeNonPresentate = prenotazioni.length > 0 ? Math.round(nonPresentata / prenotazioni.length * 100) : 0;
    const percentualeInAttesa = prenotazioni.length > 0 ? Math.round(inAttesa / prenotazioni.length * 100) : 0;

     const perGiorno = [6, 5, 4, 3, 2, 1, 0].map((n) => {
        const data = startOfDay(subDays(new Date(), n));
        const prenotazioniDelGiorno = prenotazioni.filter((prenotazione) =>
            isSameDay(prenotazione.dataOra, data),
        );
        
        const totale = prenotazioniDelGiorno.length
        return {
            giorno: format(data, "EEE", { locale: it }),
            totale,
        };
    });


    const copertiMedi = prenotazioniTotali > 0 ? copertiPrenotati / prenotazioniTotali : 0

    const esiti = [
        { etichetta: "In attesa", conteggio: inAttesa, percentuale: percentualeInAttesa },
        { etichetta: "Annullate", conteggio: annullata, percentuale: percentualeAnnullate },
        { etichetta: "Non presentati", conteggio: nonPresentata, percentuale: percentualeNonPresentate }
    ]

    return (
        <>
            <div className={schede.kpi}>
                <article className={schede.kpiCard}>
                    <h2 className={schede.kpiEtichetta}>Prenotazioni</h2>
                    <p className={schede.kpiValore}>{prenotazioniTotali}</p>
                    <p className={schede.kpiNota}>negli ultimi 7 giorni</p>
                </article>

                <article className={schede.kpiCard}>
                    <h2 className={schede.kpiEtichetta}>Coperti prenotati</h2>
                    <p className={schede.kpiValore}>{copertiPrenotati}</p>
                    <p className={schede.kpiNota}>
                        in media {copertiMedi.toLocaleString("it-IT", { maximumFractionDigits: 1 })} per prenotazione
                    </p>
                </article>

                <article className={schede.kpiCard}>
                    <h2 className={schede.kpiEtichetta}>Non presentati</h2>
                    <p className={schede.kpiValore}>
                        {percentualeNonPresentate}
                        <span className={schede.unita}>%</span>
                    </p>
                    <p className={schede.kpiNota}>{nonPresentata} prenotazioni senza nessuno arrivato</p>
                </article>
            </div>

            <div className={schede.corpo}>
                <article className={schede.pannello}>
                    <h2 className={schede.pannelloTitolo}>Prenotazioni per giorno</h2>
                    <GraficoBarre dati={perGiorno} unita="numero" etichetta="Prenotazioni" />
                </article>

                <article className={schede.pannello}>
                    <h2 className={schede.pannelloTitolo}>Esito delle prenotazioni</h2>
                    <ul className={styles.esiti}>
                        {esiti.map((esito) => (
                            <li key={esito.etichetta} className={styles.esito}>
                                <div className={styles.esitoRiga}>
                                    <span>{esito.etichetta}</span>
                                    <span className={styles.esitoValore}>
                                        {esito.percentuale}%
                                        <span className={styles.esitoConteggio}>({esito.conteggio})</span>
                                    </span>
                                </div>
                                <div className={styles.traccia}>
                                    <div className={styles.barra} style={{ width: `${esito.percentuale}%` }} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </article>
            </div>
        </>
    )
}
import { prisma } from "@/lib/prisma"
import { startOfDay, subDays, differenceInMinutes, isSameDay, format } from "date-fns";
import { it } from "date-fns/locale"
import GraficoBarre from "../_components/GraficoBarre";
import schede from "../schede.module.scss";

export default async function TurnoverPage() {

    const inizio = startOfDay(subDays(new Date(), 6));
    const occupazioni = await prisma.occupazione.findMany({
        where: {
            iniziataAlle: { gte: inizio },
            terminataAlle: { not: null }
        }
    })

    const minuti = occupazioni.map((occupazione) =>
        occupazione.terminataAlle
            ? differenceInMinutes(occupazione.terminataAlle, occupazione.iniziataAlle)
            : 0
        );
    
    const somma = minuti.reduce(
        (somma, valore) => somma + valore,
        0,
    );

    const media = occupazioni.length > 0 ? Math.round(somma / occupazioni.length) : 0;

    const tavoliServiti = occupazioni.length

    const numeroTavoli = await prisma.tavolo.count()

    const rotazione = numeroTavoli > 0 ? tavoliServiti / numeroTavoli / 7 : 0;

    const perGiorno = [6, 5, 4, 3, 2, 1, 0].map((n) => {
        const data = startOfDay(subDays(new Date(), n));
        const occupazioniDelGiorno = occupazioni.filter((occupazione) =>
            isSameDay(occupazione.iniziataAlle, data),
        );
        
        const totale = occupazioniDelGiorno.length
        return {
            giorno: format(data, "EEE", { locale: it }),
            totale,
        };
    });

    return (
        <>
            <div className={schede.kpi}>
                <article className={schede.kpiCard}>
                    <h2 className={schede.kpiEtichetta}>Tavoli serviti</h2>
                    <p className={schede.kpiValore}>{tavoliServiti}</p>
                    <p className={schede.kpiNota}>occupazioni chiuse · su {numeroTavoli} tavoli</p>
                </article>

                <article className={schede.kpiCard}>
                    <h2 className={schede.kpiEtichetta}>Permanenza media</h2>
                    <p className={schede.kpiValore}>
                        {tavoliServiti > 0 ? media : "—"}
                        {tavoliServiti > 0 && <span className={schede.unita}>min</span>}
                    </p>
                    <p className={schede.kpiNota}>da quando si siedono a quando liberano il tavolo</p>
                </article>

                <article className={schede.kpiCard}>
                    <h2 className={schede.kpiEtichetta}>Rotazione</h2>
                    <p className={schede.kpiValore}>
                        {rotazione.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </p>
                    <p className={schede.kpiNota}>volte al giorno, per tavolo</p>
                </article>
            </div>

            <article className={schede.pannello}>
                <h2 className={schede.pannelloTitolo}>Tavoli serviti per giorno</h2>
                <GraficoBarre dati={perGiorno} unita="numero" etichetta="Tavoli serviti" />
            </article>
        </>
    );
}
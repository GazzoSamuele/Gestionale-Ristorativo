import { prisma } from "@/lib/prisma"
import { startOfDay, subDays, isSameDay } from "date-fns"
import GraficoBarre from "../_components/GraficoBarre"
import schede from "../schede.module.scss"
import { euro } from "../formato"
import { giorniFa, etichettaGiorno, leggiPeriodo} from "../periodo";

export default async function OrdiniPage({
        searchParams
    }: {
    searchParams: Promise<{ periodo?: string }>;
    }) {
    const { periodo } = await searchParams;
    const giorni = leggiPeriodo(periodo);
    
    const inizio = startOfDay(subDays(new Date(), giorni - 1))
    const ordini = await prisma.ordine.findMany({
        where: {
            creatoIl: { gte: inizio }
        },
        include: { righe: true }
    })

    const ordiniConTotale = ordini.map((ordine) => ({
        creatoIl: ordine.creatoIl,
        fonte: ordine.fonte,
        totale: ordine.righe.reduce(
        (sommaRighe, riga) =>
            sommaRighe + Number(riga.prezzoUnitario) * riga.quantita,
        0,
        ),
    }));

    const ordiniSala = ordiniConTotale.filter((ordine) => ordine.fonte === "SALA")
    const ordiniAsporto = ordiniConTotale.filter((ordine) => ordine.fonte === "ASPORTO")

    const vendutoSala = ordiniSala.reduce((somma, ordine) => somma + ordine.totale, 0)
    const vendutoAsporto = ordiniAsporto.reduce((somma, ordine) => somma + ordine.totale, 0)
    const vendutoTotale = vendutoSala + vendutoAsporto

    const percentualeOrdiniSala = ordini.length > 0 ? Math.round(ordiniSala.length / ordini.length * 100) : 0
    const percentualeOrdiniAsporto = ordini.length > 0 ? Math.round(ordiniAsporto.length / ordini.length * 100) : 0
    const percentualeVendutoSala = vendutoTotale > 0 ? Math.round(vendutoSala / vendutoTotale * 100) : 0
    const percentualeVendutoAsporto = vendutoTotale > 0 ? Math.round(vendutoAsporto / vendutoTotale * 100) : 0

    const occupazioni = await prisma.occupazione.findMany({
        where: {
            iniziataAlle: { gte: inizio },
            terminataAlle: { not: null }
        }
    })

    const coperti = occupazioni.reduce((somma, occupazione) => somma + occupazione.copertiPresenti, 0)
    const scontrinoPerCoperto = coperti > 0 ? vendutoSala / coperti : 0

     const perGiorno = giorniFa(giorni).map((n) => {
        const data = startOfDay(subDays(new Date(), n));
        const ordiniDelGiorno = ordiniConTotale.filter((ordine) =>
            isSameDay(ordine.creatoIl, data),
        );
        
        return {
            giorno: etichettaGiorno(data, giorni),
            totale: ordiniDelGiorno.length
        };
    });

    const confronti = [
        {
            titolo: "Ordini",
            righe: [
                { etichetta: "Sala", valore: `${ordiniSala.length}`, percentuale: percentualeOrdiniSala },
                { etichetta: "Asporto", valore: `${ordiniAsporto.length}`, percentuale: percentualeOrdiniAsporto }
            ]
        },
        {
            titolo: "Venduto",
            righe: [
                { etichetta: "Sala", valore: euro(vendutoSala), percentuale: percentualeVendutoSala },
                { etichetta: "Asporto", valore: euro(vendutoAsporto), percentuale: percentualeVendutoAsporto }
            ]
        }
    ]

    return (
        <>
            <div className={schede.kpi}>
                <article className={schede.kpiCard}>
                    <h2 className={schede.kpiEtichetta}>Ordini</h2>
                    <p className={schede.kpiValore}>{ordini.length}</p>
                    <p className={schede.kpiNota}>{ordiniSala.length} sala · {ordiniAsporto.length} asporto</p>
                </article>

                <article className={schede.kpiCard}>
                    <h2 className={schede.kpiEtichetta}>Venduto dalla sala</h2>
                    <p className={schede.kpiValore}>
                        {percentualeVendutoSala}
                        <span className={schede.unita}>%</span>
                    </p>
                    <p className={schede.kpiNota}>{euro(vendutoSala)} su {euro(vendutoTotale)}</p>
                </article>

                <article className={schede.kpiCard}>
                    <h2 className={schede.kpiEtichetta}>Scontrino per coperto</h2>
                    <p className={schede.kpiValore}>{coperti > 0 ? euro(scontrinoPerCoperto) : "—"}</p>
                    <p className={schede.kpiNota}>solo sala · {coperti} coperti serviti</p>
                </article>
            </div>

            <div className={schede.corpo}>
                <article className={schede.pannello}>
                    <h2 className={schede.pannelloTitolo}>Ordini per giorno</h2>
                    <GraficoBarre dati={perGiorno} unita="numero" etichetta="Ordini" />
                </article>

                <article className={schede.pannello}>
                    <h2 className={schede.pannelloTitolo}>Sala e asporto</h2>
                    {confronti.map((confronto) => (
                        <section key={confronto.titolo} className={schede.gruppo}>
                            <h3 className={schede.gruppoTitolo}>{confronto.titolo}</h3>
                            <ul className={schede.esiti}>
                                {confronto.righe.map((riga) => (
                                    <li key={riga.etichetta} className={schede.esito}>
                                        <div className={schede.esitoRiga}>
                                            <span>{riga.etichetta}</span>
                                            <span className={schede.esitoValore}>
                                                {riga.percentuale}%
                                                <span className={schede.esitoConteggio}>({riga.valore})</span>
                                            </span>
                                        </div>
                                        <div className={schede.traccia}>
                                            <div className={schede.barra} style={{ width: `${riga.percentuale}%` }} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </article>
            </div>
        </>
    )
}
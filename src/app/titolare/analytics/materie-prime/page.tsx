import { prisma } from "@/lib/prisma"
import { startOfDay, subDays } from "date-fns"
import clsx from "clsx"
import { leggiPeriodo } from "../periodo"
import { quantita } from "../formato"
import schede from "../schede.module.scss"
import styles from "./page.module.scss"

const sogliaGiorni = 10

export default async function MateriePrimePage({
    searchParams
}: {
    searchParams: Promise<{ periodo?: string }>;
}) {
    const { periodo } = await searchParams
    const giorni = leggiPeriodo(periodo)
    const inizio = startOfDay(subDays(new Date(), giorni - 1))

    const piatti = await prisma.piatto.findMany({
        include: {
            righe: {
                where: { ordine: { creatoIl: { gte: inizio } } }
            }
        }
    })

    const porzioniPerPiatto = piatti.map((piatto) => ({
        id: piatto.id,
        porzioni: piatto.righe.reduce((somma, riga) => somma + riga.quantita, 0)
    }))

    const prodotti = await prisma.prodotto.findMany({
        orderBy: { nome: "asc" },
        include: { ingredienti: true }
    })

    const consumi = prodotti.map((prodotto) => {
        const consumo = prodotto.ingredienti.reduce((somma, ingrediente) => {
            const porzioni = porzioniPerPiatto.find((p) => p.id === ingrediente.piattoId)?.porzioni ?? 0
            return somma + Number(ingrediente.quantita) * porzioni
        }, 0)

        const scorta = Number(prodotto.quantita)
        const riserva = consumo > 0 ? Math.floor(scorta * giorni / consumo) : null

        return { nome: prodotto.nome, unita: prodotto.unita, consumo, scorta, riserva }
    })

    const ordinati = [...consumi].sort(
        (a, b) => (a.riserva ?? Infinity) - (b.riserva ?? Infinity)
    )
    const primoAFinire = ordinati[0]?.riserva !== null ? ordinati[0] : undefined
    const daRiordinare = consumi.filter((voce) => voce.riserva !== null && voce.riserva <= sogliaGiorni)
    const consumati = consumi.filter((voce) => voce.consumo > 0).length

    return (
        <>
            <div className={schede.kpi}>
                <article className={schede.kpiCard}>
                    <h2 className={schede.kpiEtichetta}>Finisce per primo</h2>
                    <p className={schede.kpiValore}>{primoAFinire ? primoAFinire.nome : "—"}</p>
                    <p className={schede.kpiNota}>
                        {primoAFinire ? `tra ${primoAFinire.riserva} giorni, a questo ritmo` : "nessun consumo nel periodo"}
                    </p>
                </article>

                <article className={schede.kpiCard}>
                    <h2 className={schede.kpiEtichetta}>Da riordinare presto</h2>
                    <p className={schede.kpiValore}>{daRiordinare.length}</p>
                    <p className={schede.kpiNota}>prodotti con scorta per {sogliaGiorni} giorni o meno</p>
                </article>

                <article className={schede.kpiCard}>
                    <h2 className={schede.kpiEtichetta}>Prodotti consumati</h2>
                    <p className={schede.kpiValore}>
                        {consumati}
                        <span className={schede.unita}>su {consumi.length}</span>
                    </p>
                    <p className={schede.kpiNota}>usati dai piatti venduti nel periodo</p>
                </article>
            </div>

            <article className={schede.pannello}>
                <h2 className={schede.pannelloTitolo}>Consumo e copertura</h2>
                <table className={schede.tabella}>
                    <thead>
                        <tr>
                            <th scope="col">Prodotto</th>
                            <th scope="col" className={schede.colonnaNumero}>Consumo</th>
                            <th scope="col" className={schede.colonnaNumero}>Scorta</th>
                            <th scope="col" className={schede.colonnaNumero}>Dura ancora</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordinati.map((voce) => (
                            <tr key={voce.nome}>
                                <td>{voce.nome}</td>
                                <td className={clsx(schede.colonnaNumero, voce.consumo === 0 && styles.nessunConsumo)}>
                                    {voce.consumo > 0 ? quantita(voce.consumo, voce.unita) : "—"}
                                </td>
                                <td className={schede.colonnaNumero}>{quantita(voce.scorta, voce.unita)}</td>
                                <td className={schede.colonnaNumero}>
                                    {voce.riserva !== null ? (
                                        <span className={clsx(styles.giorni, voce.riserva <= sogliaGiorni && styles.giorniPochi)}>
                                            {voce.riserva} giorni
                                        </span>
                                    ) : (
                                        <span className={styles.nessunConsumo}>—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className={styles.nota}>
                    Consumo teorico: piatti venduti × ricette. Non comprende sprechi, porzioni diverse e
                    prodotti rotti. Dura ancora rappresenta la stima in giorni della scorta totale.
                </p>
            </article>
        </>
    )
}
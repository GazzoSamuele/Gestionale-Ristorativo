import { prisma } from "@/lib/prisma";
import TempoTrascorso from "../../sala/tavoli/TempoTrascorso";
import PulsanteAvanza from "../../ordini/_components/PulsanteAvanza";

export default async function CodaCucina({ fonte }: { fonte: "SALA" | "ASPORTO"}) {
    const ordini = await prisma.ordine.findMany({
        where: { fonte, stato: { not: "PRONTI" } },
        orderBy: { creatoIl: "asc" },
        include: {
            righe: { include: { piatto: true } },
            occupazione: { include: { tavolo: true } }
        }
    });
    
    return( 
        <section>
            {ordini.map((ordine) => (
                <article key={ordine.id}>
                    <strong>
                    {ordine.occupazione
                        ? `Tavolo ${ordine.occupazione.tavolo.numero}`
                        : ordine.nomeCliente}
                    </strong>
                    <TempoTrascorso da={ordine.statoDalle}/>

                    <ul>
                        {ordine.righe.map((riga) => (
                            <li key={riga.id}>
                                <span>{riga.quantita}</span>
                                <span>{riga.piatto.nome}</span>
                            </li>
                        ))}
                    </ul>

                    <PulsanteAvanza ordineId={ordine.id}/>
                </article>
                ))}

            {ordini.length === 0 && <p>Nessun ordine in coda.</p>}
        </section>
    )

}
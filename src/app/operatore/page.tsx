import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { startOfDay } from "date-fns";
import { endOfDay } from "date-fns";
import styles from "./page.module.scss";

export default async function HomeOperatore() {
    const oggi = new Date();
    const inizio = startOfDay(oggi);
    const fine = endOfDay(oggi);

    const tavoliTotali = await prisma.tavolo.count();
    const tavoliOccupati = await prisma.occupazione.count({
      where: { terminataAlle: null }
    });

    const daPagare = await prisma.occupazione.count({
      where: { oraPagamento: null, terminataAlle: null }
    })

    const inCorso = await prisma.ordine.count({
      where: {stato: "IN_CORSO"}
    })

    const pronti = await prisma.ordine.count({
      where: { stato: "PRONTI"}
    })

    const daGestire = await prisma.ordine.count({
     where: { stato: "NUOVI_ARRIVATI" }
    });

    const ticket = await prisma.ordine.count({
      where: { stato: { not: "PRONTI" } }
    })

    const inRitardo = await prisma.prenotazione.count({
      where: {
        dataOra: { gte: inizio, lt: oggi },
        stato: "IN_ATTESA",
        occupazioni: null
      }
    });

    const prenOggi = await prisma.prenotazione.count({
     where: {
      dataOra: { gte: inizio, lte: fine },
      stato: "IN_ATTESA"
    }
    })
    const card = [
      {
        titolo: "Sala",
        valore: `${tavoliOccupati}/${tavoliTotali}`,
        etichetta: "tavoli occupati",
        badge: daPagare > 0 ? `${daPagare} da pagare` : null,
        href: "/operatore/sala/tavoli"
      },
      {
        titolo: "Ordini",
        valore: `${inCorso} · ${pronti}`,
        etichetta: "in corso · pronti",
        badge: daGestire > 0 ? `${daGestire} da gestire` : null,
        href: "/operatore/ordini/traccia"
      },
      {
        titolo: "Prenotazioni",
        valore: `${prenOggi}`,
        etichetta: "stasera",
        badge: inRitardo > 0 ? `${inRitardo} in ritardo` : null,
        href: "/operatore/prenotazioni/gestisci"
      },
      {
        titolo: "Cucina",
        valore: `${ticket}`,
        etichetta: "ticket in coda",
        // badge: 
        href: "/operatore/cucina/asporti"
      },
    ];
    
    return (
       <section className={styles.pagina}>
            <div className={styles.griglia}>
                {card.map((scheda) => (
                    <Link key={scheda.titolo} href={scheda.href} className={styles.scheda}>
                        <h2 className={styles.titolo}>{scheda.titolo}</h2>
                        <p className={styles.valore}>{scheda.valore}</p>
                        <p className={styles.etichetta}>{scheda.etichetta}</p>
                        {scheda.badge && <span className={styles.badge}>{scheda.badge}</span>}
                    </Link>
                ))}
            </div>
       </section>
     );
}



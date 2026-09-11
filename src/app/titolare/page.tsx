import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { startOfDay } from "date-fns";
import { endOfDay } from "date-fns";
import styles from "./page.module.scss";

export default async function HomeTitolare() {
    const oggi = new Date();
    const inizio = startOfDay(oggi);
    const fine = endOfDay(oggi);

    const tavoliTotali = await prisma.tavolo.count();
    const tavoliOccupati = await prisma.occupazione.count({
      where: { terminataAlle: null }
    });

    const ticket = await prisma.ordine.count({
      where: { stato: { not: "PRONTI" } }
    })

    const ordine = await prisma.ordine.count({
     where: {
      creatoIl: { gte: inizio, lte: fine },
    }
    })

    const segnalazioni = await prisma.segnalazione.count({ 
     where: {
        letta: false
     }
    })

    const piattiAttivi = await prisma.piatto.count({ 
     where: {
        disponibile: true
     }
    })
    const card = [
      {
        titolo: "Zone di lavoro",
        valore: `${tavoliOccupati}/${tavoliTotali}`,
        etichetta: "tavoli occupati",
        badge: ticket > 0 ? `${ticket} ticket in coda` : null,
        href: "/titolare/zone-di-lavoro"
      },
      {
        titolo: "Segnalazioni",
        valore: `${segnalazioni}`,
        etichetta: "non lette",
        href: "/titolare/segnalazioni"
      },
      {
        titolo: "Menu",
        valore: `${piattiAttivi}`,
        etichetta: "piatti attivi",
        href: "/titolare/menu"
      },
      {
        titolo: "Analytics",
        valore: `${ordine}`,
        etichetta: "ordini attivi",
        href: "/titolare/analytics"
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



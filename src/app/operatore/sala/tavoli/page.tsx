import { prisma } from "@/lib/prisma";
import styles from "./page.module.scss";
import TavoloCard from "./TavoloCard";

export default async function TavoliPage() {
  const tavoli = await prisma.tavolo.findMany({
    orderBy: { numero: "asc" },
    include: {
      occupazioni: {
        where: { terminataAlle: null},
        take: 1
      }
    }
  });

  return (
    <section className={styles.sala}>
      {tavoli.map((tavolo) => (
        <TavoloCard
          key={tavolo.id}
          tavolo={tavolo}
          occupato={tavolo.occupazioni.length > 0}
          occupazione={tavolo.occupazioni[0]}
        />
      ))}

      {tavoli.length === 0 && <p>Nessun tavolo in questa sala.</p>}
    </section>
  );
}

import { prisma } from "@/lib/prisma";
import styles from "./page.module.scss";
import TavoloCard from "./TavoloCard";
import { startOfDay, endOfDay } from "date-fns";

const oggi = new Date();
const inizio = startOfDay(oggi);
const fine = endOfDay(oggi);

export default async function TavoliPage() {
  const tavoli = await prisma.tavolo.findMany({
    orderBy: { numero: "asc" },
    include: {
      occupazioni: {
        where: { terminataAlle: null},
        take: 1
      },
      prenotazioni: {
        where: {
          dataOra: { gte: inizio, lte: fine },
          stato: "IN_ATTESA"
        }
      }
    }
  });

  return (
    <section className={styles.sala}>
      {tavoli.map((tavolo) => {
      const occupazioneAperta = tavolo.occupazioni[0];

      const stato = occupazioneAperta
        ? "occupato"
        : tavolo.prenotazioni.length > 0
          ? "prenotato"
          : "libero";

      return (
        <TavoloCard
          key={tavolo.id}
          tavolo={tavolo}
          stato={stato}
          occupazione={occupazioneAperta}
        />
      );
    })}

      {tavoli.length === 0 && <p>Nessun tavolo in questa sala.</p>}
    </section>
  );
}

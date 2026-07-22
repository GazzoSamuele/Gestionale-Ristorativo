import { prisma } from "@/lib/prisma";
import styles from "./page.module.scss";
import TavoloCard from "./TavoloCard";

export default async function TavoliPage() {
  const tavoli = await prisma.tavolo.findMany({
    orderBy: { numero: "asc" }
  });

  return (
    <section className={styles.sala}>
      {tavoli.map((tavolo) => (
        <TavoloCard key={tavolo.id} tavolo={tavolo} />
      ))}

      {tavoli.length === 0 && <p>Nessun tavolo in questa sala.</p>}
    </section>
  );
}

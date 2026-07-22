import { prisma } from "@/lib/prisma";

export default async function TestPage() {
  const tavoli = await prisma.tavolo.findMany({
    orderBy: { numero: "asc" }
  });

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Tavoli dal database</h1>

      <ul>
        {tavoli.map((tavolo) => (
          <li key={tavolo.id}>
            Tavolo {tavolo.numero} — {tavolo.capienza} posti
            (x: {tavolo.posX}, y: {tavolo.posY})
          </li>
        ))}
      </ul>

      {tavoli.length === 0 && <p>Nessun tavolo nel database. Hai lanciato il seed?</p>}
    </main>
  );
}

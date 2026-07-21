// Pagina di prova: serve solo a verificare che la catena funzioni
// (PostgreSQL -> Prisma -> Next.js -> schermo). Estetica: zero, ed è voluto.

// Nessun "use client" in cima => questo è un SERVER COMPONENT.
// Gira sul server, quindi può parlare col database direttamente,
// senza passare da un'API e senza esporre la connessione al browser.
import { prisma } from "@/lib/prisma";

// "async" perché leggere dal database richiede tempo e va atteso.
// Solo i Server Component possono essere async.
export default async function TestPage() {
  // findMany = "prendimi tutte le righe della tabella Tavolo".
  // orderBy le ordina per numero crescente.
  const tavoli = await prisma.tavolo.findMany({
    orderBy: { numero: "asc" }
  });

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Tavoli dal database</h1>

      <ul>
        {/* map trasforma ogni tavolo in un <li>.
            key serve a React per distinguere gli elementi: usiamo l'id,
            che è unico per definizione. */}
        {tavoli.map((tavolo) => (
          <li key={tavolo.id}>
            Tavolo {tavolo.numero} — {tavolo.capienza} posti
            (x: {tavolo.posX}, y: {tavolo.posY})
          </li>
        ))}
      </ul>

      {/* Lo "stato vuoto": se non ci sono tavoli, dillo invece di
          mostrare una lista vuota che sembra un errore di caricamento. */}
      {tavoli.length === 0 && <p>Nessun tavolo nel database. Hai lanciato il seed?</p>}
    </main>
  );
}

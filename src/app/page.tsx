import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h1>Gestionale Ristorativo</h1>
      <Link href="/operatore/sala/tavoli">→ Area Operatore</Link>
      <Link href="/titolare">→ Area Titolare</Link>
    </main>
  );
}
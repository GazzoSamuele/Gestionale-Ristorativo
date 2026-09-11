import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CompositoreOrdine from "@/app/operatore/ordini/_components/CompositoreOrdine";

export default async function OrdinaTavoloPage({
  params
}: {
  params: Promise<{ tavoloId: string }>;
}) {
  const { tavoloId } = await params;

  const occupazione = await prisma.occupazione.findFirst({
    where: { tavoloId, terminataAlle: null },
    include: { tavolo: true }
  });

  if (!occupazione) {
    notFound();
  }

  const categorie = await prisma.categoria.findMany({
    orderBy: { ordine: "asc" },
    include: {
      piatti: {
        where: { disponibile: true },
        orderBy: { nome: "asc" }
      }
    }
  });

  const dati = categorie.map((categoria) => ({
    id: categoria.id,
    nome: categoria.nome,
    piatti: categoria.piatti.map((piatto) => ({
      id: piatto.id,
      nome: piatto.nome,
      prezzo: piatto.prezzo.toString()
    }))
  }));

  return (
    <CompositoreOrdine
      categorie={dati}
      fonte="SALA"
      occupazioneId={occupazione.id}
      numeroTavolo={occupazione.tavolo.numero}
    />
  );
}
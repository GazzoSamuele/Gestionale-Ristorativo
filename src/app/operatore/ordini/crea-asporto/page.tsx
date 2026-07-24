import { prisma } from "@/lib/prisma";
import CompositoreOrdine from "../_components/CompositoreOrdine";

export default async function CreaAsportoPage() {
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

  return <CompositoreOrdine categorie={dati} />;
}
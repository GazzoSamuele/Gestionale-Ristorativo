import { prisma } from "@/lib/prisma";

export default async function Consegne () {
  const prodotti = await prisma.prodotto.findMany({ orderBy: { nome: "asc"} });

  const staFinendo  = prodotti.filter((prodotto) => Number(prodotto.quantita) < Number(prodotto.limiteMinimo) || prodotto.daOrdinare);

  return (
    <div>
      <h2>Sta finendo</h2>
      <ul>
        {staFinendo.map((prodotto) => (
          <li key={prodotto.id}>
            {prodotto.nome}
            {prodotto.daOrdinare && <strong> · Da ordinare</strong>}
          </li>
        ))}
      </ul>
    </div>
  );
}

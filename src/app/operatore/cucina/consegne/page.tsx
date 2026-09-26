import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export default async function Consegne () {
  const prodotti = await prisma.prodotto.findMany({ orderBy: { nome: "asc" } });

  const inArrivo = await prisma.fornitura.findMany({
    where: { ricevuta: false },
    orderBy: { creatoIl: "asc" },
    include: {
      righe: { include: { prodotto: true } }
    }
  });

  const ricevuteDiRecente = await prisma.fornitura.findMany({
    where: { ricevuta: true },
    orderBy: { ricevutaIl: "desc" },
    take: 5,
    include: {
      righe: { include: { prodotto: true } }
    }
  });

  const staFinendo = prodotti.filter(
    (prodotto) => Number(prodotto.quantita) < Number(prodotto.limiteMinimo) || prodotto.daOrdinare
  );

  return (
    <section>
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

      <div>
        <h2>In arrivo</h2>
        <ul>
          {inArrivo.map((fornitura) => (
            <li key={fornitura.id}>
              <span>{fornitura.fornitore}</span>
              <span>ordinata il {format(fornitura.creatoIl, "d MMMM", { locale: it })}</span>

              <ul>
                {fornitura.righe.map((riga) => (
                  <li key={riga.id}>
                    {riga.prodotto.nome} · {Number(riga.quantita)} {riga.prodotto.unita}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Ricevute di recente</h2>
        <ul>
          {ricevuteDiRecente.map((fornitura) => (
            <li key={fornitura.id}>
              <span>{fornitura.fornitore}</span>
              {fornitura.ricevutaIl && (
                <span>arrivata il {format(fornitura.ricevutaIl, "d MMMM", { locale: it })}</span>
              )}

              <ul>
                {fornitura.righe.map((riga) => (
                  <li key={riga.id}>
                    {riga.prodotto.nome} · {Number(riga.quantita)} {riga.prodotto.unita}
                  </li>
                ))}
              </ul>

              {fornitura.note && <p>{fornitura.note}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

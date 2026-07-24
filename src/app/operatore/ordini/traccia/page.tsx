import { prisma } from "@/lib/prisma";
import TempoTrascorso from "@/app/operatore/sala/tavoli/TempoTrascorso";

const colonne =  [ 
    { stato: "NUOVI_ARRIVATI", etichetta: "Nuovi arrivati" },
    { stato: "IN_CORSO", etichetta: "In Corso" },
    { stato: "PRONTI", etichetta: "Pronti" }
  ] as const;

export default async function Traccia() {
  const ordini = await prisma.ordine.findMany({
    orderBy: { creatoIl: "asc"},
    include: {
      righe: true,
      occupazione: {
        include: {
          tavolo: true
        }
      }
    }
  });

  return (
    <section>
      <h1>Gestione ordini</h1>

      <div>
        {colonne.map((colonna) => {
          const ordiniColonna = ordini.filter((ordine) => ordine.stato === colonna.stato);

          return (
            <div key={colonna.stato}>
              <h2>{colonna.etichetta}</h2>

              <ul>
                {ordiniColonna.map((ordine) => (
                  <li key={ordine.id}>
                    <strong>
                      {ordine.occupazione
                        ? `Tavolo ${ordine.occupazione.tavolo.numero}`
                        : ordine.nomeCliente}
                    </strong>
                    <p>
                      #{ordine.numero} · {ordine.fonte} · {ordine.righe.length} piatti
                    </p>
                    <TempoTrascorso da={ordine.statoDalle} />
                  </li>
                ))}
              </ul>

              {ordiniColonna.length === 0 && <p>Nessun ordine</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

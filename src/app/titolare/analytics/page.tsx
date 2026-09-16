import { prisma } from "@/lib/prisma";
import { isSameDay, startOfDay, subDays} from "date-fns";
import { it } from "date-fns/locale";
import { format } from "date-fns";

export default async function AnalyticsPage() {
  const inizio = startOfDay(subDays(new Date(), 6));

  const ordini = await prisma.ordine.findMany({ 
    where: { 
        creatoIl: { gte: inizio } },
        include: { righe: true }
  });

const ordiniConTotale = ordini.map((ordine) => ({
    creatoIl: ordine.creatoIl,
    totale: ordine.righe.reduce(
            (sommaRighe, riga) => sommaRighe + Number(riga.prezzoUnitario) * riga.quantita, 
            0
        ),
}));

const totale = ordiniConTotale.reduce((somma, ordine) => somma + ordine.totale, 0);

const scontrinoMedio = ordini.length > 0 ? totale / ordini.length : 0;

const perGiorno = [6, 5, 4, 3, 2, 1, 0].map((n) => {

    const data = startOfDay(subDays(new Date(), n));

    const ordiniDelGiorno = ordiniConTotale.filter(ordine => isSameDay (ordine.creatoIl, data))
    
    const totale = ordiniDelGiorno.reduce((somma, ordine) => somma + ordine.totale, 0);

return { giorno: format(data, "EEE", { locale: it}), totale };
});


  return (
    <>
    <div>
        <p>{ordini.length} ordini</p>
        <p>€ {totale.toFixed(2)} venduto</p>
        <p>€ {scontrinoMedio.toFixed(2)} scontrino medio</p>
    </div>

    <ul>
      {perGiorno.map((voce) => (
            <li key={voce.giorno}>{voce.giorno}: € {voce.totale}</li>
        ))}
    </ul>
  
  </>
  );
}
  

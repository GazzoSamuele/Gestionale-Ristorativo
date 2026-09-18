'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

type VocePerGiorno = { giorno: string; totale: number };
type Unita = "euro" | "numero";

function formatta(valore: number, unita: Unita) {
  if (unita === "euro") {
    return `€ ${valore.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return valore.toLocaleString("it-IT");
}

export default function GraficoBarre({
  dati,
  unita,
  etichetta
}: {
  dati: VocePerGiorno[];
  unita: Unita;
  etichetta: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={dati} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="#e0d6c4" />
        <XAxis
          dataKey="giorno"
          tickLine={false}
          axisLine={{ stroke: "#e0d6c4" }}
          tick={{ fill: "#8a7962", fontSize: 13 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#8a7962", fontSize: 13 }}
          tickFormatter={(valore) => (unita === "euro" ? `€ ${valore}` : `${valore}`)}
          allowDecimals={unita === "euro"}
          width={unita === "euro" ? 56 : 32}
        />
        <Tooltip
          cursor={{ fill: "#e7d9be", opacity: 0.5 }}
          formatter={(valore) => [formatta(Number(valore), unita), etichetta]}
        />
        <Bar dataKey="totale" fill="#b5652a" radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}

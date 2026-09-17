'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

type VocePerGiorno = { giorno: string; totale: number };

export default function GraficoVenduto({ dati }: { dati: VocePerGiorno[] }) {
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
          tickFormatter={(valore) => `€ ${valore}`}
          width={56}
        />
        <Tooltip
          cursor={{ fill: "#e7d9be", opacity: 0.5 }}
          formatter={(valore) => [
            `€ ${Number(valore).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            "Venduto"
          ]}
        />
        <Bar dataKey="totale" fill="#b5652a" radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
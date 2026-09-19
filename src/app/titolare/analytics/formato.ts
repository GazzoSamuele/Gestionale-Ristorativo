const unitaBreve = { KG: "kg", L: "L", PZ: "pz" } as const;

export function quantita(valore: number, unita: keyof typeof unitaBreve) {
  return `${valore.toLocaleString("it-IT", { maximumFractionDigits: 3 })} ${unitaBreve[unita]}`;
}

export function euro(valore: number) {
  return `€ ${valore.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

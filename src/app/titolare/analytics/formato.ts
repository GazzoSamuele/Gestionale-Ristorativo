export function euro(valore: number) {
  return `€ ${valore.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

'use client'

import { useState, useEffect } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { it } from "date-fns/locale";

export default function TempoTrascorso({ da }: { da: Date }) {
  const [testo, setTesto] = useState<string | null>(null);
  const inizio = da.getTime();

  useEffect(() => {
    const aggiorna = () => setTesto(formatDistanceToNowStrict(inizio, { locale: it }));

    aggiorna();
    const timer = setInterval(aggiorna, 30_000);

    return () => clearInterval(timer);
  }, [inizio]);

  if (!testo) return null;

  return <span>da {testo}</span>;
}
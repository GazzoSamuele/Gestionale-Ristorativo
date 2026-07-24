'use client'

import { useState } from "react";
import { toast } from "sonner";
import { creaOrdine } from "../actions";

type Piatto = { id: string; nome: string; prezzo: string };
type Categoria = { id: string; nome: string; piatti: Piatto[] };
type RigaCarrello = Piatto & { quantita: number };

export default function CompositoreOrdine({ categorie }: { categorie: Categoria[] }) {
  const [filtro, setFiltro] = useState<string | null>(null);
  const [carrello, setCarrello] = useState<RigaCarrello[]>([]);
  const [nomeCliente, setNomeCliente] = useState("");
  const [invio, setInvio] = useState(false);

  const categorieMostrate = filtro
    ? categorie.filter((categoria) => categoria.id === filtro)
    : categorie;

  const aggiungi = (piatto: Piatto) => {
    setCarrello((attuale) => {
      const gia = attuale.find((riga) => riga.id === piatto.id);

      if (gia) {
        return attuale.map((riga) =>
          riga.id === piatto.id ? { ...riga, quantita: riga.quantita + 1 } : riga
        );
      }

      return [...attuale, { ...piatto, quantita: 1 }];
    });
  };

  const rimuovi = (piattoId: string) => {
    setCarrello((attuale) => attuale.filter((riga) => riga.id !== piattoId));
  };

  const totale = carrello.reduce(
    (somma, riga) => somma + Number(riga.prezzo) * riga.quantita,
    0
  );

  const mandaInCucina = async () => {
    setInvio(true);

    const esito = await creaOrdine({
      fonte: "ASPORTO",
      nomeCliente,
      righe: carrello.map((riga) => ({ piattoId: riga.id, quantita: riga.quantita }))
    });

    setInvio(false);

    if (esito.ok) {
      toast.success("Ordine mandato in cucina");
      setCarrello([]);
      setNomeCliente("");
    } else {
      toast.error(esito.errore);
    }
  };

  return (
    <section>
      <header>
        <h1>Crea ordine</h1>
        <div>
          <button type="button" onClick={() => setFiltro(null)}>Tutti</button>
          {categorie.map((categoria) => (
            <button key={categoria.id} type="button" onClick={() => setFiltro(categoria.id)}>
              {categoria.nome}
            </button>
          ))}
        </div>
      </header>

      <div>
        {categorieMostrate.map((categoria) => (
          <div key={categoria.id}>
            <h2>{categoria.nome}</h2>
            {categoria.piatti.map((piatto) => (
              <article key={piatto.id}>
                <h3>{piatto.nome}</h3>
                <p>€ {piatto.prezzo}</p>
                <button type="button" onClick={() => aggiungi(piatto)}>Aggiungi</button>
              </article>
            ))}
          </div>
        ))}
      </div>

      <aside>
        <h2>Asporto</h2>

        <input
          type="text"
          placeholder="Nome cliente"
          value={nomeCliente}
          onChange={(e) => setNomeCliente(e.target.value)}
        />

        <ul>
          {carrello.map((riga) => (
            <li key={riga.id}>
              <span>{riga.nome}</span>
              <span>€ {riga.prezzo} · {riga.quantita}×</span>
              <button type="button" onClick={() => rimuovi(riga.id)}>rimuovi</button>
            </li>
          ))}
        </ul>

        {carrello.length === 0 && <p>Nessun piatto selezionato.</p>}

        <p>Totale € {totale.toFixed(2)}</p>

        <button
          type="button"
          onClick={mandaInCucina}
          disabled={invio || carrello.length === 0 || !nomeCliente.trim()}
        >
          {invio ? "Invio…" : "Manda in cucina"}
        </button>
      </aside>
    </section>
  );
}
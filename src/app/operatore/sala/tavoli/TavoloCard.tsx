'use client'

import { useState, useRef, type PointerEvent } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import type { Tavolo, Occupazione } from "@/generated/prisma/client";
import { spostaTavolo, occupaTavolo, liberaTavolo } from "./actions";
import styles from "./page.module.scss";
import TempoTrascorso from "./TempoTrascorso";

type StatoTavolo = "libero" | "occupato" | "prenotato";

export default function TavoloCard({ tavolo, stato, occupazione }: { tavolo: Tavolo; stato: StatoTavolo; occupazione?: Occupazione }) {

  const classiStato: Record<StatoTavolo, string> = {
    libero: styles.tavoloLibero,
    occupato: styles.tavoloOccupato,
    prenotato: styles.tavoloRiservato
  };

  const occupato = stato === "occupato";

  const [pos, setPos] = useState({ x: tavolo.posX, y: tavolo.posY });

  const dragStart = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0, dragging: false });

  const [coperti, setCoperti] = useState(tavolo.capienza);

  const handleSiedi = async () => {
    const esito = await occupaTavolo({ tavoloId: tavolo.id, copertiPresenti: coperti });

    if (!esito.ok) {
      toast.error(esito.errore);
    }
  };

  const handleLibera = async () => {
    const esito = await liberaTavolo({ tavoloId: tavolo.id });

    if (!esito.ok) {
      toast.error(esito.errore);
    }
  };

  const handlePointerDown = (e: PointerEvent<HTMLElement>) => {
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: pos.x,
      posY: pos.y,
      dragging: true
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!dragStart.current.dragging) return;

    const sala = e.currentTarget.closest(`.${styles.sala}`);
    if (!sala) return;

    const rect = sala.getBoundingClientRect();

    const dxPct = ((e.clientX - dragStart.current.mouseX) / rect.width) * 100;
    const dyPct = ((e.clientY - dragStart.current.mouseY) / rect.height) * 100;

    setPos({
      x: dragStart.current.posX + dxPct,
      y: dragStart.current.posY + dyPct
    });
  };

  const handlePointerUp = async (e: PointerEvent<HTMLElement>) => {
    if (!dragStart.current.dragging) return;

    dragStart.current.dragging = false;

    e.currentTarget.releasePointerCapture(e.pointerId);

    const partenza = { x: dragStart.current.posX, y: dragStart.current.posY };

    const esito = await spostaTavolo({ id: tavolo.id, posX: pos.x, posY: pos.y });

    if (!esito.ok) {

      setPos(partenza);
      toast.error(esito.errore);
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={clsx(styles.tavoloCard, classiStato[stato])}
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      <h2>Tavolo {tavolo.numero}</h2>

      <div className={styles.tavoloInfo}>
        <p>{occupazione ? `${occupazione.copertiPresenti} / ${tavolo.capienza}` : tavolo.capienza} posti</p>
      
      {occupazione && <TempoTrascorso da={occupazione.iniziataAlle} />}
      </div>
      
      {!occupato && (
      <div className={styles.azioniTavolo} onPointerDown={(e) => e.stopPropagation()}>
        <input
          type="number"
          min={1}
          value={coperti}
          onChange={(e) => setCoperti(Number(e.target.value))}
        />
        <button type="button" onClick={handleSiedi}>Siedi</button>
      </div>
    )}
    {occupato && (
        <button
          className={styles.btnLiberaTavolo}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleLibera}
        >
          Libera tavolo
        </button>
      )}
    </div>
  );
}

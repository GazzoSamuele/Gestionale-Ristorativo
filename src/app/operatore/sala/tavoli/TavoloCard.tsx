'use client'

import { useState, useRef, type PointerEvent } from "react";
import { toast } from "sonner";
import type { Tavolo } from "@/generated/prisma/client";
import { spostaTavolo } from "./actions";
import styles from "./page.module.scss";

export default function TavoloCard({ tavolo }: { tavolo: Tavolo }) {

  const [pos, setPos] = useState({ x: tavolo.posX, y: tavolo.posY });

  const dragStart = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0, dragging: false });

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
      className={`${styles.tavoloCard} ${styles.tavoloLibero}`}
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      <h2>Tavolo {tavolo.numero}</h2>

      <div className={styles.tavoloInfo}>
        <p>{tavolo.capienza} posti</p>
      </div>
    </div>
  );
}

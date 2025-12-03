import React, { useEffect, useMemo, useRef, useState } from "react";
import ProductoCard from "./ProductoCard";
import { Producto } from "../types/producto";
import "../styles/carrusel.css";

interface Props {
  productos: Producto[];
  mostrarAcciones?: boolean;
  onEliminarProducto?: (id: number) => void;
}

const CARD_WIDTH = 260;
const GAP = 16;

const CarruselEspeciales: React.FC<Props> = ({
  productos,
  mostrarAcciones = false,
  onEliminarProducto,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const [paused, setPaused] = useState(false);

  // 🔧 Nueva referencia para la posición actual del carrusel
  const positionRef = useRef(0);

  // 🔧 Refs para manejo de touch en móvil
  const isDraggingRef = useRef(false);
  const touchStartXRef = useRef(0);
  const dragStartXRef = useRef(0);

  /* ---------------------------------
   * 🔥 Temporada más frecuente
   * --------------------------------- */
  const temporadaActual = useMemo(() => {
    const nombres = productos
      .filter((p) => p.esTemporada && p.badgeTexto)
      .map((p) => p.badgeTexto!.trim());

    if (nombres.length === 0) return "Especiales";

    const freq = new Map<string, number>();
    for (const n of nombres) freq.set(n, (freq.get(n) || 0) + 1);

    let best = nombres[0],
      bestCount = 0;

    for (const [k, v] of freq)
      if (v > bestCount) {
        best = k;
        bestCount = v;
      }

    return best;
  }, [productos]);

  /* ---------------------------------
   * 🔁 Duplicación interna (no visible)
   * --------------------------------- */
  const loopItems = useMemo(() => {
    if (!productos || productos.length === 0) return [];
    return [...productos, ...productos];
  }, [productos]);

  /* ---------------------------------
   * 🔁 Movimiento continuo perfecto
   * --------------------------------- */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (productos.length <= 1) return;

    const speed = 0.4;
    const totalWidth = productos.length * (CARD_WIDTH + GAP);

    let frame: number;

    const animate = () => {
      // No mover si está pausado o si el usuario está arrastrando con el dedo
      if (!paused && !isDraggingRef.current) {
        let x = positionRef.current;

        x -= speed;

        if (Math.abs(x) >= totalWidth) {
          x = 0;
        }

        positionRef.current = x;
        track.style.transform = `translateX(${x}px)`;
      }

      frame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(frame);
  }, [productos, paused]);

  /* ---------------------------------
   * ⬅️➡️ Flechas MANUALES (solo escritorio)
   * --------------------------------- */
  const moveManual = (dir: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;

    const distance = 300; // avanza un poco a cada clic

    // Congelar movimiento automático por 1 segundo
    setPaused(true);
    setTimeout(() => setPaused(false), 1000);

    let currentX = positionRef.current;

    if (dir === "left") currentX += distance;
    else currentX -= distance;

    positionRef.current = currentX;
    track.style.transform = `translateX(${currentX}px)`;
  };

  /* ---------------------------------
   * 📱 Manejo de touch para móvil
   * --------------------------------- */
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (productos.length <= 1) return;

    const touch = e.touches[0];
    isDraggingRef.current = true;
    touchStartXRef.current = touch.clientX;
    dragStartXRef.current = positionRef.current;

    setPaused(true); // Pausar mientras el usuario toca/arrastra
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartXRef.current;

    const newX = dragStartXRef.current + deltaX;
    positionRef.current = newX;

    const track = trackRef.current;
    if (track) {
      track.style.transform = `translateX(${newX}px)`;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    setPaused(false); // Reanudar cuando termina el gesto
  };

  if (!productos || productos.length === 0) return null;

  return (
    <section className="carrusel-section mb-8 w-full">
      <div className="rounded-2xl p-3 md:p-4 bg-gradient-to-r from-[#2b172a] via-[#2a1a2e] to-[#1f1b30] border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3">
          <div className="flex items-start gap-2">
            <span className="text-2xl md:text-3xl">🎊</span>
            <div>
              <div className="text-sm md:text-base text-white/80">
                Temporada:
              </div>
              <div className="text-lg md:text-2xl font-extrabold tracking-wide text-white">
                {temporadaActual.toUpperCase()}
              </div>
              <div className="text-[11px] md:text-sm text-white/60 -mt-0.5 md:mt-0">
                Ofertas por tiempo limitado
              </div>
            </div>
          </div>
        </div>

        {/* FLECHAS */}
        {productos.length > 1 && (
          <>
            <button
              onClick={() => moveManual("left")}
              className="hidden md:flex carrusel-arrow carrusel-left"
            >
              ‹
            </button>

            <button
              onClick={() => moveManual("right")}
              className="hidden md:flex carrusel-arrow carrusel-right"
            >
              ›
            </button>
          </>
        )}

        {/* Carrusel */}
        <div
          className="carrusel-viewport mt-3 md:mt-4 overflow-hidden relative w-full"
          onMouseEnter={() => setPaused(true)} // Pausar en escritorio
          onMouseLeave={() => setPaused(false)} // Reanudar en escritorio
          onTouchStart={handleTouchStart} // 📱 Pausar y empezar drag
          onTouchMove={handleTouchMove} // 📱 Mover con el dedo
          onTouchEnd={handleTouchEnd} // 📱 Soltar y reanudar
        >
          <div
            ref={trackRef}
            className="flex gap-4 will-change-transform"
            style={{ width: "max-content" }}
          >
            {loopItems.map((p, idx) => (
              <div key={`${p.id}-${idx}`} className="shrink-0 w-[260px]">
                <ProductoCard
                  producto={p}
                  mostrarAcciones={mostrarAcciones}
                  onEliminado={onEliminarProducto}
                />
              </div>
            ))}
          </div>

          {productos.length > 1 && (
            <>
              <div className="carrusel-fade carrusel-fade-left" />
              <div className="carrusel-fade carrusel-fade-right" />
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CarruselEspeciales;

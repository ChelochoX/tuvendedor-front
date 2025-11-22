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
const STEP = CARD_WIDTH + GAP;

const CarruselEspeciales: React.FC<Props> = ({
  productos,
  mostrarAcciones = false,
  onEliminarProducto,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  /** -----------------------------------------
   *  🔥 Temporada más frecuente
   * ----------------------------------------- */
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

  /** -----------------------------------------
   *  🔁 Duplicación TRIPLE para loop perfecto
   * ----------------------------------------- */
  const loopItems = useMemo(() => {
    if (!productos || productos.length === 0) return [];

    // 🔥 TRIPLE duplicación → overflow garantizado SIEMPRE
    return [...productos, ...productos, ...productos];
  }, [productos]);

  /** -----------------------------------------
   *  ⬅️➡️ Scroll manual con flechas
   * ----------------------------------------- */
  const scrollByDir = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;

    setPaused(true);
    el.scrollTo({
      left: el.scrollLeft + (dir === "left" ? -STEP : STEP),
      behavior: "smooth",
    });

    setTimeout(() => setPaused(false), 500);
  };

  /** -----------------------------------------
   *  🔁 Auto-scroll INFINITO real (desktop + mobile)
   * ----------------------------------------- */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const speed = 0.6;
    let raf = 0;

    const tick = () => {
      if (!paused) {
        el.scrollLeft += speed;

        const oneBlock = el.scrollWidth / 3;

        // 🔄 Loop perfecto, sin saltos
        if (el.scrollLeft >= oneBlock * 2) {
          el.scrollLeft -= oneBlock;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [paused, loopItems.length]);

  /** -----------------------------------------
   *  🖱️ Pausa si usuario interactúa
   * ----------------------------------------- */
  const handleMouseMove = () => setPaused(true);

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

        {/* Flechas */}
        <button
          type="button"
          onClick={() => scrollByDir("left")}
          className="hidden md:flex carrusel-arrow carrusel-left"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={() => scrollByDir("right")}
          className="hidden md:flex carrusel-arrow carrusel-right"
        >
          ›
        </button>

        {/* Carrusel */}
        <div className="carrusel-viewport mt-3 md:mt-4">
          <div
            ref={trackRef}
            className="carrusel-track no-scrollbar flex gap-4 overflow-x-auto w-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
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

          <div className="carrusel-fade carrusel-fade-left" />
          <div className="carrusel-fade carrusel-fade-right" />
        </div>
      </div>
    </section>
  );
};

export default CarruselEspeciales;

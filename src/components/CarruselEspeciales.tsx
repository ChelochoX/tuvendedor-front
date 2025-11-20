import React, { useEffect, useMemo, useRef, useState } from "react";
import ProductoCard from "./ProductoCard";
import { Producto } from "../types/producto";
import "../styles/carrusel.css";

interface Props {
  productos: Producto[];
  mostrarAcciones?: boolean;
  onEliminarProducto?: (id: number) => void;
}

/** Ancho fijo de card + gap visual para cálculos del desplazamiento */
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

  // Detectamos el nombre de la temporada (si existe) para el encabezado
  const temporadaActual =
    productos.find((p) => p.esTemporada && p.badgeTexto)?.badgeTexto ||
    "Especiales";

  // Duplicamos para loop suave
  const loopItems = useMemo(() => {
    if (!productos || productos.length === 0) return [];
    if (productos.length < 3) return productos;
    return [...productos, ...productos];
  }, [productos]);

  const scrollByDir = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    setPaused(true);
    el.scrollTo({
      left: el.scrollLeft + (dir === "left" ? -STEP : STEP),
      behavior: "smooth",
    });
    window.setTimeout(() => setPaused(false), 400);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el || loopItems.length < 3) return;

    let raf = 0;
    const speed = 0.6;

    const tick = () => {
      if (!paused) {
        el.scrollLeft += speed;
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, loopItems.length]);

  if (!productos || productos.length === 0) return null;

  return (
    <section className="carrusel-section mb-8 w-full">
      {/* HEADER — responsive */}
      <div className="rounded-2xl p-3 md:p-4 bg-gradient-to-r from-[#2b172a] via-[#2a1a2e] to-[#1f1b30] border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3">
          {/* Título + subtítulo */}
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

        {/* FLECHAS (solo desktop) */}
        <button
          type="button"
          onClick={() => scrollByDir("left")}
          className="hidden md:flex carrusel-arrow carrusel-left pointer-events-auto"
          aria-label="Anterior"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => scrollByDir("right")}
          className="hidden md:flex carrusel-arrow carrusel-right pointer-events-auto"
          aria-label="Siguiente"
        >
          ›
        </button>

        {/* VIEWPORT + TRACK */}
        <div className="carrusel-viewport mt-3 md:mt-4">
          <div
            ref={trackRef}
            className="carrusel-track no-scrollbar flex gap-4 overflow-x-auto w-full"
            onMouseEnter={() => setPaused(true)}
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

          {/* Fades laterales */}
          <div className="carrusel-fade carrusel-fade-left" />
          <div className="carrusel-fade carrusel-fade-right" />
        </div>
      </div>
    </section>
  );
};

export default CarruselEspeciales;

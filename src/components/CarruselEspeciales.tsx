import React, { useEffect, useMemo, useRef, useState } from "react";
import ProductoCard from "./ProductoCard";
import { Producto } from "../types/producto";
import "../styles/carrusel.css"; // 👈 importante

interface Props {
  productos: Producto[];
  mostrarAcciones?: boolean;
  onEliminarProducto?: (id: number) => void;
}

const CARD_WIDTH = 260; // ancho de cada card
const GAP = 16; // gap-4 tailwind
const STEP = CARD_WIDTH + GAP;

const CarruselEspeciales: React.FC<Props> = ({
  productos,
  mostrarAcciones = false,
  onEliminarProducto,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // Duplicamos para loop suave si hay suficientes ítems
  const loopItems = useMemo(() => {
    if (!productos || productos.length === 0) return [];
    if (productos.length < 3) return productos;
    return [...productos, ...productos];
  }, [productos]);

  const scrollByDir = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    // pausamos un instante para que se note el click
    setPaused(true);
    el.scrollTo({
      left: el.scrollLeft + (dir === "left" ? -STEP : STEP),
      behavior: "smooth",
    });
    // reanudar luego de un ratito
    window.setTimeout(() => setPaused(false), 400);
  };

  // Auto-scroll infinito
  useEffect(() => {
    const el = trackRef.current;
    if (!el || loopItems.length < 3) return;

    let raf = 0;
    const speed = 0.6; // px/frame aprox

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
      <h3 className="text-xl font-bold mb-3 text-yellow-400">
        🔥 Publicaciones Especiales
      </h3>

      {/* Flechas (solo desktop) */}
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

      {/* Contenedor con “fades” laterales (no tapa clicks) */}
      <div className="carrusel-viewport">
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

        {/* Fades laterales (solo visuales, sin capturar eventos) */}
        <div className="carrusel-fade carrusel-fade-left" />
        <div className="carrusel-fade carrusel-fade-right" />
      </div>
    </section>
  );
};

export default CarruselEspeciales;

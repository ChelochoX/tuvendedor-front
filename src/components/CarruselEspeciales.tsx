import React, { useEffect, useMemo, useRef, useState } from "react";
import ProductoCard from "./ProductoCard";
import { Producto } from "../types/producto";
import "../styles/carrusel.css";

interface Props {
  productos: Producto[];
  mostrarAcciones?: boolean;
  onEliminarProducto?: (id: number) => void;
}

const CarruselEspeciales: React.FC<Props> = ({
  productos,
  mostrarAcciones = false,
  onEliminarProducto,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const [paused, setPaused] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  const positionRef = useRef(0);

  const isDraggingRef = useRef(false);
  const touchStartXRef = useRef(0);
  const dragStartXRef = useRef(0);

  /* ---------------------------------
   * Temporada más frecuente
   * --------------------------------- */
  const temporadaActual = useMemo(() => {
    const nombres = productos
      .filter((p) => p.esTemporada && p.badgeTexto)
      .map((p) => p.badgeTexto!.trim());

    if (nombres.length === 0) return "Especiales";

    const freq = new Map<string, number>();

    for (const nombre of nombres) {
      freq.set(nombre, (freq.get(nombre) || 0) + 1);
    }

    let mejorNombre = nombres[0];
    let mayorCantidad = 0;

    for (const [nombre, cantidad] of freq) {
      if (cantidad > mayorCantidad) {
        mejorNombre = nombre;
        mayorCantidad = cantidad;
      }
    }

    return mejorNombre;
  }, [productos]);

  /* ---------------------------------
   * Detectar si realmente debe moverse
   * --------------------------------- */
  useEffect(() => {
    const track = trackRef.current;
    const viewport = track?.parentElement;

    if (!track || !viewport) return;

    const actualizarLimites = () => {
      const maxScroll = Math.max(
        0,
        track.scrollWidth - viewport.offsetWidth,
      );

      const hayDesplazamiento = maxScroll > 0;

      setCanScroll(hayDesplazamiento);

      if (!hayDesplazamiento) {
        positionRef.current = 0;
        track.style.transform = "translateX(0px)";
      }
    };

    actualizarLimites();

    const observer = new ResizeObserver(actualizarLimites);

    observer.observe(viewport);
    observer.observe(track);

    return () => observer.disconnect();
  }, [productos]);

  /* ---------------------------------
   * Movimiento automático
   * --------------------------------- */
  useEffect(() => {
    const track = trackRef.current;
    const viewport = track?.parentElement;

    if (!track || !viewport) return;
    if (productos.length <= 1 || !canScroll) return;

    const speed = 0.4;

    let frame: number;

    const animate = () => {
      if (!paused && !isDraggingRef.current) {
        let posicion = positionRef.current;

        posicion -= speed;

        const maxScroll = Math.max(
          0,
          track.scrollWidth - viewport.offsetWidth,
        );

        if (maxScroll <= 0 || Math.abs(posicion) >= maxScroll) {
          posicion = 0;
        }

        positionRef.current = posicion;
        track.style.transform = `translateX(${posicion}px)`;
      }

      frame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(frame);
  }, [productos, paused, canScroll]);

  /* ---------------------------------
   * Flechas manuales para escritorio
   * --------------------------------- */
  const moveManual = (direccion: "left" | "right") => {
    const track = trackRef.current;
    const viewport = track?.parentElement;

    if (!track || !viewport) return;

    const maxScroll = Math.max(
      0,
      track.scrollWidth - viewport.offsetWidth,
    );

    if (maxScroll <= 0) return;

    const distancia = 300;

    setPaused(true);

    setTimeout(() => {
      setPaused(false);
    }, 1000);

    let posicionActual = positionRef.current;

    if (direccion === "left") {
      posicionActual += distancia;
    } else {
      posicionActual -= distancia;
    }

    posicionActual = Math.min(
      0,
      Math.max(-maxScroll, posicionActual),
    );

    positionRef.current = posicionActual;
    track.style.transform = `translateX(${posicionActual}px)`;
  };

  /* ---------------------------------
   * Movimiento táctil para celular
   * --------------------------------- */
  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>,
  ) => {
    if (productos.length <= 1 || !canScroll) return;

    const touch = event.touches[0];

    isDraggingRef.current = true;
    touchStartXRef.current = touch.clientX;
    dragStartXRef.current = positionRef.current;

    setPaused(true);
  };

  const handleTouchMove = (
    event: React.TouchEvent<HTMLDivElement>,
  ) => {
    if (!isDraggingRef.current) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartXRef.current;

    const track = trackRef.current;
    const viewport = track?.parentElement;

    if (!track || !viewport) return;

    const maxScroll = Math.max(
      0,
      track.scrollWidth - viewport.offsetWidth,
    );

    const nuevaPosicion = Math.min(
      0,
      Math.max(
        -maxScroll,
        dragStartXRef.current + deltaX,
      ),
    );

    positionRef.current = nuevaPosicion;
    track.style.transform = `translateX(${nuevaPosicion}px)`;
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    setPaused(false);
  };

  if (!productos || productos.length === 0) return null;

  return (
    <section className="carrusel-section mb-8 w-full">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#2b172a] via-[#2a1a2e] to-[#1f1b30] p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] md:p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-3">
          <div className="flex items-start gap-2">
            <span className="text-2xl md:text-3xl">🎊</span>

            <div>
              <div className="text-sm text-white/80 md:text-base">
                Temporada:
              </div>

              <div className="text-lg font-extrabold tracking-wide text-white md:text-2xl">
                {temporadaActual.toUpperCase()}
              </div>

              <div className="-mt-0.5 text-[11px] text-white/60 md:mt-0 md:text-sm">
                Ofertas por tiempo limitado
              </div>
            </div>
          </div>
        </div>

        {canScroll && (
          <>
            <button
              onClick={() => moveManual("left")}
              className="carrusel-arrow carrusel-left hidden md:flex"
            >
              ‹
            </button>

            <button
              onClick={() => moveManual("right")}
              className="carrusel-arrow carrusel-right hidden md:flex"
            >
              ›
            </button>
          </>
        )}

        <div
          className="carrusel-viewport relative mt-3 w-full overflow-hidden md:mt-4"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={trackRef}
            className="flex gap-4 will-change-transform"
            style={{ width: "max-content" }}
          >
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="w-[260px] shrink-0"
              >
                <ProductoCard
                  producto={producto}
                  mostrarAcciones={mostrarAcciones}
                  onEliminado={onEliminarProducto}
                />
              </div>
            ))}
          </div>

          {canScroll && (
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
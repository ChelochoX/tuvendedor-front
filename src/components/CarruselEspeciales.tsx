import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ProductoCard from "./ProductoCard";
import { Producto } from "../types/producto";

import "../styles/carrusel.css";

interface Props {
  productos: Producto[];
  mostrarAcciones?: boolean;
  onEliminarProducto?: (id: number) => void;
}

/*
 * En celular no utilizamos autoplay.
 *
 * En escritorio solamente se activa cuando existen
 * tres o más publicaciones para evitar reinicios bruscos.
 */
const MINIMO_PRODUCTOS_AUTOPLAY = 2;
const INTERVALO_AUTOPLAY_MS = 4500;

const CarruselEspeciales: React.FC<Props> = ({
  productos,
  mostrarAcciones = false,
  onEliminarProducto,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);

  const timeoutPausaRef = useRef<number | null>(null);

  const [indiceActivo, setIndiceActivo] = useState(0);

  const [puedeDesplazarse, setPuedeDesplazarse] = useState(false);

  const [pausado, setPausado] = useState(false);

  /* ---------------------------------
   * Temporada más frecuente
   * --------------------------------- */
  const temporadaActual = useMemo(() => {
    const nombres = productos
      .filter((producto) => producto.esTemporada && producto.badgeTexto)
      .map((producto) => producto.badgeTexto!.trim());

    if (nombres.length === 0) {
      return "Especiales";
    }

    const frecuencias = new Map<string, number>();

    for (const nombre of nombres) {
      frecuencias.set(nombre, (frecuencias.get(nombre) || 0) + 1);
    }

    let mejorNombre = nombres[0];

    let mayorCantidad = 0;

    for (const [nombre, cantidad] of frecuencias) {
      if (cantidad > mayorCantidad) {
        mejorNombre = nombre;

        mayorCantidad = cantidad;
      }
    }

    return mejorNombre;
  }, [productos]);

  /* ---------------------------------
   * Obtener elementos renderizados
   * --------------------------------- */
  const obtenerItems = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return [];
    }

    return Array.from(
      viewport.querySelectorAll<HTMLElement>("[data-carrusel-item]"),
    );
  }, []);

  /* ---------------------------------
   * Ir a una card concreta
   * --------------------------------- */
  const irAIndice = useCallback(
    (nuevoIndice: number, comportamiento: ScrollBehavior = "smooth") => {
      const viewport = viewportRef.current;

      const items = obtenerItems();

      if (!viewport || items.length === 0) {
        return;
      }

      const indiceNormalizado = (nuevoIndice + items.length) % items.length;

      const item = items[indiceNormalizado];

      viewport.scrollTo({
        left: item.offsetLeft,

        behavior: comportamiento,
      });

      setIndiceActivo(indiceNormalizado);
    },
    [obtenerItems],
  );

  /* ---------------------------------
   * Detectar si existe desplazamiento
   * --------------------------------- */
  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const actualizarLimites = () => {
      const tieneScroll = viewport.scrollWidth > viewport.clientWidth + 1;

      setPuedeDesplazarse(tieneScroll);

      if (!tieneScroll) {
        viewport.scrollTo({
          left: 0,
          behavior: "auto",
        });

        setIndiceActivo(0);
      }
    };

    actualizarLimites();

    const observer = new ResizeObserver(actualizarLimites);

    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, [productos]);

  /* ---------------------------------
   * Actualizar indicador al deslizar
   * --------------------------------- */
  const actualizarIndiceVisible = useCallback(() => {
    const viewport = viewportRef.current;

    const items = obtenerItems();

    if (!viewport || items.length === 0) {
      return;
    }

    let indiceMasCercano = 0;

    let menorDistancia = Number.POSITIVE_INFINITY;

    items.forEach((item, indice) => {
      const distancia = Math.abs(item.offsetLeft - viewport.scrollLeft);

      if (distancia < menorDistancia) {
        menorDistancia = distancia;

        indiceMasCercano = indice;
      }
    });

    setIndiceActivo(indiceMasCercano);
  }, [obtenerItems]);

  /* ---------------------------------
   * Reiniciar posición si cambian cards
   * --------------------------------- */
  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      left: 0,
      behavior: "auto",
    });

    setIndiceActivo(0);
  }, [productos]);

  /* ---------------------------------
   * Autoplay solo para escritorio
   * y con tres o más publicaciones
   * --------------------------------- */
  useEffect(() => {
    if (
      pausado ||
      !puedeDesplazarse ||
      productos.length < MINIMO_PRODUCTOS_AUTOPLAY
    ) {
      return;
    }

    const intervalo = window.setInterval(() => {
      const siguienteIndice = (indiceActivo + 1) % productos.length;

      irAIndice(siguienteIndice, "smooth");
    }, INTERVALO_AUTOPLAY_MS);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [indiceActivo, irAIndice, pausado, puedeDesplazarse, productos.length]);

  /* ---------------------------------
   * Pausar temporalmente
   * --------------------------------- */
  const pausarTemporalmente = () => {
    setPausado(true);

    if (timeoutPausaRef.current) {
      window.clearTimeout(timeoutPausaRef.current);
    }

    timeoutPausaRef.current = window.setTimeout(() => {
      setPausado(false);
    }, 1200);
  };

  /* ---------------------------------
   * Flechas manuales de escritorio
   * --------------------------------- */
  const moverManual = (direccion: "left" | "right") => {
    pausarTemporalmente();

    const diferencia = direccion === "left" ? -1 : 1;

    irAIndice(indiceActivo + diferencia);
  };

  if (!productos || productos.length === 0) {
    return null;
  }

  return (
    <section className="carrusel-section mb-6 w-full md:mb-8">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#2b172a] via-[#2a1a2e] to-[#1f1b30] p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] md:p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-3">
          <div className="flex items-start gap-2 px-1 pt-1 md:px-0 md:pt-0">
            <span className="text-xl md:text-3xl">🎊</span>

            <div>
              <div className="text-xs text-white/80 md:text-base">
                Temporada:
              </div>

              <div className="text-base font-extrabold tracking-wide text-white md:text-2xl">
                {temporadaActual.toUpperCase()}
              </div>

              <div className="text-[10px] text-white/60 md:text-sm">
                Ofertas por tiempo limitado
              </div>
            </div>
          </div>
        </div>

        <div className="carrusel-body relative mt-3 md:mt-4">
          {puedeDesplazarse && (
            <>
              <button
                type="button"
                aria-label="Ver publicación anterior"
                onClick={() => moverManual("left")}
                className="carrusel-arrow carrusel-left hidden md:flex"
              >
                ‹
              </button>

              <button
                type="button"
                aria-label="Ver publicación siguiente"
                onClick={() => moverManual("right")}
                className="carrusel-arrow carrusel-right hidden md:flex"
              >
                ›
              </button>
            </>
          )}

          <div
            ref={viewportRef}
            className="carrusel-viewport no-scrollbar"
            onScroll={actualizarIndiceVisible}
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
            onTouchStart={() => setPausado(true)}
            onTouchEnd={pausarTemporalmente}
          >
            {productos.map((producto) => (
              <div
                key={producto.id}
                data-carrusel-item
                className="carrusel-item"
              >
                <ProductoCard
                  producto={producto}
                  mostrarAcciones={mostrarAcciones}
                  onEliminado={onEliminarProducto}
                />
              </div>
            ))}
          </div>

          {puedeDesplazarse && (
            <>
              <div className="carrusel-fade carrusel-fade-left" />
              <div className="carrusel-fade carrusel-fade-right" />
            </>
          )}
        </div>

        {productos.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1.5 md:hidden">
            {productos.map((producto, indice) => (
              <button
                key={producto.id}
                type="button"
                aria-label={`Ver publicación ${indice + 1}`}
                onClick={() => irAIndice(indice)}
                className={
                  indice === indiceActivo
                    ? "h-1.5 w-5 rounded-full bg-yellow-400 transition-all"
                    : "h-1.5 w-1.5 rounded-full bg-white/30 transition-all"
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CarruselEspeciales;

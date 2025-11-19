import React, { useRef } from "react";
import ProductoCard from "./ProductoCard";
import { Producto } from "../types/producto";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  if (!productos || productos.length === 0) return null;

  return (
    <div className="max-w-screen-xl mx-auto mb-6 px-2">
      <h3 className="text-xl font-bold mb-3 text-yellow-400">
        🔥 Publicaciones Especiales
      </h3>

      <div className="relative flex items-center gap-2">
        {/* FLECHA IZQUIERDA */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex w-10 h-10 rounded-full bg-yellow-400 text-black font-bold 
          items-center justify-center shadow hover:bg-yellow-300 transition"
        >
          ‹
        </button>

        {/* CONTENEDOR DE SCROLL */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2"
        >
          {productos.map((p) => (
            <div key={p.id} className="shrink-0 w-[260px]">
              <ProductoCard
                producto={p}
                mostrarAcciones={mostrarAcciones}
                onEliminado={onEliminarProducto}
              />
            </div>
          ))}
        </div>

        {/* FLECHA DERECHA */}
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex w-10 h-10 rounded-full bg-yellow-400 text-black font-bold 
          items-center justify-center shadow hover:bg-yellow-300 transition"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default CarruselEspeciales;

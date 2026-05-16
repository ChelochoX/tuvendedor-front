import React, { useEffect, useState } from "react";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import { Producto } from "../../types/producto";
import { toggleFavoritoPublicacion } from "../../api/publicacionInteraccionesService";

type Props = {
  producto: Producto;
  className?: string;
  mostrarCantidad?: boolean;
};

const FavoritoButton: React.FC<Props> = ({
  producto,
  className = "",
  mostrarCantidad = true,
}) => {
  const [operando, setOperando] = useState(false);
  const [esFavorito, setEsFavorito] = useState(!!producto.esFavorito);
  const [cantidadFavoritos, setCantidadFavoritos] = useState(
    producto.cantidadFavoritos ?? 0,
  );

  useEffect(() => {
    setEsFavorito(!!producto.esFavorito);
    setCantidadFavoritos(producto.cantidadFavoritos ?? 0);
  }, [producto.id, producto.esFavorito, producto.cantidadFavoritos]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (operando || producto.estado === "Vendido") return;

    try {
      setOperando(true);

      const data = await toggleFavoritoPublicacion(producto.id);

      setEsFavorito(data.esFavorito);
      setCantidadFavoritos(data.cantidadFavoritos);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar favorito",
        text: error?.message || "Ocurrió un error",
        background: "#1e1f23",
        color: "#fff",
      });
    } finally {
      setOperando(false);
    }
  };

  if (producto.estado === "Vendido") return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={operando}
      title={esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={[
        "z-30 flex flex-col items-center justify-center gap-[2px]",
        "bg-transparent border-0 outline-none",
        "transition duration-200 ease-out",
        "hover:scale-110 active:scale-95",
        "disabled:cursor-wait disabled:opacity-70",
        className,
      ].join(" ")}
    >
      {esFavorito ? (
        <HeartSolidIcon className="h-7 w-7 text-red-500 drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]" />
      ) : (
        <HeartOutlineIcon className="h-7 w-7 text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)]" />
      )}

      {mostrarCantidad && cantidadFavoritos > 0 && (
        <span className="min-w-[18px] rounded-full bg-white/95 px-1.5 py-[1px] text-center text-[10px] font-extrabold leading-none text-red-500 shadow-md">
          {cantidadFavoritos}
        </span>
      )}
    </button>
  );
};

export default FavoritoButton;
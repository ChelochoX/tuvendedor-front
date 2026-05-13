import React, { useEffect, useState } from "react";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import { Producto } from "../../types/producto";
import { toggleFavoritoPublicacion } from "../../api/publicacionInteraccionesService";

type Props = {
  producto: Producto;
  className?: string;
};

const FavoritoButton: React.FC<Props> = ({ producto, className = "" }) => {
  const [operando, setOperando] = useState(false);
  const [esFavorito, setEsFavorito] = useState(!!producto.esFavorito);

  useEffect(() => {
    setEsFavorito(!!producto.esFavorito);
  }, [producto.id, producto.esFavorito]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (operando || producto.estado === "Vendido") return;

    try {
      setOperando(true);

      const data = await toggleFavoritoPublicacion(producto.id);

      setEsFavorito(data.esFavorito);
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
        "z-30 inline-flex items-center justify-center",
        "transition duration-200 ease-out",
        "hover:scale-110 active:scale-95",
        "disabled:cursor-wait disabled:opacity-70",
        "bg-transparent border-0 outline-none",
        className,
      ].join(" ")}
    >
      {esFavorito ? (
        <HeartSolidIcon className="h-7 w-7 text-red-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]" />
      ) : (
        <HeartOutlineIcon className="h-7 w-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]" />
      )}
    </button>
  );
};

export default FavoritoButton;
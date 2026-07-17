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
    Number(producto.cantidadFavoritos ?? 0),
  );

  useEffect(() => {
    setEsFavorito(!!producto.esFavorito);
    setCantidadFavoritos(Number(producto.cantidadFavoritos ?? 0));
  }, [producto.id, producto.esFavorito, producto.cantidadFavoritos]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (operando || producto.estado === "Vendido") return;

    try {
      setOperando(true);

      const data = await toggleFavoritoPublicacion(producto.id);

      setEsFavorito(data.esFavorito);
      setCantidadFavoritos(Number(data.cantidadFavoritos ?? 0));
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
        "z-30 flex flex-col items-center justify-center gap-1",
        "border-0 bg-transparent p-0 outline-none",
        "disabled:cursor-wait disabled:opacity-70",
        className,
      ].join(" ")}
    >
      <span
        className={[
          "flex h-8 w-8 items-center justify-center rounded-full",
          "bg-black/22",
          "shadow-[0_2px_8px_rgba(0,0,0,0.28)]",
          "backdrop-blur-[3px]",
          "transition-[background-color,box-shadow] duration-200",
          "hover:bg-black/32",
          "hover:shadow-[0_4px_12px_rgba(0,0,0,0.32)]",
        ].join(" ")}
      >
        {esFavorito ? (
          <HeartSolidIcon className="h-[18px] w-[18px] text-red-500 drop-shadow-sm" />
        ) : (
          <HeartOutlineIcon className="h-[18px] w-[18px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]" />
        )}
      </span>

      {mostrarCantidad && (
        <span
          className={[
            "min-w-[18px] rounded-full",
            "bg-black/22",
            "px-1 py-[1px] text-center",
            "text-[8px] font-extrabold leading-none text-white",
            "shadow-sm backdrop-blur-[3px]",
          ].join(" ")}
        >
          {cantidadFavoritos}
        </span>
      )}
    </button>
  );
};

export default FavoritoButton;

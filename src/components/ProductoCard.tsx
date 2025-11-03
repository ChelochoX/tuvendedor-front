import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Producto } from "../types/producto";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Props {
  producto: Producto;
}

const ProductoCard: React.FC<Props> = ({ producto }) => {
  const [favorito, setFavorito] = useState(false);

  return (
    <Link to={`/producto/${producto.id}`} className="block">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition duration-200 cursor-pointer overflow-hidden ring-1 ring-transparent hover:ring-yellow-500 flex flex-col h-full">
        <div className="w-full aspect-[4/3] relative overflow-hidden rounded-t-lg bg-black">
          {producto.imagenes[0]?.mainUrl?.endsWith(".mp4") ? (
            <video
              src={producto.imagenes[0]?.mainUrl}
              className="w-full h-full object-cover absolute top-0 left-0"
              muted
              autoPlay
              loop
              playsInline
            />
          ) : (
            <img
              src={
                producto.imagenes[0]?.thumbUrl || producto.imagenes[0]?.mainUrl
              }
              alt={producto.nombre}
              className="w-full h-full object-cover absolute top-0 left-0"
            />
          )}
        </div>

        <div className="p-3 text-sm relative flex flex-col flex-1">
          <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-1 line-clamp-2">
            {producto.nombre}
          </h3>

          <p className="text-green-600 font-bold text-sm mb-1">
            {producto.precio.toLocaleString()} ₲
          </p>

          <p className="text-xs text-gray-500">{producto.ubicacion}</p>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <img
                src={producto.vendedor.avatar}
                alt={producto.vendedor.nombre}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-xs text-gray-500">
                {producto.vendedor.nombre}
              </span>
            </div>
            <div className="flex gap-2">
              {/* Botón Editar */}
              <button
                className="text-gray-400 hover:text-blue-500 transition"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Editar producto", producto.id);
                }}
              >
                <PencilSquareIcon className="w-5 h-5" />
              </button>

              {/* Botón Eliminar */}
              <button
                className="text-gray-400 hover:text-red-500 transition"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Eliminar producto", producto.id);
                }}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductoCard;

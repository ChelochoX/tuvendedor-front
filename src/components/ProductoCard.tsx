import React, { useState } from "react";
import { Producto } from "../types/producto";

interface Props {
  producto: Producto;
}

const ProductoCard: React.FC<Props> = ({ producto }) => {
  const [favorito, setFavorito] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition duration-200 cursor-pointer max-w-xs overflow-hidden ring-1 ring-transparent hover:ring-yellow-500">
      {/* Imagen más grande */}
      <img
        src={producto.imagen}
        alt={producto.nombre}
        className="w-full h-56 object-cover transition duration-200"
      />

      {/* Contenido comprimido */}
      <div className="p-3 text-sm relative">
        <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-1">
          {producto.nombre}
        </h3>

        <p className="text-green-600 font-bold text-sm mb-1">
          {producto.precio.toLocaleString()} ₲
        </p>

        <p className="text-xs text-gray-500">{producto.ubicacion}</p>

        {/* Vendedor + Corazón */}
        <div className="flex items-center justify-between mt-2">
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

          {/* Botón de favorito */}
          <button
            className="text-gray-400 hover:text-red-500 transition"
            onClick={(e) => {
              e.stopPropagation();
              setFavorito(!favorito);
            }}
          >
            {favorito ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="red"
                viewBox="0 0 24 24"
                stroke="red"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 8.25C3 5.764 5.014 3.75 7.5 3.75c1.657 0 3.09.896 3.875 2.224C12.41 4.646 13.843 3.75 15.5 3.75 17.986 3.75 20 5.764 20 8.25c0 7.25-8 11.25-8 11.25S3 15.5 3 8.25z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 8.25C3 5.764 5.014 3.75 7.5 3.75c1.657 0 3.09.896 3.875 2.224C12.41 4.646 13.843 3.75 15.5 3.75 17.986 3.75 20 5.764 20 8.25c0 7.25-8 11.25-8 11.25S3 15.5 3 8.25z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoCard;

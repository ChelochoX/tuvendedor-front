import React, { useState } from "react";
import { Link } from "react-router-dom"; // 👈 Importar Link
import { Producto } from "../types/producto";

interface Props {
  producto: Producto;
}

const ProductoCard: React.FC<Props> = ({ producto }) => {
  const [favorito, setFavorito] = useState(false);

  return (
    <Link to={`/producto/${producto.id}`} className="block">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition duration-200 cursor-pointer overflow-hidden ring-1 ring-transparent hover:ring-yellow-500 flex flex-col h-full">
        <div className="aspect-square w-full bg-gray-100 rounded-xl overflow-hidden">
          <img
            src={
              producto.imagenes[0]?.thumbUrl || producto.imagenes[0]?.mainUrl
            }
            alt={producto.nombre}
            className="w-full h-56 object-cover transition duration-200"
          />
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

            <button
              className="text-gray-400 hover:text-red-500 transition"
              onClick={(e) => {
                e.preventDefault(); // 👈 evitar navegación
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
                    d="M3 8.25C3 5.764 5.014 3.75..."
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
                    d="M3 8.25C3 5.764 5.014 3.75..."
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductoCard;

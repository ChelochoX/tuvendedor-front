import React from "react";
import { Producto } from "../types/producto";

interface Props {
  producto: Producto;
}

const ProductoCard: React.FC<Props> = ({ producto }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <img
        src={producto.imagen}
        alt={producto.nombre}
        className="w-full aspect-video object-cover rounded-t-2xl"
      />

      <div className="p-3">
        <h3 className="text-sm font-semibold line-clamp-2 mb-1">
          {producto.nombre}
        </h3>
        <p className="text-green-600 font-bold text-sm">
          {producto.precio.toLocaleString()} ₲
        </p>
        <p className="text-xs text-gray-500">{producto.ubicacion}</p>

        <div className="flex items-center gap-2 mt-2">
          <img
            src={producto.vendedor.avatar}
            alt={producto.vendedor.nombre}
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-xs text-gray-500">
            {producto.vendedor.nombre}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductoCard;

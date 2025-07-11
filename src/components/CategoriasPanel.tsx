import React from "react";
import { Categoria } from "../types/categoria";

interface Props {
  categorias: Categoria[];
  categoriaSeleccionada: Categoria | null;
  onSelect: (categoria: Categoria) => void;
}

const CategoriasPanel: React.FC<Props> = ({
  categorias,
  categoriaSeleccionada,
  onSelect,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {categorias.map((cat) => {
        const esSeleccionada = categoriaSeleccionada?.id === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-all duration-200 font-medium 
              ${
                esSeleccionada
                  ? "bg-yellow-400 text-black"
                  : "text-white hover:bg-yellow-500 hover:text-black"
              }`}
          >
            <span className="text-lg">{cat.icono}</span>
            <span>{cat.nombre}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoriasPanel;

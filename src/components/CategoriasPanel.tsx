import React from "react";
import { Categoria } from "../types/categoria";
import AddIcon from "@mui/icons-material/Add";

interface Props {
  categorias: Categoria[];
  categoriaSeleccionada: Categoria | null;
  onSelect: (categoria: Categoria) => void;
  onCrearPublicacion: () => void;
}

const CategoriasPanel: React.FC<Props> = ({
  categorias,
  categoriaSeleccionada,
  onSelect,
  onCrearPublicacion,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {/* Botón Crear publicación */}
      <button
        className="flex items-center gap-2 justify-center px-4 py-2 mb-2 rounded-full bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-300 transition-all"
        onClick={onCrearPublicacion}
      >
        <AddIcon fontSize="small" />
        Crear publicación
      </button>

      {/* Línea divisoria */}
      <hr className="border-t border-gray-600 mb-2" />

      {/* Listado de categorías */}
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

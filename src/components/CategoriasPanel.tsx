import React from "react";
import { Categoria } from "../types/categoria";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person"; // 👤 icono de clientes
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  // 🔹 Redirige a la pantalla de clientes
  const irAClientes = () => {
    navigate("/clientes");
  };

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

      {/* Botón al pie del panel */}
      <div className="mt-4">
        <button
          onClick={irAClientes}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold 
                     text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black 
                     transition-all duration-300"
        >
          <PersonIcon fontSize="small" />
          Gestionar Clientes
        </button>
      </div>
    </div>
  );
};

export default CategoriasPanel;

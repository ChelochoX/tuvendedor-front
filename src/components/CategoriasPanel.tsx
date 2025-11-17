// src/components/CategoriasPanel.tsx
import React from "react";
import { Categoria } from "../types/categoria";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import { useNavigate } from "react-router-dom";
import { useUsuario } from "../context/UsuarioContext";

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
  const { esVisitante, puedePublicar, puedeVerClientes } = useUsuario();

  return (
    <div className="flex flex-col gap-3">
      {/* 🟨 Título */}
      <h3 className="text-lg font-semibold text-yellow-400 px-1">Categorías</h3>

      <hr className="border-yellow-400 opacity-40" />

      {/* 🟦 LISTA DE CATEGORÍAS CON SCROLL */}
      <div className="flex flex-col gap-1 overflow-y-auto max-h-[300px] pr-2">
        {categorias.map((cat) => {
          const esSel = categoriaSeleccionada?.id === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat)}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-all
                ${
                  esSel
                    ? "bg-yellow-400 text-black font-semibold"
                    : "text-white hover:bg-[#3b3b3b]"
                }
              `}
            >
              <span className="text-lg">{cat.icono}</span>
              <span className="truncate">{cat.nombre}</span>
            </button>
          );
        })}
      </div>

      {/* 🟨 Separador */}
      <hr className="border-yellow-400 opacity-40 mt-2" />

      {/* 🟡 Crear publicación (debajo de la lista) */}
      {puedePublicar && (
        <button
          className="flex items-center gap-2 justify-center px-4 py-2 rounded-full bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-300 transition-all"
          onClick={onCrearPublicacion}
        >
          <AddIcon fontSize="small" />
          Crear publicación
        </button>
      )}

      {/* 📚 Mis publicaciones */}
      {!esVisitante && puedePublicar && (
        <>
          <hr className="border-yellow-400 opacity-40" />

          <button
            onClick={() =>
              window.dispatchEvent(new Event("ver-mis-publicaciones"))
            }
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full font-semibold 
              text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black 
              transition-all duration-300"
          >
            <LibraryBooksIcon fontSize="small" />
            Mis publicaciones
          </button>
        </>
      )}

      {/* 👤 Gestionar Clientes */}
      {puedeVerClientes && (
        <>
          <hr className="border-yellow-400 opacity-40" />

          <button
            onClick={() => navigate("/clientes")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full font-semibold 
              text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black 
              transition-all duration-300"
          >
            <PersonIcon fontSize="small" />
            Gestionar Clientes
          </button>
        </>
      )}
    </div>
  );
};

export default CategoriasPanel;

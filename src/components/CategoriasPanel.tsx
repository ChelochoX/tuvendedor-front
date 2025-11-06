// src/components/CategoriasPanel.tsx
import React from "react";
import { Categoria } from "../types/categoria";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import { useNavigate } from "react-router-dom";
import { useUsuario } from "../context/UsuarioContext"; // 👈 Ahora usamos los helpers centralizados

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
  const { esVisitante, puedePublicar, puedeVerClientes } = useUsuario(); // ✅ Todo el control de roles viene del contexto

  const irAClientes = () => navigate("/clientes");

  return (
    <div className="flex flex-col gap-2">
      {/* 🟡 Botón Crear publicación */}
      {puedePublicar && (
        <button
          className="flex items-center gap-2 justify-center px-4 py-2 mb-2 rounded-full bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-300 transition-all"
          onClick={onCrearPublicacion}
        >
          <AddIcon fontSize="small" />
          Crear publicación
        </button>
      )}

      {/* 🟨 Separador */}
      <hr className="border-t-2 border-yellow-400 opacity-60 my-2" />

      {/* 🌐 Listado de categorías */}
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

      {/* 🟨 Separador */}
      <hr className="border-t-2 border-yellow-400 opacity-60 my-3" />

      {/* 📚 Mis publicaciones (solo si puede publicar: vendedor o admin) */}
      {!esVisitante && puedePublicar && (
        <button
          onClick={() =>
            window.dispatchEvent(new Event("ver-mis-publicaciones"))
          }
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold 
               text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black 
               transition-all duration-300"
        >
          <LibraryBooksIcon fontSize="small" />
          Mis publicaciones
        </button>
      )}

      {/* 🟨 Separador (solo si se muestran botones de permisos) */}
      {puedeVerClientes && (
        <hr className="border-t-2 border-yellow-400 opacity-60 my-3" />
      )}

      {/* 👤 Gestionar Clientes (solo si es administrador) */}
      {puedeVerClientes && (
        <button
          onClick={irAClientes}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold 
                     text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black 
                     transition-all duration-300"
        >
          <PersonIcon fontSize="small" />
          Gestionar Clientes
        </button>
      )}
    </div>
  );
};

export default CategoriasPanel;

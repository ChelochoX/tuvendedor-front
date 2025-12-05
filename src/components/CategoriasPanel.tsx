import React, { useState } from "react";
import { Categoria } from "../types/categoria";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import { useNavigate } from "react-router-dom";
import { useUsuario } from "../context/UsuarioContext";
import Swal from "sweetalert2";
import { enviarSugerencia as enviarSugerenciaService } from "../api/publicacionesService";
import SugerenciaModal from "./SugerenciaModal";

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
  const [abrirSugerencia, setAbrirSugerencia] = useState(false);

  const enviarSugerencia = async (comentario: string) => {
    try {
      await enviarSugerenciaService(comentario);
      Swal.fire({
        title: "¡Gracias por tu aporte!",
        text: "Tu sugerencia fue enviada.",
        icon: "success",
        confirmButtonColor: "#facc15",
      });
    } catch {
      Swal.fire({
        title: "Error",
        text: "No se pudo enviar.",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 🔥 SOLO EN MOVIL ACCIONES RÁPIDAS */}
      <div className="flex flex-col gap-2 mb-3 md:hidden">
        {puedePublicar && (
          <button
            className="px-4 py-2 rounded-full bg-yellow-400 text-black font-semibold"
            onClick={onCrearPublicacion}
          >
            <AddIcon fontSize="small" /> Crear publicación
          </button>
        )}

        {!esVisitante && puedePublicar && (
          <button
            onClick={() =>
              window.dispatchEvent(new Event("ver-mis-publicaciones"))
            }
            className="px-4 py-2 rounded-full border border-yellow-400 text-yellow-400 font-semibold"
          >
            <LibraryBooksIcon fontSize="small" /> Mis publicaciones
          </button>
        )}

        {puedeVerClientes && (
          <button
            onClick={() => navigate("/clientes")}
            className="px-4 py-2 rounded-full border border-yellow-400 text-yellow-400 font-semibold"
          >
            <PersonIcon fontSize="small" /> Gestionar Clientes
          </button>
        )}

        {/* 🔥 CERRAR PANEL */}
        <button
          className="text-center py-1 text-yellow-400 underline"
          onClick={() => window.dispatchEvent(new Event("cerrar-sidebar"))}
        >
          Cerrar
        </button>

        <hr className="border-yellow-400 opacity-40" />
      </div>

      {/* 🔥 LISTA DE CATEGORÍAS */}
      <h3 className="text-lg font-semibold text-yellow-400 px-1">Categorías</h3>

      <div className="scroll-elegante flex flex-col gap-1 overflow-y-auto mt-2 h-[300px] pr-2">
        {categorias.map((cat) => {
          const esSel = categoriaSeleccionada?.id === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                esSel ? "bg-yellow-400 text-black font-semibold" : "text-white"
              }`}
            >
              <span className="text-lg">{cat.icono}</span>
              <span>{cat.nombre}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4">
        {/* FOOTER SOLO ESCRITORIO */}
        <div className="hidden md:block text-xs text-gray-400 mt-4 border-t border-yellow-400 pt-3">
          Desarrollado por{" "}
          <a
            href="https://www.graciatech.com.py"
            target="_blank"
            className="text-yellow-400 font-semibold"
          >
            Gracia Tech
          </a>
          <br />
          <a
            href="mailto:soporte@tuvendedor.com.py"
            className="text-gray-400 hover:text-yellow-400"
          >
            soporte@tuvendedor.com.py
          </a>
          <button
            onClick={() => setAbrirSugerencia(true)}
            className="block mt-2 text-yellow-400 underline"
          >
            Enviar sugerencia
          </button>
        </div>

        {/* FOOTER SOLO MÓVIL */}
        <div className="md:hidden text-xs text-gray-400 mt-2">
          <div className="border-t border-yellow-400 pt-3">
            <span>
              Desarrollado por{" "}
              <a
                href="https://www.graciatech.com.py"
                target="_blank"
                className="text-yellow-400 font-semibold"
              >
                Gracia Tech
              </a>
            </span>
            <br />
            <a
              href="mailto:soporte@tuvendedor.com.py"
              className="text-yellow-400 underline"
            >
              soporte@tuvendedor.com.py
            </a>
            <button
              onClick={() => setAbrirSugerencia(true)}
              className="block mt-2 text-yellow-400 underline"
            >
              Enviar sugerencia
            </button>
          </div>
        </div>

        {/* Modal */}
        <SugerenciaModal
          abierto={abrirSugerencia}
          onClose={() => setAbrirSugerencia(false)}
          onEnviar={enviarSugerencia}
        />
      </div>
    </div>
  );
};

export default CategoriasPanel;

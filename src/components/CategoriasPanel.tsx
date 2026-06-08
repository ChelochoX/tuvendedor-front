// src/components/CategoriasPanel.tsx
import React, { useState } from "react";
import { Categoria } from "../types/categoria";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import PublicIcon from "@mui/icons-material/Public";
import { useNavigate } from "react-router-dom";
import { useUsuario } from "../context/UsuarioContext";
import Swal from "sweetalert2";
import { enviarSugerencia as enviarSugerenciaService } from "../api/publicacionesService";
import SugerenciaModal from "./SugerenciaModal";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

interface Props {
  categorias: Categoria[];
  categoriaSeleccionada: Categoria | null;
  onSelect: (categoria: Categoria) => void;
  onCrearPublicacion: () => void;
  onCerrarSidebar?: () => void;
}

const CategoriasPanel: React.FC<Props> = ({
  categorias,
  categoriaSeleccionada,
  onSelect,
  onCrearPublicacion,
  onCerrarSidebar,
}) => {
  const navigate = useNavigate();

  const { esVisitante, puedePublicar, puedeVerClientes, esAdmin } =
    useUsuario();

  const [abrirSugerencia, setAbrirSugerencia] = useState(false);

  const enviarSugerencia = async (comentario: string) => {
    try {
      await enviarSugerenciaService(comentario);

      Swal.fire({
        title: "¡Gracias por tu aporte! 💛",
        text: "Tu sugerencia fue enviada correctamente.",
        icon: "success",
        confirmButtonColor: "#facc15",
      });
    } catch {
      Swal.fire({
        title: "Error",
        text: "No se pudo enviar la sugerencia.",
        icon: "error",
      });
    }
  };

  const irAMiVitrinaPublica = () => {
    navigate("/clientes/perfil-vendedor");
    onCerrarSidebar?.();
  };

  const irAGestionClientes = () => {
    navigate("/clientes");
    onCerrarSidebar?.();
  };

  const irAServiciosPremium = () => {
    navigate("/admin/servicios-premium");
    onCerrarSidebar?.();
  };

  const verMisPublicaciones = () => {
    window.dispatchEvent(new Event("ver-mis-publicaciones"));
    onCerrarSidebar?.();
  };

  return (
    <div className="flex flex-col h-full justify-start">
      {/* 🔥 ENCABEZADO MOBILE */}
      <div className="flex flex-col gap-2 mb-0 md:hidden px-1">
        {!esVisitante && puedePublicar && (
          <>
            <button
              onClick={verMisPublicaciones}
              className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-sm 
                text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black transition-all"
            >
              <LibraryBooksIcon fontSize="small" />
              Mis publicaciones
            </button>

            <button
              onClick={irAMiVitrinaPublica}
              className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-sm 
                text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black transition-all"
            >
              <PublicIcon fontSize="small" />
              Mi vitrina pública
            </button>
          </>
        )}

        {puedeVerClientes && (
          <button
            onClick={irAGestionClientes}
            className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-sm 
              text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black transition-all"
          >
            <PersonIcon fontSize="small" />
            Gestionar Clientes
          </button>
        )}

        {esAdmin && (
          <button
            onClick={irAServiciosPremium}
            className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-sm 
           text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black transition-all"
          >
            <WorkspacePremiumIcon fontSize="small" />
            Servicios Premium
          </button>
        )}

        <hr className="border-yellow-400 opacity-40" />
      </div>

      {/* 🔥 LISTA DE CATEGORÍAS */}
      <div className="flex flex-col gap-1 md:gap-3">
        <h3 className="text-lg font-semibold text-yellow-400 px-1">
          Categorías
        </h3>

        {/* Ocultar en móvil */}
        <hr className="border-yellow-400 opacity-40 hidden md:block" />

        <div className="scroll-elegante flex flex-col gap-1 overflow-y-auto h-[400px] pr-2">
          {categorias.map((cat) => {
            const esSel = categoriaSeleccionada?.id === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelect(cat);
                  onCerrarSidebar?.();
                }}
                className={`flex items-center 
                  gap-1 md:gap-2
                  px-2 md:px-3
                  py-0.5 md:py-1
                  rounded-md text-xs md:text-sm transition-all
                  ${
                    esSel
                      ? "bg-yellow-400 text-black font-semibold"
                      : "text-white hover:bg-[#3b3b3b]"
                  }
                `}
              >
                <span className="text-base md:text-lg">{cat.icono}</span>
                <span className="truncate">{cat.nombre}</span>
              </button>
            );
          })}
        </div>

        {/* Ocultar en móvil */}
        <hr className="border-yellow-400 opacity-40 mt-2 hidden md:block" />

        {/* ESCRITORIO */}
        <div className="hidden md:flex flex-col gap-3">
          {puedePublicar && (
            <button
              className="flex items-center gap-2 justify-center px-4 py-2 rounded-full bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-300 transition-all"
              onClick={onCrearPublicacion}
            >
              <AddIcon fontSize="small" />
              Crear publicación
            </button>
          )}

          {!esVisitante && puedePublicar && (
            <>
              <hr className="border-yellow-400 opacity-40" />

              <button
                onClick={verMisPublicaciones}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full font-semibold 
                  text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black transition-all"
              >
                <LibraryBooksIcon fontSize="small" />
                Mis publicaciones
              </button>

              <button
                onClick={irAMiVitrinaPublica}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full font-semibold 
                  text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black transition-all"
              >
                <PublicIcon fontSize="small" />
                Mi vitrina pública
              </button>
            </>
          )}

          {puedeVerClientes && (
            <>
              <hr className="border-yellow-400 opacity-40" />

              <button
                onClick={irAGestionClientes}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full font-semibold 
                  text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black transition-all"
              >
                <PersonIcon fontSize="small" />
                Gestionar Clientes
              </button>
            </>
          )}

          {esAdmin && (
            <button
              onClick={irAServiciosPremium}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full font-semibold 
              text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black transition-all"
            >
              <WorkspacePremiumIcon fontSize="small" />
              Servicios Premium
            </button>
          )}
        </div>
      </div>

      {/* FOOTER — NO SE TOCA */}
      <div className="mt-4 pt-3 border-t border-yellow-400 opacity-40 text-center text-xs text-gray-400 flex flex-col gap-1">
        <span>
          Desarrollado por{" "}
          <a
            href="https://www.graciatech.com.py"
            onClick={onCerrarSidebar}
            target="_blank"
            rel="noreferrer"
            className="text-yellow-400 font-semibold hover:underline"
          >
            Gracia Tech
          </a>
        </span>

        <a
          href="mailto:soporte@tuvendedor.com.py"
          onClick={onCerrarSidebar}
          className="text-gray-400 hover:text-yellow-400 hover:underline"
        >
          soporte@tuvendedor.com.py
        </a>

        <button
          onClick={() => {
            setAbrirSugerencia(true);
            onCerrarSidebar?.();
          }}
          className="text-center w-full mt-2 text-yellow-400 hover:text-yellow-300 text-sm underline"
        >
          Enviar sugerencia
        </button>

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

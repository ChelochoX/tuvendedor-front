// src/components/CategoriasPanel.tsx
import React, { useState } from "react";
import { Categoria } from "../types/categoria";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import PublicIcon from "@mui/icons-material/Public";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import ImageIcon from "@mui/icons-material/Image";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useNavigate } from "react-router-dom";
import { useUsuario } from "../context/UsuarioContext";
import Swal from "sweetalert2";
import { enviarSugerencia as enviarSugerenciaService } from "../api/publicacionesService";
import SugerenciaModal from "./SugerenciaModal";
import { ADMIN_WHATSAPP } from "../config/comercialConfig";
import { construirLinkWhatsapp } from "../utils/whatsapp";

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

  const mensajeConsultaEspacios =
    "Hola, quiero consultar por espacios publicitarios en TuVendedor";

  const whatsappConsultaEspaciosUrl =
    construirLinkWhatsapp(ADMIN_WHATSAPP, mensajeConsultaEspacios) || "#";

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

  const irABannersPublicitarios = () => {
    navigate("/admin/banners-publicitarios");
    onCerrarSidebar?.();
  };

  const irADashboardComercial = () => {
    navigate("/admin/dashboard-comercial");
    onCerrarSidebar?.();
  };

  const verMisPublicaciones = () => {
    window.dispatchEvent(new Event("ver-mis-publicaciones"));
    onCerrarSidebar?.();
  };

  const botonAdminClass =
    "w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-full font-semibold text-sm text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black transition-all";

  const botonUsuarioClass =
    "w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-full font-semibold text-sm text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black transition-all";

  const botonMobileClass =
    "flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-sm text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black transition-all";

  return (
    <div className="flex h-full flex-col justify-start">
      {/* ENCABEZADO MOBILE */}
      <div className="mb-2 flex flex-col gap-2 px-1 md:hidden">
        {!esVisitante && puedePublicar && (
          <>
            <button onClick={verMisPublicaciones} className={botonMobileClass}>
              <LibraryBooksIcon fontSize="small" />
              Mis publicaciones
            </button>

            <button onClick={irAMiVitrinaPublica} className={botonMobileClass}>
              <PublicIcon fontSize="small" />
              Mi vitrina pública
            </button>
          </>
        )}

        {puedeVerClientes && (
          <button onClick={irAGestionClientes} className={botonMobileClass}>
            <PersonIcon fontSize="small" />
            Gestionar Clientes
          </button>
        )}

        {esAdmin && (
          <>
            <button
              onClick={irADashboardComercial}
              className={botonMobileClass}
            >
              <DashboardIcon fontSize="small" />
              Dashboard comercial
            </button>

            <button onClick={irAServiciosPremium} className={botonMobileClass}>
              <WorkspacePremiumIcon fontSize="small" />
              Servicios Premium
            </button>

            <button
              onClick={irABannersPublicitarios}
              className={botonMobileClass}
            >
              <ImageIcon fontSize="small" />
              Banners publicitarios
            </button>
          </>
        )}

        <hr className="border-yellow-400 opacity-40" />
      </div>

      {/* LISTA DE CATEGORÍAS MÁS COMPACTA */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-semibold text-yellow-400">
            Categorías
          </h3>

          <span className="hidden text-[10px] text-gray-400 md:inline">
            Filtrar
          </span>
        </div>

        <hr className="hidden border-yellow-400 opacity-40 md:block" />

        <div className="scroll-elegante flex h-[210px] flex-col gap-1 overflow-y-auto pr-2 md:h-[230px] xl:h-[250px]">
          {categorias.map((cat) => {
            const esSel = categoriaSeleccionada?.id === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelect(cat);
                  onCerrarSidebar?.();
                }}
                className={`flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-all md:text-[13px] ${
                  esSel
                    ? "bg-yellow-400 font-semibold text-black"
                    : "text-white hover:bg-[#3b3b3b]"
                }`}
              >
                <span className="text-base">{cat.icono}</span>
                <span className="truncate">{cat.nombre}</span>
              </button>
            );
          })}
        </div>

        <hr className="hidden border-yellow-400 opacity-40 md:block" />

        {/* BOTONES ESCRITORIO */}
        <div className="hidden flex-col gap-2 md:flex">
          {puedePublicar && (
            <button
              className="flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-4 py-2 font-semibold text-black shadow transition-all hover:bg-yellow-300"
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
                className={botonUsuarioClass}
              >
                <LibraryBooksIcon fontSize="small" />
                Mis publicaciones
              </button>

              <button
                onClick={irAMiVitrinaPublica}
                className={botonUsuarioClass}
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
                className={botonUsuarioClass}
              >
                <PersonIcon fontSize="small" />
                Gestionar Clientes
              </button>
            </>
          )}

          {esAdmin && (
            <>
              <button
                onClick={irADashboardComercial}
                className={botonAdminClass}
              >
                <DashboardIcon fontSize="small" />
                Dashboard comercial
              </button>

              <button onClick={irAServiciosPremium} className={botonAdminClass}>
                <WorkspacePremiumIcon fontSize="small" />
                Servicios Premium
              </button>

              <button
                onClick={irABannersPublicitarios}
                className={botonAdminClass}
              >
                <ImageIcon fontSize="small" />
                Banners publicitarios
              </button>
            </>
          )}
        </div>
      </div>

      {/* BLOQUE COMERCIAL */}
      <div className="mt-3 rounded-xl border border-yellow-400/40 bg-yellow-400/5 p-3">
        <div className="flex items-start gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-yellow-400/40 bg-yellow-400/10 text-yellow-400">
            📣
          </div>

          <div>
            <p className="text-sm font-bold text-white">Anunciá tu negocio</p>

            <p className="mt-1 text-xs leading-5 text-white">
              Tu empresa puede aparecer en banners dentro de Tu Vendedor y
              llegar a más personas desde la portada del marketplace.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            window.open(
              whatsappConsultaEspaciosUrl,
              "_blank",
              "noopener,noreferrer",
            );
          }}
          className="mt-3 w-full rounded-full bg-yellow-400 px-3 py-2 text-sm font-bold text-black transition hover:bg-yellow-300"
        >
          Consultar espacios
        </button>
      </div>

      {/* FOOTER */}
      <div className="mt-3 flex flex-col gap-2 rounded-xl border border-yellow-400/30 bg-white/5 p-3 text-center text-xs text-gray-400">
        <span>
          Desarrollado por{" "}
          <a
            href="https://www.graciatech.com.py"
            onClick={onCerrarSidebar}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-yellow-400 hover:underline"
          >
            Gracia Tech
          </a>
        </span>

        <a
          href="mailto:soporte@tuvendedor.com.py"
          onClick={onCerrarSidebar}
          className="rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-gray-300 hover:text-yellow-400"
        >
          soporte@tuvendedor.com.py
        </a>

        <button
          onClick={() => {
            setAbrirSugerencia(true);
            onCerrarSidebar?.();
          }}
          className="rounded-full border border-yellow-400/40 px-3 py-1.5 text-center text-xs font-semibold text-yellow-400 hover:bg-yellow-400 hover:text-black"
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

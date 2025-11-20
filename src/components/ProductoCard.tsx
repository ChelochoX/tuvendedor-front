import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Producto } from "../types/producto";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import {
  eliminarPublicacion,
  destacarPublicacion,
  activarTemporada,
  desactivarTemporada,
  obtenerTemporadas,
} from "../api/publicacionesService";

interface Props {
  producto: Producto;
  onEliminado?: (id: number) => void;
  mostrarAcciones?: boolean;
  /** Tamaño de la card */
  variant?: "default" | "compact";
  /** ⬅️ Nuevo: permiso para activar “Especial” */
  puedeActivarEspecial?: boolean;
}

const ProductoCard: React.FC<Props> = ({
  producto,
  onEliminado,
  mostrarAcciones = false,
  variant = "default",
  puedeActivarEspecial = false,
}) => {
  const [eliminando, setEliminando] = useState(false);
  const [operandoEspecial, setOperandoEspecial] = useState(false);
  const [operandoDestacado, setOperandoDestacado] = useState(false);

  const isCompact = variant === "compact";

  // Si en tu modelo tienes fecha fin de temporada, úsala aquí.
  // Por ahora tomamos el booleano tal cual.
  const especialActivo = !!producto.esTemporada;
  const destacadoActivo = !!producto.esDestacada;

  const handleEliminar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirm = await Swal.fire({
      title: "¿Eliminar publicación?",
      text: "Esta acción eliminará también las imágenes y videos asociados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#facc15",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#1e1f23",
      color: "#fff",
    });
    if (!confirm.isConfirmed) return;

    try {
      setEliminando(true);

      Swal.fire({
        title: "Eliminando...",
        text: "Por favor, esperá un momento.",
        allowOutsideClick: false,
        showConfirmButton: false,
        background: "#1e1f23",
        color: "#fff",
        didOpen: () => Swal.showLoading(),
      });

      await eliminarPublicacion(producto.id);

      Swal.fire({
        icon: "success",
        title: "Publicación eliminada",
        timer: 1600,
        showConfirmButton: false,
        background: "#1e1f23",
        color: "#fff",
      });

      onEliminado?.(producto.id);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: error?.message ?? "Ocurrió un error",
        background: "#1e1f23",
        color: "#fff",
      });
    } finally {
      setEliminando(false);
    }
  };

  const pedirDiasDestacado = async (): Promise<number | null> => {
    const res = await Swal.fire({
      title: "⭐ Destacar publicación",
      html: `
        <p style="color:#ddd">Elegí cuántos días querés destacar.</p>
        <select id="dias" class="swal2-input" style="color:black;">
          <option value="7">7 días</option>
          <option value="15">15 días</option>
          <option value="30">30 días</option>
        </select>`,
      showCancelButton: true,
      confirmButtonText: "Destacar",
      background: "#1e1f23",
      color: "#fff",
      preConfirm: () =>
        Number((document.getElementById("dias") as HTMLSelectElement).value),
    });
    return res.isConfirmed ? (res.value as number) : null;
  };

  const activarEspecialFlow = async () => {
    // 1) No permiso → aviso y fuera
    if (!puedeActivarEspecial) {
      await Swal.fire({
        icon: "info",
        title: "Función para cuentas Premium",
        html:
          `<p style="color:#ddd;margin-top:6px">` +
          `“Publicación especial” está disponible para usuarios con permiso Premium.<br/>` +
          `Contactá con soporte para habilitarlo.` +
          `</p>`,
        background: "#1e1f23",
        color: "#fff",
        confirmButtonColor: "#facc15",
        confirmButtonText: "Entendido",
      });
      return;
    }

    // 2) Ya activo → ofrecer desactivar
    if (especialActivo) {
      const confirm = await Swal.fire({
        title: "¿Quitar de publicación especial?",
        icon: "warning",
        showCancelButton: true,
        background: "#1e1f23",
        color: "#fff",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Quitar",
        cancelButtonText: "Cancelar",
      });
      if (!confirm.isConfirmed) return;

      try {
        setOperandoEspecial(true);
        await desactivarTemporada(producto.id);

        Swal.fire({
          icon: "success",
          title: "Quitado de publicaciones especiales",
          timer: 1400,
          showConfirmButton: false,
          background: "#1e1f23",
          color: "#fff",
        });

        window.dispatchEvent(new Event("actualizar-publicaciones"));
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "No se pudo quitar",
          text: err?.message ?? "Ocurrió un error",
          background: "#1e1f23",
          color: "#fff",
        });
      } finally {
        setOperandoEspecial(false);
      }
      return;
    }

    // 3) Activar → elegir temporada
    try {
      const temporadas = await obtenerTemporadas();
      if (!temporadas || temporadas.length === 0) {
        await Swal.fire({
          icon: "info",
          title: "Sin temporadas",
          text: "El administrador no configuró temporadas.",
          background: "#1e1f23",
          color: "#fff",
        });
        return;
      }

      const opciones = temporadas
        .map((t) => `<option value="${t.id}">${t.nombre}</option>`)
        .join("");

      const res = await Swal.fire({
        title: "🎉 Publicación especial",
        html: `
          <p style="color:#ccc;">Seleccioná la temporada:</p>
          <select id="temporada" class="swal2-input" style="color:black;">
            ${opciones}
          </select>`,
        showCancelButton: true,
        background: "#1e1f23",
        color: "#fff",
        confirmButtonText: "Activar",
        preConfirm: () =>
          Number(
            (document.getElementById("temporada") as HTMLSelectElement).value
          ),
      });
      if (!res.isConfirmed) return;

      setOperandoEspecial(true);
      await activarTemporada(producto.id, res.value);

      Swal.fire({
        icon: "success",
        title: "🎉 Activado como publicación especial",
        timer: 1500,
        showConfirmButton: false,
        background: "#1e1e1e",
        color: "#fff",
      });

      window.dispatchEvent(new Event("actualizar-publicaciones"));
    } catch (err: any) {
      // Muestra exactamente el mensaje del backend (ej: “No tienes permiso…”)
      Swal.fire({
        icon: "error",
        title: "No se pudo activar",
        text: err?.message ?? "Ocurrió un error",
        background: "#1e1f23",
        color: "#fff",
      });
    } finally {
      setOperandoEspecial(false);
    }
  };

  const destacarFlow = async () => {
    if (destacadoActivo) return;

    const dias = await pedirDiasDestacado();
    if (dias == null) return;

    try {
      setOperandoDestacado(true);
      await destacarPublicacion(producto.id, dias);

      Swal.fire({
        icon: "success",
        title: "⭐ Publicación destacada",
        timer: 1400,
        showConfirmButton: false,
        background: "#1e1e1e",
        color: "#fff",
      });

      window.dispatchEvent(new Event("actualizar-publicaciones"));
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "No se pudo destacar",
        text: err?.message ?? "Ocurrió un error",
        background: "#1e1f23",
        color: "#fff",
      });
    } finally {
      setOperandoDestacado(false);
    }
  };

  return (
    <Link to={`/producto/${producto.id}`} className="block">
      <div
        className={[
          "bg-white rounded-2xl shadow-sm hover:shadow-md transition duration-200 cursor-pointer",
          "overflow-hidden flex flex-col h-full ring-1 ring-transparent hover:ring-yellow-500",
          destacadoActivo ? "ring-2 ring-yellow-400" : "",
          isCompact ? "text-[13px]" : "text-sm",
        ].join(" ")}
      >
        {/* Imagen */}
        <div
          className={[
            "w-full relative overflow-hidden rounded-t-lg bg-black",
            isCompact ? "aspect-[16/10]" : "aspect-[4/3]",
          ].join(" ")}
        >
          {destacadoActivo && (
            <div
              className={[
                "absolute top-2 left-2 bg-yellow-300 text-black font-semibold rounded-full shadow-md z-10 flex items-center gap-1",
                isCompact ? "text-[10px] px-2 py-[2px]" : "text-xs px-3 py-1",
              ].join(" ")}
            >
              ⭐ Publicación destacada
            </div>
          )}

          {producto.imagenes[0]?.mainUrl?.endsWith(".mp4") ? (
            <video
              src={producto.imagenes[0]?.mainUrl}
              className="w-full h-full object-cover absolute top-0 left-0"
              muted
              autoPlay
              loop
              playsInline
            />
          ) : (
            <img
              src={
                producto.imagenes[0]?.thumbUrl || producto.imagenes[0]?.mainUrl
              }
              alt={producto.nombre}
              className="w-full h-full object-cover absolute top-0 left-0"
            />
          )}
        </div>

        {/* Contenido */}
        <div
          className={
            isCompact ? "p-2 flex flex-col flex-1" : "p-3 flex flex-col flex-1"
          }
        >
          <h3
            className={[
              "font-semibold text-gray-800 leading-snug mb-1 line-clamp-2",
              isCompact ? "text-[13px]" : "text-sm",
            ].join(" ")}
          >
            {producto.nombre}
          </h3>

          <p
            className={[
              "text-green-600 font-bold mb-1",
              isCompact ? "text-[13px]" : "text-sm",
            ].join(" ")}
          >
            {producto.precio.toLocaleString()} ₲
          </p>

          <p
            className={
              isCompact ? "text-[11px] text-gray-500" : "text-xs text-gray-500"
            }
          >
            {producto.ubicacion}
          </p>

          {/* Vendedor + acciones */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <img
                src={producto.vendedor.avatar}
                alt={producto.vendedor.nombre}
                className={
                  isCompact
                    ? "w-4 h-4 rounded-full object-cover"
                    : "w-5 h-5 rounded-full object-cover"
                }
              />
              <span
                className={
                  isCompact
                    ? "text-[11px] text-gray-500"
                    : "text-xs text-gray-500"
                }
              >
                {producto.vendedor.nombre}
              </span>
            </div>

            {mostrarAcciones && (
              <div className="flex items-center gap-2">
                <button
                  className="text-gray-400 hover:text-blue-500 transition"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    Swal.fire({
                      icon: "info",
                      title: "✨ ¡Estamos trabajando en ello!",
                      html: `<p style="color: #ddd; font-size: 15px; margin-top: 8px;">La edición de publicaciones estará disponible pronto.</p>`,
                      background: "#1e1f23",
                      color: "#fff",
                      confirmButtonColor: "#22c55e",
                      confirmButtonText: "Entendido 💛",
                      showCloseButton: true,
                    });
                  }}
                >
                  <PencilSquareIcon
                    className={isCompact ? "w-4 h-4" : "w-5 h-5"}
                  />
                </button>

                <button
                  disabled={eliminando}
                  className={`transition ${
                    eliminando
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-400 hover:text-red-500"
                  }`}
                  onClick={handleEliminar}
                >
                  <TrashIcon className={isCompact ? "w-4 h-4" : "w-5 h-5"} />
                </button>
              </div>
            )}
          </div>

          {/* Botones inferiores */}
          {mostrarAcciones && (
            <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-gray-200">
              {/* ⭐ Destacar */}
              <button
                disabled={destacadoActivo || operandoDestacado}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  destacarFlow();
                }}
                className={[
                  "w-full rounded-md font-semibold transition flex items-center justify-center gap-1",
                  isCompact
                    ? "text-[10px] py-[5px] px-2"
                    : "text-[12px] py-[6px] px-3",
                  destacadoActivo || operandoDestacado
                    ? "bg-yellow-300 text-black cursor-not-allowed"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
                ].join(" ")}
                title={
                  destacadoActivo ? "Ya está destacado" : "Destacar publicación"
                }
              >
                ⭐ Destacar
              </button>

              {/* 🎉 Especial (con permiso + estado) */}
              <button
                disabled={
                  operandoEspecial || (!puedeActivarEspecial && !especialActivo)
                }
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  activarEspecialFlow();
                }}
                className={[
                  "flex-1 font-semibold rounded-md shadow-md transition",
                  isCompact
                    ? "text-[10px] py-[5px] px-2"
                    : "text-[12px] py-[6px] px-3",
                  especialActivo
                    ? "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 text-white"
                    : puedeActivarEspecial
                    ? "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white hover:shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed",
                ].join(" ")}
                title={
                  especialActivo
                    ? "Quitar de publicación especial"
                    : puedeActivarEspecial
                    ? "Activar como publicación especial"
                    : "Función Premium"
                }
              >
                🎉 {especialActivo ? "Especial (activo)" : "Especial"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductoCard;

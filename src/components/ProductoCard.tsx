import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Producto } from "../types/producto";
import {
  PencilSquareIcon,
  TrashIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import {
  eliminarPublicacion,
  destacarPublicacion,
  quitarDestacadoPublicacion,
  activarTemporada,
  desactivarTemporada,
  obtenerTemporadas,
  marcarComoVendido,
} from "../api/publicacionesService";
import { useUsuario } from "../context/UsuarioContext";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import Tippy from "@tippyjs/react";
interface Props {
  producto: Producto;
  onEliminado?: (id: number) => void;
  mostrarAcciones?: boolean;
  variant?: "default" | "compact";
}

const ProductoCard: React.FC<Props> = ({
  producto,
  onEliminado,
  mostrarAcciones = false,
  variant = "default",
}) => {
  const { usuario } = useUsuario();
  const [eliminando, setEliminando] = useState(false);
  const [operandoEspecial, setOperandoEspecial] = useState(false);
  const [operandoDestacado, setOperandoDestacado] = useState(false);

  const isCompact = variant === "compact";

  const especialActivo = !!producto.esTemporada;
  const destacadoActivo = !!producto.esDestacada;

  // permisos existentes (NO TOCADOS)
  const puedeCrearDestacado =
    usuario?.permisos?.includes("CrearPublicacionDestacada") ?? false;

  const puedeQuitarDestacado =
    usuario?.permisos?.includes("QuitarPublicacionDestacada") ?? false;

  const puedeCrearEspecial =
    usuario?.permisos?.includes("CrearPublicacionTemporada") ?? false;

  const puedeQuitarEspecial =
    usuario?.permisos?.includes("QuitarPublicacionTemporada") ?? false;

  const puedeActivarEspecial =
    (!especialActivo && puedeCrearEspecial) ||
    (especialActivo && puedeQuitarEspecial);

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

  const quitarDestacadoFlow = async () => {
    const confirm = await Swal.fire({
      title: "¿Quitar publicación destacada?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Quitar",
      cancelButtonText: "Cancelar",
      background: "#1e1f23",
      color: "#fff",
    });

    if (!confirm.isConfirmed) return;

    try {
      setOperandoDestacado(true);
      await quitarDestacadoPublicacion(producto.id);

      Swal.fire({
        icon: "success",
        title: "Destacado quitado",
        timer: 1400,
        showConfirmButton: false,
        background: "#1e1e1e",
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
      setOperandoDestacado(false);
    }
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
            (document.getElementById("temporada") as HTMLSelectElement).value,
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

  // Palabras clave para resaltar
  const palabrasPromo = [
    "promo",
    "promoción",
    "descuento",
    "rebaja",
    "oferta",
    "black friday",
    "black",
    "viernes negro",
    "navidad",
    "sale",
    "hot sale",
    "2x1",
    "3x2",
  ];

  // Función de resaltado
  const resaltarPromo = (texto: string) => {
    let resultado = texto;

    palabrasPromo.forEach((palabra) => {
      const regex = new RegExp(`(${palabra})`, "ig");

      resultado = resultado.replace(
        regex,
        `
      <span class="promo-glow" style="
        padding: 2px 6px;
        border-radius: 6px;
        background: linear-gradient(90deg, #facc15, #f59e0b);
        color: #000;
        font-weight: 900;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      ">
        <span style="text-transform: uppercase;">$1</span> </span>
      `,
      );
    });

    return resultado;
  };

  const marcarVendidoFlow = async () => {
    const confirm = await Swal.fire({
      title: "¿Marcar como vendido?",
      text: "Esta acción indicará que el producto ya fue vendido.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, marcar como vendido",
      cancelButtonText: "Cancelar",
      background: "#1e1f23",
      color: "#fff",
    });

    if (!confirm.isConfirmed) return;

    try {
      await marcarComoVendido(producto.id);

      Swal.fire({
        icon: "success",
        title: "Producto marcado como vendido",
        timer: 1400,
        showConfirmButton: false,
        background: "#1e1e1e",
        color: "#fff",
      });

      window.dispatchEvent(new Event("actualizar-publicaciones"));
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "No se pudo marcar como vendido",
        text: err?.message ?? "Ocurrió un error",
        background: "#1e1f23",
        color: "#fff",
      });
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

          {/* 👇 NUEVO: badge de temporada (arriba/derecha) */}
          {producto.esTemporada && producto.badgeTexto && (
            <div
              className={[
                "absolute top-2 right-2 rounded-full shadow-md z-10 flex items-center gap-1",
                isCompact ? "text-[10px] px-2 py-[2px]" : "text-xs px-3 py-1",
              ].join(" ")}
              style={{
                backgroundColor: producto.badgeColor || "#ef4444",
                color: "#fff",
              }}
              title={`Temporada: ${producto.badgeTexto}`}
            >
              🎊 {producto.badgeTexto}
            </div>
          )}

          {/* 👇 NUEVO: badge de Vendido */}
          {producto.estado === "Vendido" && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xl font-bold z-20">
              🔥 VENDIDO
            </div>
          )}

          {/* 👇 … imagen o video … */}
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
              loading="lazy"
              decoding="async"
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
            dangerouslySetInnerHTML={{
              __html: resaltarPromo(producto.nombre),
            }}
          ></h3>

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

          {/* 🟡 FILA COMPACTA: INFO + ACCIONES */}
          <div className="flex items-center justify-between mt-2 mb-1">
            {/* Nombre del producto + ubicación queda como está arriba */}

            {/* 🔥 VENDEDOR A LA DERECHA */}
            {mostrarAcciones && (
              <div className="flex items-center gap-1 mr-1">
                <img
                  src={producto.vendedor.avatar}
                  loading="lazy"
                  decoding="async"
                  alt={producto.vendedor.nombre}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span className="text-[11px] text-gray-500">
                  {producto.vendedor.nombre}
                </span>
              </div>
            )}
          </div>

          {/* 🟣 ACCIONES (EDITAR / ELIMINAR / VENDIDO) — compactados */}
          {mostrarAcciones && (
            <div className="flex items-center justify-end gap-2 mt-1 mb-1 pr-1">
              {/* Editar */}
              <Tippy content="Editar publicación (próximamente)" theme="light">
                <button
                  disabled={producto.estado === "Vendido"}
                  className={`transition ${
                    producto.estado === "Vendido"
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-400 hover:text-blue-500"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    Swal.fire({
                      icon: "info",
                      title: "✨ ¡Estamos trabajando en ello!",
                      html: `<p style="color:#ddd;font-size:14px;">La edición estará disponible pronto.</p>`,
                      background: "#1e1f23",
                      color: "#fff",
                    });
                  }}
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
              </Tippy>

              {/* Eliminar */}
              <Tippy content="Eliminar publicación" theme="light">
                <button
                  disabled={eliminando}
                  className={`transition ${
                    eliminando
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-400 hover:text-red-500"
                  }`}
                  onClick={handleEliminar}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </Tippy>

              {/* Vendido */}
              <Tippy content="Marcar como vendido" theme="light">
                <button
                  className={`transition ${
                    producto.estado === "Vendido"
                      ? "text-green-400 cursor-not-allowed"
                      : "text-gray-400 hover:text-green-500"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (producto.estado === "Vendido") return;
                    marcarVendidoFlow();
                  }}
                >
                  <CheckBadgeIcon className="w-4 h-4" />
                </button>
              </Tippy>
            </div>
          )}

          {/* Botones inferiores */}
          {mostrarAcciones && (
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-200">
              {/* ⭐ Destacar */}
              <button
                disabled={
                  producto.estado === "Vendido" ||
                  operandoDestacado ||
                  (destacadoActivo && !puedeQuitarDestacado) ||
                  (!destacadoActivo && !puedeCrearDestacado)
                }
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (destacadoActivo) {
                    quitarDestacadoFlow();
                  } else {
                    destacarFlow();
                  }
                }}
                className={[
                  "w-full rounded-md font-semibold transition flex items-center justify-center gap-1",
                  "text-[12px] py-[4px] px-2",
                  destacadoActivo
                    ? "bg-yellow-300 text-black"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
                ].join(" ")}
              >
                ⭐ {destacadoActivo ? "Quitar destacado" : "Destacar"}
              </button>

              {/* 🎉 Especial (con permiso + estado) */}
              <button
                disabled={
                  producto.estado === "Vendido" ||
                  operandoEspecial ||
                  (!puedeActivarEspecial && !especialActivo)
                }
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  activarEspecialFlow();
                }}
                className={[
                  "w-full rounded-md font-semibold transition shadow-sm flex items-center justify-center gap-1",
                  // 👇 NUEVO: más finito + compacto
                  "text-[12px] py-[4px] px-2",
                  especialActivo
                    ? "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 text-white"
                    : puedeActivarEspecial
                      ? "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white hover:shadow-md"
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

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
import FavoritoButton from "./publicaciones/FavoritoButton";
import PublicacionMetricas from "./publicaciones/PublicacionMetricas";
import { useUsuario } from "../context/UsuarioContext";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import Tippy from "@tippyjs/react";

interface Props {
  producto: Producto;
  onEliminado?: (id: number) => void;
  onEditar?: (producto: Producto) => void;
  onVerDetalle?: (producto: Producto) => void;
  mostrarAcciones?: boolean;
  variant?: "default" | "compact";
}

const ProductoCard: React.FC<Props> = ({
  producto,
  onEliminado,
  onEditar,
  onVerDetalle,
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

  const imagenesProducto = Array.isArray(producto.imagenes)
    ? producto.imagenes
    : [];

  const puedeCrearDestacado =
    usuario?.permisos?.includes("CrearPublicacionDestacada") ?? false;

  const puedeCrearEspecial =
    usuario?.permisos?.includes("CrearPublicacionTemporada") ?? false;

  const handleVerDetalle = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onVerDetalle) return;

    e.preventDefault();
    e.stopPropagation();

    onVerDetalle(producto);
  };

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
      window.dispatchEvent(new Event("actualizar-publicaciones"));
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text:
          error?.response?.data?.Errors?.[0] ||
          error?.response?.data?.Message ||
          error?.message ||
          "Ocurrió un error",
        background: "#1e1f23",
        color: "#fff",
      });
    } finally {
      setEliminando(false);
    }
  };

  const handleEditar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (producto.estado === "Vendido") return;

    onEditar?.(producto);
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
        text:
          err?.response?.data?.Errors?.[0] ||
          err?.response?.data?.Message ||
          err?.message ||
          "Ocurrió un error",
        background: "#1e1f23",
        color: "#fff",
      });
    } finally {
      setOperandoDestacado(false);
    }
  };

  const activarEspecialFlow = async () => {
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
          text:
            err?.response?.data?.Errors?.[0] ||
            err?.response?.data?.Message ||
            err?.message ||
            "Ocurrió un error",
          background: "#1e1f23",
          color: "#fff",
        });
      } finally {
        setOperandoEspecial(false);
      }

      return;
    }

    if (!puedeCrearEspecial) {
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
      Swal.fire({
        icon: "error",
        title: "No se pudo activar",
        text:
          err?.response?.data?.Errors?.[0] ||
          err?.response?.data?.Message ||
          err?.message ||
          "Ocurrió un error",
        background: "#1e1f23",
        color: "#fff",
      });
    } finally {
      setOperandoEspecial(false);
    }
  };

  const destacarFlow = async () => {
    if (!puedeCrearDestacado) {
      await Swal.fire({
        icon: "info",
        title: "Función para cuentas Premium",
        html:
          `<p style="color:#ddd;margin-top:6px">` +
          `“Publicación destacada” requiere el permiso correspondiente.<br/>` +
          `Contactá con soporte para habilitarlo.` +
          `</p>`,
        background: "#1e1f23",
        color: "#fff",
        confirmButtonColor: "#facc15",
        confirmButtonText: "Entendido",
      });
      return;
    }

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
        text:
          err?.response?.data?.Errors?.[0] ||
          err?.response?.data?.Message ||
          err?.message ||
          "Ocurrió un error",
        background: "#1e1f23",
        color: "#fff",
      });
    } finally {
      setOperandoDestacado(false);
    }
  };

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

  const resaltarPromo = (texto: string) => {
    let resultado = texto || "";

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
        text:
          err?.response?.data?.Errors?.[0] ||
          err?.response?.data?.Message ||
          err?.message ||
          "Ocurrió un error",
        background: "#1e1f23",
        color: "#fff",
      });
    }
  };

  const formatearPrecio = (
    precio?: number | null,
    moneda?: string | null,
  ): string => {
    if (!precio || precio <= 0) return "Consultar precio";

    const monedaNormalizada = moneda?.trim().toUpperCase() || "PYG";

    if (monedaNormalizada === "USD") {
      return `USD ${Number(precio).toLocaleString("es-PY", {
        maximumFractionDigits: 0,
      })}`;
    }

    return `Gs. ${Number(precio).toLocaleString("es-PY", {
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <Link
      to={`/producto/${producto.id}`}
      onClick={handleVerDetalle}
      className="block"
    >
      <div
        className={[
          "bg-white rounded-2xl shadow-sm hover:shadow-md transition duration-200 cursor-pointer",
          "overflow-hidden flex flex-col h-full ring-1 ring-transparent hover:ring-yellow-500",
          destacadoActivo ? "ring-2 ring-yellow-400" : "",
          isCompact ? "text-[13px]" : "text-sm",
        ].join(" ")}
      >
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

          {producto.estado === "Vendido" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 text-xl font-bold text-white">
              🔥 VENDIDO
            </div>
          )}

          {imagenesProducto[0]?.mainUrl?.endsWith(".mp4") ? (
            <video
              src={imagenesProducto[0]?.mainUrl}
              className="absolute left-0 top-0 h-full w-full object-cover"
              muted
              autoPlay
              loop
              playsInline
            />
          ) : (
            <img
              src={
                imagenesProducto[0]?.thumbUrl ||
                imagenesProducto[0]?.mainUrl ||
                "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=900"
              }
              loading="lazy"
              decoding="async"
              alt={producto.nombre}
              className="absolute left-0 top-0 h-full w-full object-cover"
            />
          )}

          {!mostrarAcciones && (
            <FavoritoButton
              producto={producto}
              className="absolute bottom-3 right-3"
            />
          )}
        </div>

        <div
          className={
            isCompact ? "flex flex-1 flex-col p-2" : "flex flex-1 flex-col p-3"
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
          />

          <p
            className={[
              "text-green-600 font-bold mb-1",
              isCompact ? "text-[13px]" : "text-sm",
            ].join(" ")}
          >
            {formatearPrecio(producto.precio, producto.moneda)}
          </p>

          <p
            className={
              isCompact ? "text-[11px] text-gray-500" : "text-xs text-gray-500"
            }
          >
            {producto.ubicacion}
          </p>

          {mostrarAcciones && (
            <PublicacionMetricas
              cantidadFavoritos={producto.cantidadFavoritos}
              cantidadVistas={producto.cantidadVistas}
              cantidadClicksWhatsapp={producto.cantidadClicksWhatsapp}
            />
          )}

          <div className="mb-1 mt-2 flex items-center justify-between">
            {mostrarAcciones && producto.vendedor && (
              <div className="mr-1 flex items-center gap-1">
                <img
                  src={producto.vendedor.avatar}
                  loading="lazy"
                  decoding="async"
                  alt={producto.vendedor.nombre}
                  className="h-4 w-4 rounded-full object-cover"
                />
                <span className="text-[11px] text-gray-500">
                  {producto.vendedor.nombre}
                </span>
              </div>
            )}
          </div>

          {mostrarAcciones && (
            <div className="mb-1 mt-1 flex items-center justify-end gap-2 pr-1">
              <Tippy content="Editar publicación" theme="light">
                <button
                  type="button"
                  disabled={producto.estado === "Vendido"}
                  className={`transition ${
                    producto.estado === "Vendido"
                      ? "cursor-not-allowed text-gray-300"
                      : "text-gray-400 hover:text-blue-500"
                  }`}
                  onClick={handleEditar}
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
              </Tippy>

              <Tippy content="Eliminar publicación" theme="light">
                <button
                  type="button"
                  disabled={eliminando}
                  className={`transition ${
                    eliminando
                      ? "cursor-not-allowed text-gray-300"
                      : "text-gray-400 hover:text-red-500"
                  }`}
                  onClick={handleEliminar}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </Tippy>

              <Tippy content="Marcar como vendido" theme="light">
                <button
                  type="button"
                  className={`transition ${
                    producto.estado === "Vendido"
                      ? "cursor-not-allowed text-green-400"
                      : "text-gray-400 hover:text-green-500"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (producto.estado === "Vendido") return;
                    marcarVendidoFlow();
                  }}
                >
                  <CheckBadgeIcon className="h-4 w-4" />
                </button>
              </Tippy>
            </div>
          )}

          {mostrarAcciones && (
            <div className="mt-3 space-y-2 pb-6">
              <button
                type="button"
                disabled={operandoDestacado}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (destacadoActivo) {
                    await quitarDestacadoFlow();
                  } else {
                    await destacarFlow();
                  }
                }}
                className={`w-full rounded-lg px-3 py-2 text-sm font-semibold ${
                  destacadoActivo
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {destacadoActivo ? "⭐ Quitar destacado" : "⭐ Destacar"}
              </button>

              <button
                type="button"
                disabled={operandoEspecial}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  await activarEspecialFlow();
                }}
                className={`w-full rounded-lg px-3 py-2 text-sm font-semibold ${
                  especialActivo
                    ? "bg-red-100 text-red-700"
                    : "bg-fuchsia-100 text-fuchsia-700"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {especialActivo ? "🎉 Quitar especial" : "🎉 Especial"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductoCard;
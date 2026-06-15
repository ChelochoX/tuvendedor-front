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

import { ADMIN_WHATSAPP } from "../config/comercialConfig";
import { abrirWhatsapp } from "../utils/whatsapp";
import { intentarRegistrarSolicitudPremium } from "../api/serviciosPremiumService";

import { TIPOS_SERVICIO_PREMIUM } from "../types/servicioPremium.types";

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
  const { usuario, esAdmin } = useUsuario();

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
    esAdmin ||
    (usuario?.permisos?.includes("CrearPublicacionDestacada") ?? false);

  const puedeQuitarDestacado =
    esAdmin ||
    (usuario?.permisos?.includes("QuitarPublicacionDestacada") ?? false);

  const puedeCrearEspecial =
    esAdmin ||
    (usuario?.permisos?.includes("CrearPublicacionTemporada") ?? false);

  const puedeQuitarEspecial =
    esAdmin ||
    (usuario?.permisos?.includes("QuitarPublicacionTemporada") ?? false);

  const mostrarModalPremiumServicio = async ({
    variante = "gold",
    badge,
    titulo,
    descripcion,
    beneficios,
    notaTitulo,
    notaDescripcion,
  }: {
    variante?: "gold" | "purple";
    badge: string;
    titulo: string;
    descripcion: string;
    beneficios: string[];
    notaTitulo: string;
    notaDescripcion: string;
  }) => {
    const htmlBeneficios = beneficios
      .map(
        (beneficio) => `
        <div class="tv-premium-modal__benefit">
          <span class="tv-premium-modal__check">✓</span>
          <span class="tv-premium-modal__benefit-text">${beneficio}</span>
        </div>
      `,
      )
      .join("");

    return Swal.fire({
      html: `
      <div class="tv-premium-modal ${
        variante === "purple" ? "tv-premium-modal--purple" : ""
      }">
        <div class="tv-premium-modal__hero">
          <span class="tv-premium-modal__badge">
            ${badge}
          </span>

          <h2 class="tv-premium-modal__title">
            ${titulo}
          </h2>

          <p class="tv-premium-modal__text">
            ${descripcion}
          </p>
        </div>

        <div class="tv-premium-modal__benefits">
          ${htmlBeneficios}
        </div>

        <div class="tv-premium-modal__notice">
          <p class="tv-premium-modal__notice-title">
            Activación posterior al pago
          </p>

          <p class="tv-premium-modal__notice-text">
            ${notaDescripcion}
          </p>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Consultar por WhatsApp",
      cancelButtonText: "Ahora no",
      buttonsStyling: false,
      background: "#0b111c",
      color: "#fff",
      width: 440,
      padding: 0,
      customClass: {
        popup: "tv-premium-swal-popup",
        htmlContainer: "tv-premium-swal-html",
        actions: "tv-premium-swal-actions",
        confirmButton: "tv-premium-swal-confirm",
        cancelButton: "tv-premium-swal-cancel",
      },
    });
  };

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
    if (!puedeQuitarDestacado) {
      return;
    }

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

  const solicitarEspecialPorWhatsapp = async () => {
    const respuesta = await mostrarModalPremiumServicio({
      variante: "purple",
      badge: "🎉 Campaña especial",
      titulo: "Sumá tu publicación a una campaña destacada",
      descripcion:
        "Tu producto puede aparecer dentro de carruseles temáticos, promociones de temporada y espacios con mayor impacto visual.",
      beneficios: [
        "Presencia dentro del carrusel principal",
        "Badge especial de temporada o campaña",
        "Mayor exposición visual en fechas comerciales",
        "Ideal para promociones, ofertas y lanzamientos",
      ],
      notaTitulo: "Servicio Premium con activación posterior al pago",
      notaDescripcion:
        "Solicitá tu participación por WhatsApp para conocer las campañas disponibles, el precio y las formas de pago. Una vez confirmado el pago, agregaremos tu publicación al carrusel especial.",
    });

    if (!respuesta.isConfirmed) return;

    await intentarRegistrarSolicitudPremium({
      tipoServicio: TIPOS_SERVICIO_PREMIUM.PUBLICACION_ESPECIAL,
      idPublicacion: producto.id,
      observacion: "Solicitud enviada desde el CTA de publicación especial.",
    });

    const mensaje = `Hola 👋 Quiero incluir una publicación en una campaña especial de Tu Vendedor.

Publicación: ${producto.nombre}
Código: ${producto.id}

Quisiera conocer las campañas disponibles y el costo de activación.`;

    abrirWhatsapp(ADMIN_WHATSAPP, mensaje);
  };

  const activarEspecialFlow = async () => {
    if (especialActivo) {
      if (!puedeQuitarEspecial) {
        return;
      }

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
      await solicitarEspecialPorWhatsapp();
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

  const solicitarDestacadoPorWhatsapp = async () => {
    const respuesta = await mostrarModalPremiumServicio({
      variante: "gold",
      badge: "⭐ Publicación destacada",
      titulo: "Dale más visibilidad a tu publicación",
      descripcion:
        "Hacé que tu producto tenga más presencia dentro del marketplace y llame más la atención frente a publicaciones normales.",
      beneficios: [
        "Mayor exposición dentro de Tu Vendedor",
        "Ubicación prioritaria en el listado",
        "Badge visual de publicación destacada",
        "Activación disponible por 7, 15 o 30 días",
      ],
      notaTitulo: "Servicio Premium con activación posterior al pago",
      notaDescripcion:
        "Solicitá la promoción por WhatsApp para recibir los planes disponibles y las formas de pago. Una vez confirmado el pago, activaremos el destacado en tu publicación.",
    });

    if (!respuesta.isConfirmed) return;

    await intentarRegistrarSolicitudPremium({
      tipoServicio: TIPOS_SERVICIO_PREMIUM.PUBLICACION_DESTACADA,
      idPublicacion: producto.id,
      observacion: "Solicitud enviada desde el CTA de publicación destacada.",
    });

    const mensaje = `Hola 👋 Quiero destacar una publicación en Tu Vendedor.

Publicación: ${producto.nombre}
Código: ${producto.id}

Quisiera conocer los precios disponibles para destacarla durante 7, 15 o 30 días.`;

    abrirWhatsapp(ADMIN_WHATSAPP, mensaje);
  };

  const destacarFlow = async () => {
    if (!puedeCrearDestacado) {
      await solicitarDestacadoPorWhatsapp();
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
              mostrarCantidad
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
                disabled={
                  operandoDestacado ||
                  (destacadoActivo && !puedeQuitarDestacado)
                }
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (destacadoActivo) {
                    await quitarDestacadoFlow();
                    return;
                  }

                  await destacarFlow();
                }}
                className={`w-full rounded-lg px-3 py-2 text-sm font-semibold ${
                  destacadoActivo
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {destacadoActivo
                  ? puedeQuitarDestacado
                    ? "⭐ Quitar destacado"
                    : "⭐ Destacado activo"
                  : "⭐ Destacar"}
              </button>

              <button
                type="button"
                disabled={
                  operandoEspecial || (especialActivo && !puedeQuitarEspecial)
                }
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  await activarEspecialFlow();
                }}
                className={`w-full rounded-lg px-3 py-2 text-sm font-semibold ${
                  especialActivo
                    ? "bg-red-100 text-red-700"
                    : "bg-fuchsia-100 text-fuchsia-700"
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {especialActivo
                  ? puedeQuitarEspecial
                    ? "🎉 Quitar especial"
                    : "🎉 Especial activo"
                  : "🎉 Especial"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductoCard;

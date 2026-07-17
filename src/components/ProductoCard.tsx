import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Producto } from "../types/producto";
import {
  PencilSquareIcon,
  TrashIcon,
  CheckBadgeIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  UserIcon,
  MapPinIcon,
  PhotoIcon,
  TagIcon,
  EyeIcon,
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

interface PlanPremium {
  nombre: string;
  precio: string;
  descripcion: string;
  recomendado?: boolean;
}

const PLANES_DESTACADO: PlanPremium[] = [
  {
    nombre: "7 días",
    precio: "Gs. 10.000",
    descripcion: "Ideal para probar y darle impulso rápido.",
  },
  {
    nombre: "15 días",
    precio: "Gs. 18.000",
    descripcion: "Más visibilidad con mejor relación precio/días.",
    recomendado: true,
  },
  {
    nombre: "30 días",
    precio: "Gs. 30.000",
    descripcion: "Mayor presencia durante todo el mes.",
  },
];

const PLANES_ESPECIAL: PlanPremium[] = [
  {
    nombre: "7 días",
    precio: "Gs. 20.000",
    descripcion: "Para campañas cortas, ofertas o promociones rápidas.",
  },
  {
    nombre: "15 días",
    precio: "Gs. 35.000",
    descripcion: "Buen equilibrio para campañas de temporada.",
    recomendado: true,
  },
  {
    nombre: "30 días",
    precio: "Gs. 55.000",
    descripcion: "Más impacto para campañas mensuales.",
  },
];

const PLANES_ESPECIAL_TEMPORADA: PlanPremium[] = [
  {
    nombre: "Campaña de temporada",
    precio: "Desde Gs. 30.000",
    descripcion:
      "Aparecé en campañas reales como Navidad, Black Friday, Día de la Madre, Día del Padre o Verano.",
    recomendado: true,
  },
];

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

  const escaparHtml = (valor?: string | number | null) =>
    String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

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

  const obtenerImagenPrincipalParaPreview = () => {
    const primeraImagen = imagenesProducto[0];

    const thumbUrl = primeraImagen?.thumbUrl;
    const mainUrl = primeraImagen?.mainUrl;

    if (thumbUrl) return thumbUrl;

    if (mainUrl && !mainUrl.toLowerCase().endsWith(".mp4")) {
      return mainUrl;
    }

    return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=900";
  };

  const construirVistaCarruselEspecialHtml = () => {
    const imagen = escaparHtml(obtenerImagenPrincipalParaPreview());
    const titulo = escaparHtml(producto.nombre || "Tu publicación");
    const precio = escaparHtml(
      formatearPrecio(producto.precio, producto.moneda),
    );
    const ubicacion = escaparHtml(producto.ubicacion || "Tu ubicación");

    return `
      <div class="tv-premium-carousel-preview">
        <div class="tv-premium-carousel-preview__header">
          <div>
            <p class="tv-premium-carousel-preview__eyebrow">
              Vista previa
            </p>

            <h3 class="tv-premium-carousel-preview__title">
              Así aparecería en el carrusel principal
            </h3>
          </div>

          <span class="tv-premium-carousel-preview__tag">
            🎉 Especial
          </span>
        </div>

        <div class="tv-premium-carousel-preview__stage">
          <div class="tv-premium-carousel-preview__section-title">
            Especiales destacados
          </div>

          <div class="tv-premium-carousel-preview__cards">
            <div class="tv-premium-carousel-preview__card tv-premium-carousel-preview__card--ghost">
              <div class="tv-premium-carousel-preview__ghost-image"></div>
              <div class="tv-premium-carousel-preview__ghost-line"></div>
              <div class="tv-premium-carousel-preview__ghost-line tv-premium-carousel-preview__ghost-line--short"></div>
            </div>

            <div class="tv-premium-carousel-preview__card tv-premium-carousel-preview__card--active">
              <div class="tv-premium-carousel-preview__image-wrap">
                <img
                  src="${imagen}"
                  alt="${titulo}"
                  class="tv-premium-carousel-preview__image"
                />

                <span class="tv-premium-carousel-preview__badge">
                  Campaña especial
                </span>
              </div>

              <div class="tv-premium-carousel-preview__content">
                <p class="tv-premium-carousel-preview__product-title">
                  ${titulo}
                </p>

                <p class="tv-premium-carousel-preview__price">
                  ${precio}
                </p>

                <p class="tv-premium-carousel-preview__location">
                  ${ubicacion}
                </p>
              </div>
            </div>

            <div class="tv-premium-carousel-preview__card tv-premium-carousel-preview__card--ghost">
              <div class="tv-premium-carousel-preview__ghost-image"></div>
              <div class="tv-premium-carousel-preview__ghost-line"></div>
              <div class="tv-premium-carousel-preview__ghost-line tv-premium-carousel-preview__ghost-line--short"></div>
            </div>
          </div>
        </div>

        <p class="tv-premium-carousel-preview__help">
          Tu publicación se muestra con más presencia visual dentro del carrusel de campañas especiales.
        </p>
      </div>
    `;
  };

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
    planes = [],
    vistaPreviaHtml = "",
    notaTitulo,
    notaDescripcion,
    confirmButtonText = "Consultar por WhatsApp",
  }: {
    variante?: "gold" | "purple";
    badge: string;
    titulo: string;
    descripcion: string;
    beneficios: string[];
    planes?: PlanPremium[];
    vistaPreviaHtml?: string;
    notaTitulo: string;
    notaDescripcion: string;
    confirmButtonText?: string;
  }) => {
    const colorPrincipal = variante === "purple" ? "#e879f9" : "#facc15";

    const colorFondo =
      variante === "purple" ? "rgba(217,70,239,.10)" : "rgba(250,204,21,.10)";

    const colorBorde =
      variante === "purple" ? "rgba(217,70,239,.28)" : "rgba(250,204,21,.28)";

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

    const htmlPlanes = planes.length
      ? `
        <div style="margin-top:14px; display:grid; gap:8px;">
          <p style="margin:0 0 2px; color:${colorPrincipal}; font-size:12px; font-weight:950; text-transform:uppercase; letter-spacing:.12em;">
            Planes disponibles
          </p>

          ${planes
            .map(
              (plan) => `
                <div style="
                  display:grid;
                  grid-template-columns:1fr auto;
                  gap:10px;
                  align-items:center;
                  padding:12px;
                  border-radius:16px;
                  background:${
                    plan.recomendado ? colorFondo : "rgba(255,255,255,.045)"
                  };
                  border:1px solid ${
                    plan.recomendado ? colorBorde : "rgba(255,255,255,.08)"
                  };
                ">
                  <div>
                    <div style="display:flex; align-items:center; gap:7px; flex-wrap:wrap;">
                      <span style="color:#fff; font-size:13px; font-weight:950;">
                        ${plan.nombre}
                      </span>

                      ${
                        plan.recomendado
                          ? `
                            <span style="
                              border-radius:999px;
                              padding:3px 7px;
                              background:${colorPrincipal};
                              color:#020617;
                              font-size:9px;
                              font-weight:950;
                              text-transform:uppercase;
                              letter-spacing:.06em;
                            ">
                              Recomendado
                            </span>
                          `
                          : ""
                      }
                    </div>

                    <p style="margin:5px 0 0; color:rgba(255,255,255,.62); font-size:11px; line-height:1.35;">
                      ${plan.descripcion}
                    </p>
                  </div>

                  <div style="text-align:right; color:${colorPrincipal}; font-size:18px; font-weight:950; white-space:nowrap;">
                    ${plan.precio}
                  </div>
                </div>
              `,
            )
            .join("")}
        </div>
      `
      : "";

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

          ${vistaPreviaHtml}

          ${htmlPlanes}

          <div class="tv-premium-modal__benefits">
            ${htmlBeneficios}
          </div>

          <div class="tv-premium-modal__notice">
            <p class="tv-premium-modal__notice-title">
              ${notaTitulo}
            </p>

            <p class="tv-premium-modal__notice-text">
              ${notaDescripcion}
            </p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: "Ahora no",
      buttonsStyling: false,
      background: "#0b111c",
      color: "#fff",
      width: 480,
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
        </select>
      `,
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
    if (!puedeQuitarDestacado) return;

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
        "Tu publicación puede aparecer dentro del carrusel principal de campañas especiales, con mayor presencia visual y badge destacado.",
      beneficios: [
        "Aparece dentro del carrusel principal",
        "Se muestra con badge especial de campaña",
        "Mayor exposición visual frente a otros productos",
        "Ideal para promociones, ofertas y lanzamientos",
      ],
      planes: [...PLANES_ESPECIAL, ...PLANES_ESPECIAL_TEMPORADA],
      vistaPreviaHtml: construirVistaCarruselEspecialHtml(),
      notaTitulo: "Opciones disponibles",
      notaDescripcion:
        "Los planes por días se activan por 7, 15 o 30 días. Las campañas de temporada dependen de la fecha comercial activa y disponibilidad del espacio.",
      confirmButtonText: "Solicitar especial",
    });

    if (!respuesta.isConfirmed) return;

    await intentarRegistrarSolicitudPremium({
      tipoServicio: TIPOS_SERVICIO_PREMIUM.PUBLICACION_ESPECIAL,
      idPublicacion: producto.id,
      observacion:
        "Solicitud enviada desde el CTA de publicación especial. El cliente vio opciones por días y campañas de temporada.",
    });

    const mensaje = `Hola 👋 Quiero incluir una publicación en una campaña especial de Tu Vendedor.

Publicación: ${producto.nombre}
Código: ${producto.id}

Opciones vistas en la app:

ESPECIAL POR DÍAS
- 7 días: Gs. 20.000
- 15 días: Gs. 35.000
- 30 días: Gs. 55.000

CAMPAÑAS DE TEMPORADA
- Campaña de temporada: desde Gs. 30.000

Quiero activar este servicio. Me confirmás la disponibilidad, forma de pago y cuál opción me conviene?`;

    abrirWhatsapp(ADMIN_WHATSAPP, mensaje);
  };

  const activarEspecialFlow = async () => {
    if (especialActivo) {
      if (!puedeQuitarEspecial) return;

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
        .map((temporada) => {
          return `<option value="${temporada.id}">${temporada.nombre}</option>`;
        })
        .join("");

      const res = await Swal.fire({
        title: "🎉 Publicación especial",
        html: `
          <p style="color:#ccc;">Seleccioná la temporada:</p>

          <select id="temporada" class="swal2-input" style="color:black;">
            ${opciones}
          </select>
        `,
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
      planes: PLANES_DESTACADO,
      notaTitulo: "Precio de lanzamiento",
      notaDescripcion:
        "Elegí el plan que más te convenga y escribinos por WhatsApp. Una vez confirmado el pago, activaremos el destacado en tu publicación.",
      confirmButtonText: "Solicitar destacado",
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

Planes visibles en la app:
- 7 días: Gs. 10.000
- 15 días: Gs. 18.000
- 30 días: Gs. 30.000

Quiero activar este servicio. Me confirmás la forma de pago y el plan disponible?`;

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
          <span
            class="promo-glow"
            style="
              padding:2px 6px;
              border-radius:6px;
              background:linear-gradient(90deg,#facc15,#f59e0b);
              color:#000;
              font-weight:900;
              display:inline-flex;
              align-items:center;
              gap:4px;
            "
          >
            <span style="text-transform:uppercase;">$1</span>
          </span>
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

  const planCreditoRaw = producto.planCredito as any;

  const opcionesCredito = Array.isArray(planCreditoRaw)
    ? planCreditoRaw
    : Array.isArray(planCreditoRaw?.opciones)
      ? planCreditoRaw.opciones
      : [];

  const primeraCuota = opcionesCredito
    .map((opcion: any) => ({
      cuotas: Number(opcion?.cuotas ?? opcion?.Cuotas ?? 0),
      valorCuota: Number(opcion?.valorCuota ?? opcion?.ValorCuota ?? 0),
    }))
    .find(
      (opcion: { cuotas: number; valorCuota: number }) =>
        opcion.cuotas > 0 && opcion.valorCuota > 0,
    );

  const mostrarPrimeraCuota =
    producto.mostrarBotonesCompra === true && Boolean(primeraCuota);

  const tienePrecioPublicado = Boolean(producto.precio && producto.precio > 0);

  const cantidadFotos = imagenesProducto.filter(
    (imagen) => !imagen?.mainUrl?.toLowerCase().endsWith(".mp4"),
  ).length;

  const ubicacionVisible =
    producto.ubicacion?.trim() || "Ubicación no informada";

  const nombreVendedorVisible = producto.vendedor?.nombre?.trim() || "Vendedor";

  const avatarVendedorVisible = producto.vendedor?.avatar?.trim() || "";

  const categoriaVisible = producto.categoria?.trim() || "Producto o servicio";

  const textoParaDetectarInmueble =
    `${categoriaVisible} ${producto.nombre || ""}`.toLowerCase();

  const esInmueble = [
    "inmueble",
    "inmuebles",
    "casa",
    "casas",
    "terreno",
    "terrenos",
    "departamento",
    "departamentos",
    "dúplex",
    "duplex",
    "lote",
    "lotes",
    "oficina",
    "oficinas",
    "local comercial",
    "propiedad",
    "propiedades",
    "residencia",
    "residencial",
    "quinta",
  ].some((palabra) => textoParaDetectarInmueble.includes(palabra));

  const vistasPublicas = Number(producto.cantidadVistas ?? 0);

  const IconoGestionPublica = mostrarPrimeraCuota
    ? CreditCardIcon
    : esInmueble
      ? BuildingLibraryIcon
      : BanknotesIcon;

  const tituloGestionPublica = mostrarPrimeraCuota
    ? "Cuota desde"
    : esInmueble
      ? "Crédito bancario"
      : "Compra directa";

  const subtituloGestionPublica =
    mostrarPrimeraCuota && primeraCuota
      ? `${formatearPrecio(primeraCuota.valorCuota, producto.moneda)} · ${primeraCuota.cuotas} cuotas`
      : esInmueble
        ? "Te asesoramos"
        : "Consultá ahora";

  return (
    <Link
      to={`/producto/${producto.id}`}
      onClick={handleVerDetalle}
      className={[
        "group block self-start rounded-2xl border-0",
        "no-underline outline-none hover:no-underline",
        "focus:no-underline focus:outline-none",
      ].join(" ")}
      style={{
        textDecoration: "none",
        border: "none",
      }}
    >
      <div
        className={[
          "relative isolate overflow-hidden rounded-2xl bg-white",
          "shadow-sm ring-1 ring-inset ring-slate-200",
          "transition-[box-shadow,ring-color] duration-200 ease-out",
          "group-hover:ring-2 group-hover:ring-inset group-hover:ring-indigo-300",
          "group-hover:shadow-[0_12px_30px_-15px_rgba(99,102,241,0.35)]",
          destacadoActivo
            ? "ring-2 ring-inset ring-yellow-400 shadow-[0_12px_30px_-16px_rgba(250,204,21,0.65)]"
            : "",
          isCompact ? "text-[13px]" : "text-sm",
        ].join(" ")}
      >
        <div
          className={[
            "relative z-0 w-full overflow-hidden border-0 bg-black",
            isCompact ? "aspect-[16/10]" : "aspect-[4/3]",
          ].join(" ")}
          style={{
            border: "none",
            outline: "none",
          }}
        >
          {destacadoActivo && (
            <div
              className={[
                "absolute left-2 top-2 z-10",
                "flex items-center gap-1 rounded-full",
                "bg-yellow-300 font-semibold text-black shadow-md",
                isCompact
                  ? "px-2 py-[2px] text-[9px]"
                  : "px-2.5 py-1 text-[10px]",
              ].join(" ")}
            >
              ⭐ Publicación destacada
            </div>
          )}

          {producto.esTemporada && producto.badgeTexto && (
            <div
              className={[
                "absolute right-2 top-2 z-10",
                "flex items-center gap-1 rounded-full shadow-md",
                isCompact
                  ? "px-2 py-[2px] text-[9px]"
                  : "px-2.5 py-1 text-[10px]",
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
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 text-xl font-black text-white">
              🔥 VENDIDO
            </div>
          )}

          {imagenesProducto[0]?.mainUrl?.endsWith(".mp4") ? (
            <video
              src={imagenesProducto[0]?.mainUrl}
              className="absolute inset-0 block h-full w-full border-0 object-cover"
              style={{
                border: "none",
                outline: "none",
              }}
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
              className="absolute inset-0 block h-full w-full border-0 object-cover"
              style={{
                border: "none",
                outline: "none",
              }}
            />
          )}

          {cantidadFotos > 1 && (
            <div
              className={[
                "absolute bottom-2 left-2 z-10",
                "flex items-center gap-1 rounded-full",
                "border border-white/20 bg-black/65",
                "font-semibold text-white shadow-sm backdrop-blur-sm",
                isCompact ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-1 text-[9px]",
              ].join(" ")}
            >
              <PhotoIcon className="h-3 w-3" />
              <span>{cantidadFotos} fotos</span>
            </div>
          )}

          {!mostrarAcciones && (
            <div className="absolute bottom-2 right-2 z-10 flex flex-col items-center gap-1.5">
              <FavoritoButton producto={producto} mostrarCantidad />

              <div
                title={`${vistasPublicas} vistas`}
                className="flex flex-col items-center justify-center gap-1"
              >
                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    "bg-black/22",
                    "shadow-[0_2px_8px_rgba(0,0,0,0.28)]",
                    "backdrop-blur-[3px]",
                  ].join(" ")}
                >
                  <EyeIcon className="h-[18px] w-[18px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]" />
                </span>

                <span
                  className={[
                    "min-w-[18px] rounded-full",
                    "bg-black/22",
                    "px-1 py-[1px] text-center",
                    "text-[8px] font-extrabold leading-none text-white",
                    "shadow-sm backdrop-blur-[3px]",
                  ].join(" ")}
                >
                  {vistasPublicas}
                </span>
              </div>
            </div>
          )}
        </div>

        <div
          className={[
            "relative z-10 -mt-[2px] border-0 bg-white",
            "transition-colors duration-200 ease-out",
            "group-hover:bg-slate-50",
            isCompact ? "p-2.5" : "p-3",
          ].join(" ")}
          style={{
            border: "none",
            outline: "none",
          }}
        >
          <h3
            className={[
              "line-clamp-2 font-semibold leading-snug text-slate-800",
              isCompact ? "text-[11px]" : "text-[12px] sm:text-[13px]",
            ].join(" ")}
            dangerouslySetInnerHTML={{
              __html: resaltarPromo(producto.nombre),
            }}
          />

          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-slate-500">
            <TagIcon className="h-3 w-3 shrink-0 text-amber-500" />

            <span
              className={[
                "truncate font-medium",
                isCompact ? "text-[8px]" : "text-[9px]",
              ].join(" ")}
            >
              {categoriaVisible}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <p
              className={[
                "font-black leading-none tracking-[-0.02em] text-emerald-600",
                isCompact ? "text-[12px]" : "text-[13px] sm:text-[15px]",
              ].join(" ")}
            >
              {formatearPrecio(producto.precio, producto.moneda)}
            </p>

            {tienePrecioPublicado && (
              <span
                className={[
                  "rounded-full border border-emerald-200",
                  "bg-emerald-50 font-extrabold uppercase",
                  "tracking-wide text-emerald-700",
                  isCompact
                    ? "px-1.5 py-0.5 text-[7px]"
                    : "px-2 py-0.5 text-[8px]",
                ].join(" ")}
              >
                Contado
              </span>
            )}
          </div>

          {mostrarAcciones && mostrarPrimeraCuota && primeraCuota && (
            <div
              className={[
                "mt-2 flex items-center gap-2 rounded-xl",
                "bg-gradient-to-r from-emerald-50 via-white to-emerald-100/80",
                "px-2.5 py-2",
                "ring-1 ring-inset ring-emerald-200",
                "shadow-[0_5px_14px_-10px_rgba(16,185,129,0.8)]",
                "transition-colors duration-200",
              ].join(" ")}
            >
              <div
                className={[
                  "flex shrink-0 items-center justify-center",
                  "rounded-md bg-slate-900 text-yellow-400 shadow-sm",
                  isCompact ? "h-6 w-6" : "h-7 w-7",
                ].join(" ")}
              >
                <CreditCardIcon
                  className={isCompact ? "h-3.5 w-3.5" : "h-4 w-4"}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[7px] font-black uppercase leading-none tracking-wide text-emerald-800 sm:text-[8px]">
                    Cuota desde
                  </span>

                  <span className="shrink-0 text-[7px] font-bold text-slate-500 sm:text-[8px]">
                    × {primeraCuota.cuotas} cuotas
                  </span>
                </div>

                <p
                  className={[
                    "mt-1 truncate font-black leading-none",
                    "tracking-[-0.02em] text-emerald-700",
                    isCompact ? "text-[10px]" : "text-[11px] sm:text-[12px]",
                  ].join(" ")}
                >
                  {formatearPrecio(primeraCuota.valorCuota, producto.moneda)}
                </p>
              </div>
            </div>
          )}

          {mostrarAcciones && !mostrarPrimeraCuota && esInmueble && (
            <div
              className={[
                "mt-2 flex min-h-[56px] items-center gap-2 rounded-xl",
                "bg-gradient-to-r from-sky-50 via-white to-blue-50",
                "px-2.5 py-2",
                "ring-1 ring-inset ring-sky-200",
                "shadow-[0_5px_14px_-10px_rgba(14,165,233,0.75)]",
                "transition-colors duration-200",
              ].join(" ")}
            >
              <div
                className={[
                  "flex shrink-0 items-center justify-center",
                  "rounded-md bg-slate-900 text-sky-300 shadow-sm",
                  isCompact ? "h-6 w-6" : "h-7 w-7",
                ].join(" ")}
              >
                <BuildingLibraryIcon
                  className={isCompact ? "h-3.5 w-3.5" : "h-4 w-4"}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={[
                    "font-black uppercase leading-tight tracking-wide text-sky-800",
                    isCompact ? "text-[7px]" : "text-[8px] sm:text-[9px]",
                  ].join(" ")}
                >
                  Crédito bancario
                </p>

                <p
                  className={[
                    "mt-0.5 font-semibold leading-tight text-slate-600",
                    isCompact ? "text-[8px]" : "text-[9px] sm:text-[10px]",
                  ].join(" ")}
                >
                  Te asesoramos
                </p>
              </div>
            </div>
          )}

          {mostrarAcciones && !mostrarPrimeraCuota && !esInmueble && (
            <div
              className={[
                "mt-2 flex min-h-[56px] items-center gap-2 rounded-xl",
                "bg-gradient-to-r from-amber-50 via-white to-yellow-50",
                "px-2.5 py-2",
                "ring-1 ring-inset ring-amber-200",
                "shadow-[0_5px_14px_-10px_rgba(245,158,11,0.75)]",
                "transition-colors duration-200",
              ].join(" ")}
            >
              <div
                className={[
                  "flex shrink-0 items-center justify-center",
                  "rounded-md bg-slate-900 text-yellow-400 shadow-sm",
                  isCompact ? "h-6 w-6" : "h-7 w-7",
                ].join(" ")}
              >
                <BanknotesIcon
                  className={isCompact ? "h-3.5 w-3.5" : "h-4 w-4"}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={[
                    "font-black uppercase leading-tight tracking-wide text-amber-800",
                    isCompact ? "text-[7px]" : "text-[8px] sm:text-[9px]",
                  ].join(" ")}
                >
                  Compra directa
                </p>

                <p
                  className={[
                    "mt-0.5 font-semibold leading-tight text-slate-600",
                    isCompact ? "text-[8px]" : "text-[9px] sm:text-[10px]",
                  ].join(" ")}
                >
                  Consultá ahora
                </p>
              </div>
            </div>
          )}

          {mostrarAcciones && mostrarPrimeraCuota && esInmueble && (
            <div className="mt-1.5 flex">
              <span
                className={[
                  "inline-flex max-w-full items-center gap-1",
                  "rounded-full bg-sky-50 px-2 py-1",
                  "font-bold text-sky-700",
                  "ring-1 ring-inset ring-sky-200",
                  isCompact ? "text-[7px]" : "text-[8px]",
                ].join(" ")}
              >
                <BuildingLibraryIcon className="h-3 w-3 shrink-0" />
                <span>Crédito bancario</span>
              </span>
            </div>
          )}

          {!mostrarAcciones ? (
            <div
              className={[
                "mt-2 overflow-hidden rounded-xl border",
                "border-slate-200/90",
                isCompact ? "-mx-2.5 -mb-2.5" : "-mx-3 -mb-3",
              ].join(" ")}
            >
              <div
                className={[
                  "flex items-center gap-2 border-b border-amber-100/90",
                  "bg-gradient-to-r from-amber-50 via-white to-orange-50",
                  "transition-colors duration-200 ease-out",
                  "group-hover:from-orange-50 group-hover:via-amber-50 group-hover:to-yellow-50",
                  isCompact ? "px-2.5 py-2" : "px-3 py-2.5",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex shrink-0 items-center justify-center rounded-full",
                    "bg-slate-900 text-yellow-400 shadow-sm",
                    isCompact ? "h-7 w-7" : "h-8 w-8",
                  ].join(" ")}
                >
                  <IconoGestionPublica
                    className={isCompact ? "h-3.5 w-3.5" : "h-4 w-4"}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={[
                      "font-black uppercase leading-none tracking-[0.1em]",
                      mostrarPrimeraCuota
                        ? "text-emerald-700"
                        : esInmueble
                          ? "text-sky-700"
                          : "text-amber-700",
                      isCompact ? "text-[6px]" : "text-[7px]",
                    ].join(" ")}
                  >
                    {tituloGestionPublica}
                  </p>

                  <p
                    className={[
                      "mt-1 truncate font-semibold leading-tight text-slate-600",
                      isCompact ? "text-[8px]" : "text-[9px]",
                    ].join(" ")}
                  >
                    {subtituloGestionPublica}
                  </p>
                </div>
              </div>

              <div
                className={[
                  "flex items-center gap-2",
                  "bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50",
                  "transition-colors duration-200 ease-out",
                  "group-hover:from-blue-50 group-hover:via-indigo-50/80 group-hover:to-slate-50",
                  isCompact ? "px-2.5 py-2" : "px-3 py-2.5",
                ].join(" ")}
              >
                {avatarVendedorVisible ? (
                  <img
                    src={avatarVendedorVisible}
                    loading="lazy"
                    decoding="async"
                    alt={nombreVendedorVisible}
                    className={[
                      "shrink-0 rounded-full border-2 border-white",
                      "bg-white object-cover shadow-sm ring-1 ring-indigo-200",
                      isCompact ? "h-7 w-7" : "h-8 w-8",
                    ].join(" ")}
                  />
                ) : (
                  <div
                    className={[
                      "flex shrink-0 items-center justify-center rounded-full",
                      "border-2 border-white bg-gradient-to-br",
                      "from-indigo-500 to-blue-600 text-white shadow-sm",
                      "ring-1 ring-indigo-200",
                      isCompact ? "h-7 w-7" : "h-8 w-8",
                    ].join(" ")}
                  >
                    <UserIcon
                      className={isCompact ? "h-3.5 w-3.5" : "h-4 w-4"}
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p
                    className={[
                      "font-black uppercase leading-none tracking-[0.12em]",
                      "text-indigo-500/70",
                      isCompact ? "text-[6px]" : "text-[7px]",
                    ].join(" ")}
                  >
                    Vendedor
                  </p>

                  <p
                    className={[
                      "mt-1 truncate font-bold leading-tight text-slate-800",
                      isCompact ? "text-[9px]" : "text-[10px] sm:text-[11px]",
                    ].join(" ")}
                    title={nombreVendedorVisible}
                  >
                    {nombreVendedorVisible}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={[
                "mt-2 flex min-w-0 items-center gap-2 rounded-lg",
                "bg-gradient-to-r from-slate-50 to-amber-50/40",
                "px-2 py-1.5",
                "ring-1 ring-inset ring-slate-100",
                "transition-colors duration-200",
              ].join(" ")}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <MapPinIcon className="h-3 w-3" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[6px] font-black uppercase leading-none tracking-[0.08em] text-amber-700/75 sm:text-[7px]">
                  Ubicación
                </p>

                <p
                  className={[
                    "mt-0.5 truncate font-medium leading-tight text-slate-600",
                    isCompact ? "text-[8px]" : "text-[9px] sm:text-[10px]",
                  ].join(" ")}
                  title={ubicacionVisible}
                >
                  {ubicacionVisible}
                </p>
              </div>
            </div>
          )}

          {mostrarAcciones && (
            <PublicacionMetricas
              cantidadFavoritos={producto.cantidadFavoritos}
              cantidadVistas={producto.cantidadVistas}
              cantidadClicksWhatsapp={producto.cantidadClicksWhatsapp}
            />
          )}

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

                    if (producto.estado === "Vendido") {
                      return;
                    }

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
                  : "⭐ Destacar desde Gs. 10.000"}
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
                  : "🎉 Especial desde Gs. 20.000"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductoCard;

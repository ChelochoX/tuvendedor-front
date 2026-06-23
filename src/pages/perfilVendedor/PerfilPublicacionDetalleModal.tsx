import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  MapPin,
  MessageCircle,
  Navigation,
  Share2,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

import SolicitarVisitaModal from "./SolicitarVisitaModal";
import {
  PublicacionPerfilVendedor,
  PerfilPublicoVendedor,
} from "../../types/perfilVendedor.types";
import { buildVitrinaUrl } from "../../config/appConfig";
import {
  registrarClickWhatsapp,
  registrarVistaPublicacion,
} from "../../api/publicacionInteraccionesService";
import {
  registrarMetaAngelaAperturaAgendaVisita,
  registrarMetaAngelaContactoWhatsapp,
  registrarMetaAngelaViewContent,
} from "../../utils/metaPixel";
import VitrinaMedia from "../../components/perfilVendedor/VitrinaMedia";

interface Props {
  publicacion: PublicacionPerfilVendedor;
  perfil: PerfilPublicoVendedor;
  onClose: () => void;
}

type TipoFicha =
  | "vehiculo"
  | "inmueble"
  | "gastronomia"
  | "retail"
  | "servicio"
  | "generico";

interface ContextoFicha {
  tipo: TipoFicha;
  etiqueta: string;
  tabs: {
    descripcion: string;
    detalles: string;
    ubicacion: string;
    vendedor: string;
  };
  accionSecundaria: string;
  detalleTitulo: string;
  detalleIntro: string;
}

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

const limpiarTelefonoWhatsapp = (telefono?: string | null): string => {
  if (!telefono) return "";

  let numero = telefono.replace(/\D/g, "");

  if (numero.startsWith("0")) {
    numero = `595${numero.slice(1)}`;
  }

  if (!numero.startsWith("595")) {
    numero = `595${numero}`;
  }

  return numero;
};

const normalizarTexto = (valor?: string | null): string => {
  return (valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const normalizarCoordenada = (
  valor?: string | number | null,
): number | null => {
  if (valor === null || valor === undefined || valor === "") return null;

  const texto = String(valor).trim().replace(",", ".");
  const numero = Number(texto);

  if (Number.isNaN(numero)) return null;

  return numero;
};

const coordenadaEnRango = (
  valor: number | null,
  minimo: number,
  maximo: number,
): boolean => {
  return valor !== null && valor >= minimo && valor <= maximo;
};

const abrirWhatsapp = (
  telefono: string | null | undefined,
  mensaje: string,
) => {
  const numero = limpiarTelefonoWhatsapp(telefono);

  if (!numero) {
    Swal.fire({
      icon: "info",
      title: "WhatsApp no disponible",
      text: "El vendedor todavía no configuró un número de WhatsApp.",
      confirmButtonColor: "#facc15",
      background: "#111827",
      color: "#ffffff",
    });
    return;
  }

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

const construirUrlMapa = (publicacion: PublicacionPerfilVendedor): string => {
  const googleMapsUrl = publicacion.googleMapsUrl?.trim();

  if (googleMapsUrl) return googleMapsUrl;

  const latitud = normalizarCoordenada(publicacion.latitud);
  const longitud = normalizarCoordenada(publicacion.longitud);

  if (
    coordenadaEnRango(latitud, -90, 90) &&
    coordenadaEnRango(longitud, -180, 180)
  ) {
    return `https://www.google.com/maps?q=${latitud},${longitud}`;
  }

  if (publicacion.ubicacion) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      publicacion.ubicacion,
    )}`;
  }

  return "";
};

const obtenerContextoFicha = (
  publicacion: PublicacionPerfilVendedor,
  perfil: PerfilPublicoVendedor,
): ContextoFicha => {
  const texto = normalizarTexto(
    `${publicacion.categoria || ""} ${publicacion.titulo || ""} ${
      perfil.rubro || ""
    }`,
  );

  if (
    [
      "moto",
      "motos",
      "vehiculo",
      "vehiculos",
      "auto",
      "autos",
      "camioneta",
      "rodado",
      "motor",
      "automotor",
    ].some((palabra) => texto.includes(palabra))
  ) {
    return {
      tipo: "vehiculo",
      etiqueta: "Ficha vehicular",
      tabs: {
        descripcion: "Descripción",
        detalles: "Ficha técnica",
        ubicacion: "Ubicación",
        vendedor: "Vendedor",
      },
      accionSecundaria: "Agendar visita",
      detalleTitulo: "Detalles del vehículo",
      detalleIntro:
        "Información útil para evaluar estado, categoría, ubicación y contacto directo.",
    };
  }

  if (
    [
      "inmueble",
      "inmuebles",
      "casa",
      "casas",
      "terreno",
      "terrenos",
      "departamento",
      "alquiler",
      "propiedad",
      "propiedades",
      "duplex",
      "dúplex",
      "local",
      "oficina",
      "quinta",
    ].some((palabra) => texto.includes(palabra))
  ) {
    return {
      tipo: "inmueble",
      etiqueta: "Ficha inmobiliaria",
      tabs: {
        descripcion: "Descripción",
        detalles: "Características",
        ubicacion: "Ubicación",
        vendedor: "Vendedor",
      },
      accionSecundaria: "Agendar visita",
      detalleTitulo: "Características principales",
      detalleIntro:
        "Datos clave para entender la propiedad, ubicación y disponibilidad de visita.",
    };
  }

  if (
    [
      "panaderia",
      "panadería",
      "confiteria",
      "confitería",
      "comida",
      "alimento",
      "alimentos",
      "bebida",
      "bebidas",
      "torta",
      "tortas",
      "pan",
      "minimercado",
      "supermercado",
      "despensa",
      "almacen",
      "almacén",
      "bodega",
    ].some((palabra) => texto.includes(palabra))
  ) {
    return {
      tipo: "gastronomia",
      etiqueta: "Ficha comercial",
      tabs: {
        descripcion: "Descripción",
        detalles: "Producto",
        ubicacion: "Entrega / retiro",
        vendedor: "Vendedor",
      },
      accionSecundaria: "Consultar disponibilidad",
      detalleTitulo: "Información del producto",
      detalleIntro:
        "Presentación comercial con datos útiles para compra, retiro o pedido por WhatsApp.",
    };
  }

  if (
    [
      "software",
      "servicio",
      "servicios",
      "sistema",
      "sistemas",
      "desarrollo",
      "diseno",
      "diseño",
      "consultoria",
      "consultoría",
    ].some((palabra) => texto.includes(palabra))
  ) {
    return {
      tipo: "servicio",
      etiqueta: "Ficha de servicio",
      tabs: {
        descripcion: "Descripción",
        detalles: "Qué incluye",
        ubicacion: "Modalidad",
        vendedor: "Vendedor",
      },
      accionSecundaria: "Solicitar cotización",
      detalleTitulo: "Qué puede incluir",
      detalleIntro:
        "Resumen del servicio para que el cliente consulte rápido y reciba una propuesta personalizada.",
    };
  }

  if (
    [
      "ropa",
      "calzado",
      "ferreteria",
      "ferretería",
      "electronica",
      "electrónica",
      "celular",
      "celulares",
      "hogar",
      "accesorio",
      "accesorios",
      "producto",
      "productos",
    ].some((palabra) => texto.includes(palabra))
  ) {
    return {
      tipo: "retail",
      etiqueta: "Ficha de producto",
      tabs: {
        descripcion: "Descripción",
        detalles: "Detalles",
        ubicacion: "Entrega",
        vendedor: "Vendedor",
      },
      accionSecundaria: "Consultar stock",
      detalleTitulo: "Detalles comerciales",
      detalleIntro:
        "Datos principales para consultar stock, precio, entrega y atención personalizada.",
    };
  }

  return {
    tipo: "generico",
    etiqueta: "Ficha premium",
    tabs: {
      descripcion: "Descripción",
      detalles: "Detalles",
      ubicacion: "Ubicación",
      vendedor: "Vendedor",
    },
    accionSecundaria: "Consultar disponibilidad",
    detalleTitulo: "Detalles principales",
    detalleIntro:
      "Información organizada para consultar rápido y comprar con más confianza.",
  };
};

const obtenerAtributos = (
  contexto: ContextoFicha,
  publicacion: PublicacionPerfilVendedor,
  perfil: PerfilPublicoVendedor,
) => {
  const categoria = publicacion.categoria || "Sin categoría";
  const ubicacion =
    publicacion.ubicacion || perfil.ciudadVisible || "A consultar";
  const estado = publicacion.estado || "Disponible";

  const base = [
    { label: "Categoría", value: categoria, icon: Tag },
    { label: "Ubicación", value: ubicacion, icon: MapPin },
    { label: "Estado", value: estado, icon: CheckCircle2 },
  ];

  if (contexto.tipo === "vehiculo") {
    return [
      ...base,
      { label: "Atención", value: "Consulta / visita", icon: CalendarDays },
      { label: "Tipo", value: "Vehículos/Motos", icon: Sparkles },
    ];
  }

  if (contexto.tipo === "inmueble") {
    return [
      ...base,
      { label: "Visita", value: "Agenda disponible", icon: CalendarDays },
      {
        label: "Mapa",
        value: publicacion.googleMapsUrl ? "Disponible" : "A consultar",
        icon: Navigation,
      },
    ];
  }

  if (contexto.tipo === "gastronomia") {
    return [
      ...base,
      { label: "Pedido", value: "WhatsApp", icon: MessageCircle },
      { label: "Entrega", value: "Consultar delivery", icon: Store },
    ];
  }

  if (contexto.tipo === "servicio") {
    return [
      ...base,
      { label: "Cotización", value: "Personalizada", icon: MessageCircle },
      { label: "Modalidad", value: "A coordinar", icon: Clock3 },
    ];
  }

  return [
    ...base,
    { label: "Stock", value: "A consultar", icon: Store },
    { label: "Atención", value: "WhatsApp directo", icon: MessageCircle },
  ];
};

const obtenerDetallesLista = (
  contexto: ContextoFicha,
  publicacion: PublicacionPerfilVendedor,
  perfil: PerfilPublicoVendedor,
) => {
  const categoria = publicacion.categoria || "Sin categoría";
  const ubicacion =
    publicacion.ubicacion || perfil.ciudadVisible || "A consultar";
  const estado = publicacion.estado || "Disponible";

  if (contexto.tipo === "vehiculo") {
    return [
      `Categoría: ${categoria}`,
      `Estado: ${estado}`,
      `Ubicación: ${ubicacion}`,
      "Inspección y detalles por WhatsApp",
      "Consulta rápida con el vendedor",
    ];
  }

  if (contexto.tipo === "inmueble") {
    return [
      `Tipo: ${categoria}`,
      `Zona: ${ubicacion}`,
      "Agenda de visita disponible",
      "Ubicación en mapa cuando esté disponible",
      "Contacto directo con el vendedor",
    ];
  }

  if (contexto.tipo === "gastronomia") {
    return [
      `Rubro: ${perfil.rubro || categoria}`,
      "Stock y disponibilidad a confirmar",
      "Consulta de delivery por WhatsApp",
      "Retiro o entrega según disponibilidad",
      "Atención personalizada",
    ];
  }

  if (contexto.tipo === "servicio") {
    return [
      `Servicio: ${categoria}`,
      "Cotización personalizada",
      "Alcance a definir con el cliente",
      "Comunicación directa por WhatsApp",
      "Acompañamiento según necesidad",
    ];
  }

  return [
    `Categoría: ${categoria}`,
    `Estado: ${estado}`,
    `Ubicación: ${ubicacion}`,
    "Disponibilidad a consultar",
    "Atención directa del vendedor",
  ];
};

const PerfilPublicacionDetalleModal: React.FC<Props> = ({
  publicacion,
  perfil,
  onClose,
}) => {
  const [indiceActual, setIndiceActual] = useState(0);
  const [mostrarModalVisita, setMostrarModalVisita] = useState(false);
  const [mostrarModalConsulta, setMostrarModalConsulta] = useState(false);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
  const [tabActivo, setTabActivo] = useState<
    "descripcion" | "detalles" | "ubicacion" | "vendedor"
  >("descripcion");

  const obtenerUrlImagen = (img: any): string => {
    if (!img) return "";
    if (typeof img === "string") return img;

    return (
      img?.mainUrl ||
      img?.MainUrl ||
      img?.thumbUrl ||
      img?.ThumbUrl ||
      img?.url ||
      img?.Url ||
      ""
    );
  };

  const imagenes = useMemo(() => {
    const lista = [
      ...(publicacion.imagenes || []).map((img) => img),
      publicacion.imagenPrincipal,
      publicacion.thumbUrl,
    ].filter((item) => Boolean(obtenerUrlImagen(item)));

    const vistos = new Set<string>();

    return lista.filter((item) => {
      const url = obtenerUrlImagen(item);

      if (!url || vistos.has(url)) return false;

      vistos.add(url);
      return true;
    });
  }, [publicacion.imagenes, publicacion.imagenPrincipal, publicacion.thumbUrl]);

  useEffect(() => {
    setIndiceActual(0);
    setTabActivo("descripcion");
    setMostrarModalConsulta(false);
    setMostrarModalVisita(false);

    if (!publicacion?.id) return;

    registrarVistaPublicacion(publicacion.id).catch((error) => {
      console.error(
        "No se pudo registrar la vista desde la vitrina pública",
        error,
      );
    });

    registrarMetaAngelaViewContent(publicacion);
  }, [publicacion.id]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (mostrarModalConsulta) {
          setMostrarModalConsulta(false);
          return;
        }

        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, mostrarModalConsulta]);

  const mediaActiva =
    imagenes[indiceActual] ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1600";

  const precio = formatearPrecio(publicacion.precio, publicacion.moneda);

  const vendedor =
    perfil.nombreNegocio?.trim() ||
    perfil.nombreUsuario?.trim() ||
    "Tu Vendedor";

  const urlVitrina = buildVitrinaUrl(perfil.slug);

  const urlPublicacion = `${urlVitrina}?producto=${encodeURIComponent(
    String(publicacion.id),
  )}`;

  const urlMapa = construirUrlMapa(publicacion);
  const contexto = obtenerContextoFicha(publicacion, perfil);
  const atributos = obtenerAtributos(contexto, publicacion, perfil);
  const detallesLista = obtenerDetallesLista(contexto, publicacion, perfil);

  const puedeAgendarVisita = ["vehiculo", "inmueble"].includes(contexto.tipo);

  const publicacionPermiteDelivery = Boolean(
    (publicacion as any).permiteDelivery ??
    (publicacion as any).PermiteDelivery,
  );

  const puedeConsultarDelivery =
    publicacionPermiteDelivery &&
    !["vehiculo", "inmueble"].includes(contexto.tipo);

  const mensajeConsulta = `Hola,

Vi esta publicación en la vitrina de ${vendedor} y quiero más información.

🏷️ ${publicacion.titulo}
${publicacion.categoria ? `📌 ${publicacion.categoria}` : ""}
${publicacion.ubicacion ? `📍 ${publicacion.ubicacion}` : ""}
💰 ${precio}

Ver publicación:
${urlPublicacion}`;

  const mensajeRetiro = `Hola,

Vi esta publicación en la vitrina de ${vendedor} y quiero coordinar retiro o entrega.

🏷️ ${publicacion.titulo}
${publicacion.categoria ? `📌 ${publicacion.categoria}` : ""}
💰 ${precio}

Ver publicación:
${urlPublicacion}`;

  const mensajeDeliveryManual = `Hola,

Vi esta publicación en la vitrina de ${vendedor} y quiero consultar si pueden enviarme por delivery.

🏷️ ${publicacion.titulo}
${publicacion.categoria ? `📌 ${publicacion.categoria}` : ""}
💰 ${precio}

📍 Ubicación del cliente:
Voy a enviar mi ubicación o dirección por este chat.

Ver publicación:
${urlPublicacion}`;

  const construirMensajeDeliveryConUbicacion = (
    latitud: number,
    longitud: number,
  ) => {
    const linkMapaCliente = `https://www.google.com/maps?q=${latitud},${longitud}`;

    return `Hola,

Vi esta publicación en la vitrina de ${vendedor} y quiero consultar si pueden enviarme por delivery.

🏷️ ${publicacion.titulo}
${publicacion.categoria ? `📌 ${publicacion.categoria}` : ""}
💰 ${precio}

🚚 Modalidad: Enviar por delivery

📍 Ubicación del cliente:
${linkMapaCliente}

Ver publicación:
${urlPublicacion}`;
  };

  const irAnterior = () => {
    if (imagenes.length <= 1) return;

    setIndiceActual((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const irSiguiente = () => {
    if (imagenes.length <= 1) return;

    setIndiceActual((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  const cerrarModal = () => {
    setMostrarModalVisita(false);
    setMostrarModalConsulta(false);
    onClose();
  };

  const enviarWhatsappConMensaje = (mensaje: string) => {
    const numero = limpiarTelefonoWhatsapp(perfil.whatsapp);

    if (!numero) {
      abrirWhatsapp(perfil.whatsapp, mensaje);
      return;
    }

    registrarClickWhatsapp(publicacion.id).catch((error) => {
      console.error(
        "No se pudo registrar click de WhatsApp desde vitrina pública",
        error,
      );
    });

    registrarMetaAngelaContactoWhatsapp(publicacion);

    abrirWhatsapp(perfil.whatsapp, mensaje);
  };

  const handleAbrirWhatsapp = () => {
    if (puedeConsultarDelivery) {
      setMostrarModalConsulta(true);
      return;
    }

    enviarWhatsappConMensaje(mensajeConsulta);
  };

  const handleConsultaNormal = () => {
    setMostrarModalConsulta(false);
    enviarWhatsappConMensaje(mensajeConsulta);
  };

  const handleConsultaRetiro = () => {
    setMostrarModalConsulta(false);
    enviarWhatsappConMensaje(mensajeRetiro);
  };

  const handleConsultaDeliveryManual = () => {
    setMostrarModalConsulta(false);
    enviarWhatsappConMensaje(mensajeDeliveryManual);
  };

  const handleConsultaDeliveryConUbicacion = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: "info",
        title: "Ubicación no disponible",
        text: "Tu navegador no permite obtener ubicación. Abriremos WhatsApp para que puedas enviar tu dirección manualmente.",
        confirmButtonColor: "#facc15",
        background: "#111827",
        color: "#ffffff",
      }).then(() => {
        handleConsultaDeliveryManual();
      });

      return;
    }

    setObteniendoUbicacion(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setObteniendoUbicacion(false);
        setMostrarModalConsulta(false);

        const { latitude, longitude } = position.coords;
        const mensaje = construirMensajeDeliveryConUbicacion(
          latitude,
          longitude,
        );

        enviarWhatsappConMensaje(mensaje);
      },
      () => {
        setObteniendoUbicacion(false);

        Swal.fire({
          icon: "info",
          title: "No pudimos obtener tu ubicación",
          text: "Puede ser que hayas rechazado el permiso. Igual podés consultar por WhatsApp y enviar tu dirección manualmente.",
          confirmButtonColor: "#facc15",
          background: "#111827",
          color: "#ffffff",
        }).then(() => {
          handleConsultaDeliveryManual();
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const abrirModalVisita = () => {
    registrarMetaAngelaAperturaAgendaVisita(publicacion);
    setMostrarModalVisita(true);
  };

  const handleAccionSecundaria = () => {
    if (puedeAgendarVisita) {
      abrirModalVisita();
      return;
    }

    if (puedeConsultarDelivery) {
      setMostrarModalConsulta(true);
      return;
    }

    enviarWhatsappConMensaje(mensajeConsulta);
  };

  const compartirPublicacion = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: publicacion.titulo,
          text: `Mirá esta publicación de ${vendedor}`,
          url: urlPublicacion,
        });
        return;
      }

      await navigator.clipboard.writeText(urlPublicacion);

      Swal.fire({
        icon: "success",
        title: "Link copiado",
        text: "El enlace de la publicación se copió al portapapeles.",
        confirmButtonColor: "#facc15",
        background: "#111827",
        color: "#ffffff",
      });
    } catch {
      // El usuario pudo cancelar el compartir nativo.
    }
  };

  const renderResumenProducto = () => {
    return (
      <div className="rounded-[20px] border border-white/10 bg-[#101722]/95 p-3 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-[10px] font-black text-yellow-200">
            {contexto.etiqueta}
          </span>

          {publicacion.ubicacion && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-bold text-gray-300">
              <MapPin size={11} />
              {publicacion.ubicacion}
            </span>
          )}

          {puedeConsultarDelivery && (
            <span className="inline-flex items-center gap-1 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-[10px] font-black text-green-200">
              <Store size={11} />
              Delivery a consultar
            </span>
          )}
        </div>

        <h2 className="mt-3 line-clamp-2 break-words text-[18px] font-black leading-snug text-white sm:text-xl lg:text-[21px]">
          {publicacion.titulo}
        </h2>

        <div className="mt-3 rounded-2xl border border-yellow-400/25 bg-yellow-400/[0.07] px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-yellow-300">
                Precio
              </p>

              <p className="mt-1 truncate text-[22px] font-black leading-none text-white sm:text-2xl">
                {precio}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-green-500/15 px-2.5 py-1 text-[10px] font-black text-green-200 ring-1 ring-green-400/20">
              Consultable
            </span>
          </div>
        </div>

        <div className="mt-3 hidden grid-cols-2 gap-2 lg:grid">
          <button
            type="button"
            onClick={handleAbrirWhatsapp}
            className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-green-500 px-3 py-2 text-xs font-black text-white shadow-lg shadow-green-500/20 transition hover:bg-green-400"
          >
            <MessageCircle size={15} />
            WhatsApp
          </button>

          <button
            type="button"
            onClick={handleAccionSecundaria}
            className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-yellow-400 px-3 py-2 text-xs font-black text-black shadow-lg shadow-yellow-400/20 transition hover:bg-yellow-300"
          >
            <CalendarDays size={15} />
            {puedeAgendarVisita ? "Agendar" : "Consultar"}
          </button>
        </div>

        <div className="mt-2 hidden grid-cols-2 gap-2 lg:grid">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black text-gray-200 transition hover:bg-white/[0.09]"
          >
            <Heart size={14} />
            Guardar
          </button>

          <button
            type="button"
            onClick={compartirPublicacion}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black text-gray-200 transition hover:bg-white/[0.09]"
          >
            <Share2 size={14} />
            Compartir
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {atributos.slice(0, 4).map((atributo) => {
            const Icono = atributo.icon;

            return (
              <div
                key={`${atributo.label}-${atributo.value}`}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5"
              >
                <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-gray-500">
                  <Icono size={11} className="text-yellow-300" />
                  {atributo.label}
                </p>

                <p className="mt-1 line-clamp-1 text-[11px] font-black leading-4 text-white">
                  {atributo.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-[#0b111c] p-3">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">
            Vendedor
          </p>

          <div className="mt-2 flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
              {perfil.fotoPerfil ? (
                <img
                  src={perfil.fotoPerfil}
                  alt={vendedor}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-black text-yellow-300">
                  TV
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">
                {vendedor}
              </p>

              <p className="truncate text-[11px] text-gray-400">
                {perfil.rubro || "Vendedor"}
                {perfil.ciudadVisible ? ` · ${perfil.ciudadVisible}` : ""}
              </p>
            </div>
          </div>

          <a
            href={urlVitrina}
            className="mt-3 flex w-full items-center justify-center rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-[11px] font-black text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
          >
            Ver vitrina
          </a>
        </div>
      </div>
    );
  };

  const renderTabContenido = () => {
    if (tabActivo === "descripcion") {
      return (
        <div>
          <p className="whitespace-pre-line text-sm leading-7 text-gray-200">
            {publicacion.descripcion ||
              "Esta publicación todavía no tiene una descripción detallada. Consultá al vendedor para recibir más información."}
          </p>
        </div>
      );
    }

    if (tabActivo === "detalles") {
      return (
        <div>
          <h3 className="text-lg font-black text-white">
            {contexto.detalleTitulo}
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            {contexto.detalleIntro}
          </p>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {detallesLista.map((detalle) => (
              <li
                key={detalle}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-gray-200"
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-yellow-300"
                />
                <span>{detalle}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (tabActivo === "ubicacion") {
      return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">
            Ubicación / entrega
          </p>

          <h3 className="mt-2 text-xl font-black text-white">
            {publicacion.ubicacion || perfil.ciudadVisible || "A consultar"}
          </h3>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            Consultá la ubicación, retiro, entrega o visita según el tipo de
            publicación. Para coordinar, usá el botón fijo de WhatsApp que
            aparece abajo.
          </p>

          {urlMapa && (
            <a
              href={urlMapa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
            >
              <Navigation size={17} />
              Ver en Google Maps
            </a>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/90 p-0 backdrop-blur-sm sm:p-3 md:p-5">
        <div className="relative mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-none border border-white/10 bg-[#070b12] shadow-2xl sm:rounded-[28px]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.08),transparent_35%)]" />

          <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-[#070b12]/90 px-3 py-3 backdrop-blur-md sm:px-4 md:px-5">
            <button
              type="button"
              onClick={cerrarModal}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-yellow-300 transition hover:border-yellow-400/50 hover:bg-yellow-400 hover:text-black sm:px-4"
            >
              <ChevronLeft size={16} />
              Ver publicaciones
            </button>

            <div className="hidden min-w-0 items-center gap-2 text-xs font-bold text-gray-400 md:flex">
              <span>Inicio</span>
              <span>/</span>
              <span>{publicacion.categoria || "Publicación"}</span>
              <span>/</span>
              <span className="max-w-[260px] truncate text-white">
                {publicacion.titulo}
              </span>
            </div>

            <button
              type="button"
              onClick={cerrarModal}
              aria-label="Cerrar publicación"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
            >
              <X size={21} />
            </button>
          </div>

          <section className="tv-scroll relative z-10 min-h-0 flex-1 overflow-y-auto px-3 pb-24 pt-4 sm:px-4 md:px-5 lg:pb-8">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <div className="min-w-0">
                <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-black shadow-2xl shadow-black/40 sm:rounded-[26px]">
                  <div className="aspect-[4/3] min-h-[280px] sm:aspect-[16/10] lg:aspect-[16/9]">
                    <div className="block h-full w-full sm:hidden">
                      <VitrinaMedia
                        media={mediaActiva}
                        alt={publicacion.titulo}
                        className="h-full w-full"
                        objectFit="cover"
                        controls
                        muted
                        showVideoBadge
                        showPlayIcon={false}
                        showAudioControl
                      />
                    </div>

                    <div className="hidden h-full w-full sm:block">
                      <VitrinaMedia
                        media={mediaActiva}
                        alt={publicacion.titulo}
                        className="h-full w-full"
                        objectFit="contain"
                        controls
                        muted
                        showVideoBadge
                        showPlayIcon={false}
                        showAudioControl
                      />
                    </div>
                  </div>

                  {publicacion.esDestacada && (
                    <span className="absolute left-4 top-4 rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-black uppercase tracking-wide text-black shadow-xl">
                      Promo
                    </span>
                  )}

                  {imagenes.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={irAnterior}
                        aria-label="Imagen anterior"
                        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur transition hover:bg-yellow-400 hover:text-black sm:left-4 sm:h-11 sm:w-11"
                      >
                        <ChevronLeft size={22} />
                      </button>

                      <button
                        type="button"
                        onClick={irSiguiente}
                        aria-label="Imagen siguiente"
                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur transition hover:bg-yellow-400 hover:text-black sm:right-4 sm:h-11 sm:w-11"
                      >
                        <ChevronRight size={22} />
                      </button>
                    </>
                  )}
                </div>

                {imagenes.length > 1 && (
                  <div className="tv-scroll mt-3 flex gap-2 overflow-x-auto pb-1 sm:gap-3">
                    {imagenes.map((img, index) => (
                      <button
                        key={`${obtenerUrlImagen(img)}-${index}`}
                        type="button"
                        onClick={() => setIndiceActual(index)}
                        aria-label={`Ver imagen ${index + 1}`}
                        className={`h-16 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-black transition sm:h-20 sm:w-28 md:h-24 md:w-32 ${
                          indiceActual === index
                            ? "border-yellow-400 shadow-lg shadow-yellow-400/20"
                            : "border-white/10 opacity-75 hover:opacity-100"
                        }`}
                      >
                        <VitrinaMedia
                          media={img}
                          alt={`Vista ${index + 1}`}
                          className="h-full w-full"
                          objectFit="cover"
                          controls={false}
                          showVideoBadge={false}
                          showPlayIcon
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-4 lg:hidden">{renderResumenProducto()}</div>

                <div className="mt-4 rounded-[24px] border border-white/10 bg-[#101722]/90 p-4 shadow-xl shadow-black/20 sm:rounded-[26px] md:p-5">
                  <div className="tv-scroll flex gap-2 overflow-x-auto border-b border-white/10 pb-3">
                    {(
                      [
                        ["descripcion", contexto.tabs.descripcion],
                        ["detalles", contexto.tabs.detalles],
                        ["ubicacion", contexto.tabs.ubicacion],
                      ] as const
                    ).map(([clave, etiqueta]) => {
                      const activo = tabActivo === clave;

                      return (
                        <button
                          key={clave}
                          type="button"
                          onClick={() => setTabActivo(clave)}
                          className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-black transition ${
                            activo
                              ? "bg-yellow-400 text-black"
                              : "border border-white/10 bg-white/[0.04] text-gray-300 hover:bg-white/[0.08]"
                          }`}
                        >
                          {etiqueta}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-5">{renderTabContenido()}</div>
                </div>
              </div>

              <aside className="hidden lg:sticky lg:top-4 lg:block">
                {renderResumenProducto()}

                <div className="mt-4 rounded-[24px] border border-white/10 bg-[#101722]/90 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">
                    Confianza
                  </p>

                  <div className="mt-4 space-y-3">
                    {[
                      "Contacto directo sin intermediarios",
                      "Vendedor visible desde la primera pantalla",
                      "Información organizada por rubro",
                      "Botones rápidos para consultar",
                    ].map((item) => (
                      <p
                        key={item}
                        className="flex items-start gap-3 text-sm font-semibold leading-6 text-gray-300"
                      >
                        <ShieldCheck
                          size={17}
                          className="mt-1 shrink-0 text-green-300"
                        />
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <div
            className="relative z-20 shrink-0 border-t border-white/10 bg-[#101722]/95 px-3 pt-2 backdrop-blur-md lg:hidden"
            style={{ paddingBottom: "calc(8px + env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAbrirWhatsapp}
                className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#22c55e] px-3 py-2 text-[11px] font-black text-white shadow-sm transition hover:bg-[#16a34a]"
              >
                <MessageCircle size={14} strokeWidth={2} />
                WhatsApp
              </button>

              <button
                type="button"
                onClick={handleAccionSecundaria}
                className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-yellow-400 px-3 py-2 text-[11px] font-black text-black shadow-sm transition hover:bg-yellow-300"
              >
                <CalendarDays size={14} strokeWidth={2} />
                {puedeAgendarVisita ? "Agendar" : "Consultar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mostrarModalConsulta && (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md overflow-hidden rounded-[26px] border border-white/10 bg-[#101722] shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                  Consulta rápida
                </p>
                <h3 className="mt-1 text-lg font-black text-white">
                  ¿Cómo querés consultar?
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setMostrarModalConsulta(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 p-5">
              <button
                type="button"
                onClick={handleConsultaNormal}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left transition hover:border-yellow-400/40 hover:bg-white/[0.08]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-500/15 text-green-300">
                  <MessageCircle size={20} />
                </span>

                <span>
                  <span className="block text-sm font-black text-white">
                    Consulta normal
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-gray-400">
                    Enviar mensaje al vendedor para pedir más información.
                  </span>
                </span>
              </button>

              {puedeConsultarDelivery && (
                <button
                  type="button"
                  onClick={handleConsultaDeliveryConUbicacion}
                  disabled={obteniendoUbicacion}
                  className="flex w-full items-center gap-3 rounded-2xl border border-green-400/25 bg-green-500/10 p-4 text-left transition hover:border-green-400/50 hover:bg-green-500/15 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-500 text-white">
                    <Navigation size={20} />
                  </span>

                  <span>
                    <span className="block text-sm font-black text-white">
                      {obteniendoUbicacion
                        ? "Obteniendo ubicación..."
                        : "Enviar por delivery usando mi ubicación"}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-gray-400">
                      El cliente autoriza su ubicación y se envía un link de
                      Google Maps por WhatsApp.
                    </span>
                  </span>
                </button>
              )}

              {puedeConsultarDelivery && (
                <button
                  type="button"
                  onClick={handleConsultaDeliveryManual}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left transition hover:border-yellow-400/40 hover:bg-white/[0.08]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/15 text-yellow-300">
                    <MapPin size={20} />
                  </span>

                  <span>
                    <span className="block text-sm font-black text-white">
                      Enviar por delivery escribiendo mi dirección
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-gray-400">
                      Abrir WhatsApp y escribir la dirección manualmente.
                    </span>
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={handleConsultaRetiro}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left transition hover:border-yellow-400/40 hover:bg-white/[0.08]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/15 text-yellow-300">
                  <Store size={20} />
                </span>

                <span>
                  <span className="block text-sm font-black text-white">
                    Coordinar retiro o entrega
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-gray-400">
                    Ideal para confirmar disponibilidad, horario o forma de
                    entrega.
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <SolicitarVisitaModal
        abierto={mostrarModalVisita}
        publicacion={publicacion}
        onClose={() => setMostrarModalVisita(false)}
      />
    </>
  );
};

export default PerfilPublicacionDetalleModal;

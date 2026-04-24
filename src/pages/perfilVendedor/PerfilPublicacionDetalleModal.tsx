import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

import SolicitarVisitaModal from "./SolicitarVisitaModal";
import {
  PublicacionPerfilVendedor,
  PerfilPublicoVendedor,
} from "../../types/perfilVendedor.types";
import { buildVitrinaUrl } from "../../config/appConfig";

interface Props {
  publicacion: PublicacionPerfilVendedor;
  perfil: PerfilPublicoVendedor;
  onClose: () => void;
}

const formatearPrecio = (precio?: number | null): string => {
  if (!precio || precio <= 0) return "Consultar precio";

  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0,
  }).format(precio);
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

  if (
    publicacion.latitud !== null &&
    publicacion.latitud !== undefined &&
    publicacion.longitud !== null &&
    publicacion.longitud !== undefined
  ) {
    return `https://www.google.com/maps?q=${publicacion.latitud},${publicacion.longitud}`;
  }

  if (publicacion.ubicacion) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      publicacion.ubicacion,
    )}`;
  }

  return "";
};

const PerfilPublicacionDetalleModal: React.FC<Props> = ({
  publicacion,
  perfil,
  onClose,
}) => {
  const [indiceActual, setIndiceActual] = useState(0);
  const [mostrarModalVisita, setMostrarModalVisita] = useState(false);

  const obtenerUrlImagen = (img: any): string => {
    if (!img) return "";
    if (typeof img === "string") return img;
    return img?.mainUrl || img?.thumbUrl || img?.url || img?.Url || "";
  };

  const imagenes = useMemo(() => {
    const lista = [
      ...(publicacion.imagenes || []).map(obtenerUrlImagen),
      obtenerUrlImagen(publicacion.imagenPrincipal),
      obtenerUrlImagen(publicacion.thumbUrl),
    ].filter(Boolean);

    return Array.from(new Set(lista));
  }, [publicacion.imagenes, publicacion.imagenPrincipal, publicacion.thumbUrl]);

  useEffect(() => {
    setIndiceActual(0);
  }, [publicacion.id]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const imagenActiva =
    imagenes[indiceActual] ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1600";

  const precio = formatearPrecio(publicacion.precio);

  const vendedor =
    perfil.nombreNegocio?.trim() ||
    perfil.nombreUsuario?.trim() ||
    "Tu Vendedor";

  const urlCompartir = buildVitrinaUrl(perfil.slug);

  const urlMapa = construirUrlMapa(publicacion);

  const mensajeConsulta = `Hola,

Vi esta publicación en la vitrina de ${vendedor} y quiero más información.

🏷️ ${publicacion.titulo}
${publicacion.categoria ? `📌 ${publicacion.categoria}` : ""}
${publicacion.ubicacion ? `📍 ${publicacion.ubicacion}` : ""}
💰 ${precio}

Ver publicación:
${urlCompartir}?producto=${publicacion.id}`;

  const esInmueble = useMemo(() => {
    const texto =
      `${publicacion.categoria || ""} ${perfil.rubro || ""}`.toLowerCase();

    return [
      "inmueble",
      "inmuebles",
      "casa",
      "casas",
      "terreno",
      "terrenos",
      "departamento",
      "departamentos",
      "alquiler",
      "venta",
      "propiedad",
      "propiedades",
      "duplex",
      "dúplex",
      "local",
      "locales",
      "oficina",
      "oficinas",
      "quinta",
      "quintas",
    ].some((palabra) => texto.includes(palabra));
  }, [publicacion.categoria, perfil.rubro]);

  const irAnterior = () => {
    if (imagenes.length <= 1) return;
    setIndiceActual((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const irSiguiente = () => {
    if (imagenes.length <= 1) return;
    setIndiceActual((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm">
        <div className="flex h-full w-full items-center justify-center p-2 md:p-6">
          <div className="relative h-[96dvh] w-full max-w-7xl overflow-hidden rounded-[24px] border border-white/10 bg-[#080b12] shadow-2xl">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-yellow-300 transition hover:bg-black/80"
            >
              <X size={21} />
            </button>

            <section className="flex h-full flex-col overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:overflow-hidden">
              <div className="relative flex h-[48dvh] min-h-[330px] shrink-0 items-center justify-center bg-black p-3 lg:h-full lg:p-6">
                <img
                  src={imagenActiva}
                  alt={publicacion.titulo}
                  className="max-h-full max-w-full rounded-2xl object-contain"
                />

                {imagenes.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={irAnterior}
                      className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white"
                    >
                      <ChevronLeft size={22} />
                    </button>

                    <button
                      type="button"
                      onClick={irSiguiente}
                      className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}

                {imagenes.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center px-3">
                    <div className="flex max-w-full gap-2 overflow-x-auto rounded-2xl bg-black/55 px-2 py-2 backdrop-blur">
                      {imagenes.map((img, index) => (
                        <button
                          key={`${img}-${index}`}
                          type="button"
                          onClick={() => setIndiceActual(index)}
                          className={`h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 transition md:h-16 md:w-16 ${
                            indiceActual === index
                              ? "border-yellow-400"
                              : "border-transparent"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Vista ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <aside className="flex min-h-0 flex-col overflow-visible bg-[#101722] p-4 text-white lg:h-full lg:overflow-y-auto lg:border-l lg:border-white/10 lg:p-5">
                <div className="mb-3 pr-10 lg:pr-0">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">
                    Publicación
                  </p>

                  <h2 className="mt-2 text-[22px] font-bold leading-tight text-white lg:text-3xl">
                    {publicacion.titulo}
                  </h2>

                  {publicacion.ubicacion && (
                    <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-gray-300 lg:text-sm">
                      <MapPin
                        size={14}
                        className="mt-0.5 shrink-0 text-yellow-300"
                      />
                      <span>{publicacion.ubicacion}</span>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-[#181f2b] p-4 ring-1 ring-yellow-400/20 lg:p-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-300">
                    Precio
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-white lg:text-3xl">
                    {precio}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#151922] p-4 ring-1 ring-white/10">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400">
                      Categoría
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {publicacion.categoria || "Sin categoría"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#151922] p-4 ring-1 ring-white/10">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400">
                      Ubicación
                    </p>
                    <p className="mt-2 text-xs font-semibold leading-5 text-white lg:text-sm">
                      {publicacion.ubicacion || "No especificada"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-[#151922] p-4 ring-1 ring-white/10 lg:p-5">
                  <p className="text-base font-semibold text-white">
                    Descripción
                  </p>
                  <p className="mt-3 whitespace-pre-line text-[13px] leading-6 text-gray-300 lg:text-sm lg:leading-7">
                    {publicacion.descripcion || "Sin descripción."}
                  </p>
                </div>

                {urlMapa && (
                  <div className="mt-3 rounded-2xl bg-[#151922] p-4 ring-1 ring-white/10 lg:p-5">
                    <p className="text-base font-semibold text-white">
                      Ubicación
                    </p>
                    <p className="mt-2 text-xs leading-5 text-gray-300 lg:text-sm">
                      {publicacion.ubicacion || "Ver ubicación"}
                    </p>

                    <a
                      href={urlMapa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex min-h-10 w-full items-center justify-center rounded-xl bg-[#1f3b17] px-4 py-2.5 text-[13px] font-semibold text-yellow-300 transition hover:bg-[#28501d]"
                    >
                      Ver en Google Maps
                    </a>
                  </div>
                )}

                <div className="mt-3 rounded-2xl bg-[#151922] p-4 ring-1 ring-white/10 lg:p-5">
                  <p className="text-base font-semibold text-white">Vendedor</p>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#1f1f1f] ring-1 ring-white/10">
                      {perfil.fotoPerfil ? (
                        <img
                          src={perfil.fotoPerfil}
                          alt={vendedor}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-medium text-yellow-300">
                          TV
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {vendedor}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {perfil.rubro || "Vendedor"}
                        {perfil.ciudadVisible
                          ? ` · ${perfil.ciudadVisible}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-white/10 bg-[#101722]/95 pt-4 lg:sticky lg:bottom-0 lg:mt-5 lg:space-y-3 lg:pt-5 lg:backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() =>
                      abrirWhatsapp(perfil.whatsapp, mensajeConsulta)
                    }
                    className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#22c55e] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#16a34a] lg:min-h-11 lg:text-[14px]"
                  >
                    <MessageCircle size={15} strokeWidth={2} />
                    Hablar con el vendedor
                  </button>

                  {esInmueble && (
                    <button
                      type="button"
                      onClick={() => setMostrarModalVisita(true)}
                      className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-[13px] font-semibold text-black shadow-sm transition hover:bg-yellow-300 lg:min-h-11 lg:text-[14px]"
                    >
                      <CalendarDays size={15} strokeWidth={2} />
                      Agendar visita
                    </button>
                  )}
                </div>
              </aside>
            </section>
          </div>
        </div>
      </div>

      <SolicitarVisitaModal
        abierto={mostrarModalVisita}
        publicacion={publicacion}
        onClose={() => setMostrarModalVisita(false)}
      />
    </>
  );
};

export default PerfilPublicacionDetalleModal;

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

import {
  PublicacionPerfilVendedor,
  PerfilPublicoVendedor,
} from "../../types/perfilVendedor.types";
import { buildProductoShareUrl } from "../../config/appConfig";

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

const PerfilPublicacionDetalleModal: React.FC<Props> = ({
  publicacion,
  perfil,
  onClose,
}) => {
  const imagenes = useMemo(() => {
    const lista = [
      ...(publicacion.imagenes || []),
      publicacion.imagenPrincipal,
      publicacion.thumbUrl,
    ]
      .filter(Boolean)
      .map((img) => String(img));

    return Array.from(new Set(lista));
  }, [publicacion.imagenes, publicacion.imagenPrincipal, publicacion.thumbUrl]);

  const [indiceActual, setIndiceActual] = useState(0);

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

  const urlCompartir = buildProductoShareUrl(publicacion.id);

  const mensajeConsulta = `Hola 👋

Vi esta publicación en la vitrina de ${vendedor} y quiero más información.

🏷️ ${publicacion.titulo}
${publicacion.categoria ? `📌 ${publicacion.categoria}` : ""}
${publicacion.ubicacion ? `📍 ${publicacion.ubicacion}` : ""}
💰 ${precio}

Ver publicación:
${urlCompartir}`;

  const mensajeVisita = `Hola 👋

Quiero agendar una visita para esta publicación:

🏷️ ${publicacion.titulo}
${publicacion.ubicacion ? `📍 ${publicacion.ubicacion}` : ""}
💰 ${precio}

Mis datos:
Nombre:
Teléfono:
Día preferido:
Horario preferido:

Ver publicación:
${urlCompartir}`;

  const esInmueble = useMemo(() => {
    const texto = `${publicacion.categoria || ""} ${
      perfil.rubro || ""
    }`.toLowerCase();

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
      "despensa",
      "bodega",
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
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/90 text-white antialiased">
      <div className="mx-auto flex min-h-full w-full max-w-[1700px] items-center justify-center p-3 sm:p-5">
        <section className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#090909] shadow-2xl lg:h-[92vh] lg:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-black/75 text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>

          {/* GALERÍA */}
          <div className="relative bg-black lg:flex lg:flex-1">
            <div className="absolute inset-0 hidden overflow-hidden lg:block">
              <img
                src={imagenActiva}
                alt=""
                className="absolute left-0 top-0 h-full w-[28%] scale-110 object-cover opacity-30 blur-3xl"
              />
              <img
                src={imagenActiva}
                alt=""
                className="absolute right-0 top-0 h-full w-[28%] scale-110 object-cover opacity-30 blur-3xl"
              />
            </div>

            {publicacion.categoria && (
              <span className="absolute left-4 top-4 z-30 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-white/10">
                {publicacion.categoria}
              </span>
            )}

            {imagenes.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={irAnterior}
                  className="absolute left-3 top-[42%] z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-yellow-300 transition hover:bg-yellow-400 hover:text-black sm:top-1/2"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={23} />
                </button>

                <button
                  type="button"
                  onClick={irSiguiente}
                  className="absolute right-3 top-[42%] z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-yellow-300 transition hover:bg-yellow-400 hover:text-black sm:top-1/2"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight size={23} />
                </button>
              </>
            )}

            <div className="relative flex w-full flex-col">
              <div className="flex h-[58vh] min-h-[410px] items-center justify-center bg-black p-3 sm:h-[64vh] sm:min-h-[470px] sm:p-5 lg:h-auto lg:min-h-0 lg:flex-1 lg:p-8">
                <img
                  src={imagenActiva}
                  alt={publicacion.titulo}
                  className="h-full max-h-full w-full object-contain"
                />
              </div>

              {imagenes.length > 1 && (
                <div className="border-t border-white/10 bg-[#0c0c0c] px-3 py-3 sm:px-5">
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {imagenes.map((imagen, index) => {
                      const activa = index === indiceActual;

                      return (
                        <button
                          key={`${imagen}-${index}`}
                          type="button"
                          onClick={() => setIndiceActual(index)}
                          className={[
                            "h-16 w-20 shrink-0 overflow-hidden rounded-lg border transition sm:h-20 sm:w-24",
                            activa
                              ? "border-yellow-400 ring-1 ring-yellow-400"
                              : "border-white/10 opacity-75 hover:border-white/40 hover:opacity-100",
                          ].join(" ")}
                          aria-label={`Ver imagen ${index + 1}`}
                        >
                          <img
                            src={imagen}
                            alt={`Vista ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* INFORMACIÓN */}
          <aside className="w-full border-t border-white/10 bg-[#101010] p-5 sm:p-6 lg:w-[405px] lg:overflow-y-auto lg:border-l lg:border-t-0">
            <div className="pr-10">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500">
                Publicación
              </p>

              <h2 className="mt-2 text-[25px] font-semibold leading-[1.12] tracking-[-0.02em] text-white sm:text-[30px]">
                {publicacion.titulo}
              </h2>

              {publicacion.ubicacion && (
                <div className="mt-3 flex items-center gap-2 text-[13px] text-gray-300">
                  <MapPin size={14} className="text-yellow-300" />
                  <span>{publicacion.ubicacion}</span>
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl bg-[#1b1a10] px-5 py-4 ring-1 ring-yellow-400/15">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow-300">
                Precio
              </p>
              <p className="mt-2 text-[26px] font-semibold tracking-[-0.02em] text-white">
                {precio}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#151922] p-4 ring-1 ring-white/10">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500">
                  Categoría
                </p>
                <p className="mt-2 text-[13px] font-medium leading-5 text-white">
                  {publicacion.categoria || "Sin categoría"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#151922] p-4 ring-1 ring-white/10">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500">
                  Ubicación
                </p>
                <p className="mt-2 text-[13px] font-medium leading-5 text-white">
                  {publicacion.ubicacion || "No especificada"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[#151922] p-5 ring-1 ring-white/10">
              <p className="text-[17px] font-semibold text-white">
                Descripción
              </p>
              <p className="mt-3 whitespace-pre-line text-[14px] font-normal leading-6 text-gray-200">
                {publicacion.descripcion ||
                  "El vendedor todavía no agregó una descripción detallada para esta publicación."}
              </p>
            </div>

            {publicacion.ubicacion && (
              <div className="mt-4 rounded-2xl bg-[#151922] p-5 ring-1 ring-white/10">
                <p className="text-[17px] font-semibold text-white">
                  Ubicación
                </p>
                <p className="mt-2 text-[13px] text-gray-300">
                  {publicacion.ubicacion}
                </p>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    publicacion.ubicacion,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl bg-[#172116] px-4 py-3 text-[13px] font-medium text-yellow-300 ring-1 ring-yellow-400/15 transition hover:bg-[#1f2b1c]"
                >
                  Ver en Google Maps
                </a>
              </div>
            )}

            <div className="mt-4 rounded-2xl bg-[#151922] p-5 ring-1 ring-white/10">
              <p className="text-[17px] font-semibold text-white">Vendedor</p>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#1f1f1f] ring-1 ring-white/10">
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
                  <p className="truncate text-[14px] font-medium text-white">
                    {vendedor}
                  </p>
                  <p className="truncate text-[12px] text-gray-400">
                    {perfil.rubro || "Vendedor"}
                    {perfil.ciudadVisible ? ` · ${perfil.ciudadVisible}` : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 mt-5 space-y-3 border-t border-white/10 bg-[#101010]/95 pt-5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => abrirWhatsapp(perfil.whatsapp, mensajeConsulta)}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#22c55e] px-5 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#16a34a]"
              >
                <MessageCircle size={16} strokeWidth={2} />
                Hablar con el vendedor
              </button>

              {esInmueble && (
                <button
                  type="button"
                  onClick={() => abrirWhatsapp(perfil.whatsapp, mensajeVisita)}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-[14px] font-semibold text-black shadow-sm transition hover:bg-yellow-300"
                >
                  <CalendarDays size={16} strokeWidth={2} />
                  Agendar visita
                </button>
              )}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default PerfilPublicacionDetalleModal;

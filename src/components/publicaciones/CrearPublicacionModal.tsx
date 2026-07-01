import React, { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  LocateFixed,
  MapPin,
  Store,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

import {
  actualizarPublicacion,
  crearPublicacion,
  obtenerCategorias,
} from "../../api/publicacionesService";
import {
  CategoriaPublicacionOption,
  ImagenExistenteEditable,
  PublicacionEditable,
} from "../../types/publicacion.types";

import { prepararCategoriasPublicacion } from "../../utils/categorias";

import { useCrearPublicacionForm } from "./hooks/useCrearPublicacionForm";
import PublicacionDatosBasicos from "./crear-publicacion/PublicacionDatosBasicos";
import PublicacionCamposInmuebles from "./crear-publicacion/PublicacionCamposInmuebles";
import PublicacionMediaUploader from "./crear-publicacion/PublicacionMediaUploader";
import PublicacionPlanCredito from "./crear-publicacion/PublicacionPlanCredito";
import PublicacionPreview from "./crear-publicacion/PublicacionPreview";

import {
  categoriasGenerales,
  crearFormDataPublicacion,
  esCategoriaInmobiliaria,
  limpiarPrecio,
} from "./crear-publicacion/helpers";

interface Props {
  abierto?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  onCreado?: () => void;
  onPublicacionCreada?: () => void;
  onActualizada?: () => void;
  categorias?: CategoriaPublicacionOption[];
  rubroVendedor?: string;
  vendedorOfreceDelivery?: boolean;
  modo?: "marketplace" | "perfil-vendedor";
  publicacionAEditar?: PublicacionEditable | null;
}

type UbicacionGpsForm = {
  latitud: string;
  longitud: string;
  googleMapsUrl: string;
};

const normalizarCoordenada = (valor?: string | number | null): string => {
  if (valor === null || valor === undefined || valor === "") return "";

  const texto = String(valor).trim().replace(",", ".");
  const numero = Number(texto);

  if (Number.isNaN(numero)) return "";

  return numero.toFixed(6);
};

const coordenadaParaBackend = (valor?: string | number | null): string => {
  const normalizada = normalizarCoordenada(valor);

  if (!normalizada) return "";

  // IMPORTANTE:
  // Al backend enviamos siempre con punto decimal.
  // No usar coma, porque en producción puede romper el valor decimal.
  return normalizada;
};

const coordenadaEstaEnRango = (
  valor: string,
  minimo: number,
  maximo: number,
): boolean => {
  if (!valor) return true;

  const numero = Number(valor);

  return !Number.isNaN(numero) && numero >= minimo && numero <= maximo;
};

const construirGoogleMapsUrl = (
  latitud?: string | number | null,
  longitud?: string | number | null,
): string => {
  const lat = normalizarCoordenada(latitud);
  const lng = normalizarCoordenada(longitud);

  if (!lat || !lng) return "";

  return `https://www.google.com/maps?q=${lat},${lng}`;
};

const CrearPublicacionModal: React.FC<Props> = ({
  abierto,
  isOpen,
  onClose,
  onCreado,
  onPublicacionCreada,
  onActualizada,
  categorias,
  rubroVendedor,
  vendedorOfreceDelivery = false,
  modo = "marketplace",
  publicacionAEditar = null,
}) => {
  const modalAbierto = abierto ?? isOpen ?? false;
  const [guardando, setGuardando] = useState(false);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
  const [categoriasRemotas, setCategoriasRemotas] = useState<
    CategoriaPublicacionOption[]
  >([]);

  const [ubicacionGps, setUbicacionGps] = useState<UbicacionGpsForm>({
    latitud: "",
    longitud: "",
    googleMapsUrl: "",
  });

  const [imagenesExistentesEditables, setImagenesExistentesEditables] =
    useState<ImagenExistenteEditable[]>([]);

  const {
    form,
    previews,
    actualizarCampo,
    actualizarCampoInmueble,
    actualizarPrecio,
    agregarArchivos,
    eliminarArchivo,
    agregarPlanCredito,
    actualizarPlanCredito,
    eliminarPlanCredito,
    limpiarFormulario,
    esEdicion,
  } = useCrearPublicacionForm(publicacionAEditar, modalAbierto);

  useEffect(() => {
    if (!modalAbierto) return;

    if (publicacionAEditar) {
      setUbicacionGps({
        latitud:
          publicacionAEditar.latitud !== null &&
          publicacionAEditar.latitud !== undefined
            ? normalizarCoordenada(publicacionAEditar.latitud)
            : "",
        longitud:
          publicacionAEditar.longitud !== null &&
          publicacionAEditar.longitud !== undefined
            ? normalizarCoordenada(publicacionAEditar.longitud)
            : "",
        googleMapsUrl: publicacionAEditar.googleMapsUrl ?? "",
      });

      setImagenesExistentesEditables(
        (publicacionAEditar.imagenesExistentes ?? []).filter((img) =>
          Boolean(img.mainUrl),
        ),
      );

      return;
    }

    setUbicacionGps({
      latitud: "",
      longitud: "",
      googleMapsUrl: "",
    });

    setImagenesExistentesEditables([]);
  }, [publicacionAEditar, modalAbierto]);

  const esModoVitrina = modo === "perfil-vendedor";

  const esInmobiliario =
    esCategoriaInmobiliaria(form.categoria) ||
    esCategoriaInmobiliaria(rubroVendedor);

  useEffect(() => {
    if (!modalAbierto) return;

    let cancelado = false;

    const cargarCategoriasModal = async () => {
      try {
        const data = await obtenerCategorias();

        if (cancelado) return;

        setCategoriasRemotas(prepararCategoriasPublicacion(data));
      } catch (error) {
        console.error("Error al cargar categorías para el modal:", error);
        setCategoriasRemotas([]);
      }
    };

    void cargarCategoriasModal();

    return () => {
      cancelado = true;
    };
  }, [modalAbierto]);

  const categoriasFinales = useMemo<CategoriaPublicacionOption[]>(() => {
    const fuente =
      categoriasRemotas && categoriasRemotas.length > 0
        ? categoriasRemotas
        : categorias && categorias.length > 0
          ? categorias
          : [];

    return prepararCategoriasPublicacion(fuente, categoriasGenerales);
  }, [categorias, categoriasRemotas]);

  const googleMapsUrlFinal = useMemo(() => {
    const urlPorCoordenadas = construirGoogleMapsUrl(
      ubicacionGps.latitud,
      ubicacionGps.longitud,
    );

    if (urlPorCoordenadas) return urlPorCoordenadas;

    return ubicacionGps.googleMapsUrl.trim();
  }, [ubicacionGps.latitud, ubicacionGps.longitud, ubicacionGps.googleMapsUrl]);

  const imagenesExistentes = imagenesExistentesEditables;
  const cantidadTotalImagenes =
    imagenesExistentes.length + form.archivos.length;

  if (!modalAbierto) return null;

  const validarFormulario = () => {
    if (!form.titulo.trim()) return "Ingresá el título de la publicación.";
    if (!form.descripcion.trim()) return "Ingresá la descripción.";
    if (!limpiarPrecio(form.precio)) return "Ingresá un precio válido.";
    if (!form.categoria.trim()) return "Seleccioná una categoría.";
    if (!esEdicion && !form.archivos.length) {
      return "Seleccioná al menos una imagen o video.";
    }

    if (esEdicion && cantidadTotalImagenes === 0) {
      return "La publicación debe conservar o cargar al menos una imagen o video.";
    }

    if (cantidadTotalImagenes > 10) {
      return "Máximo 10 imágenes o videos por publicación.";
    }

    const latitudBackend = coordenadaParaBackend(ubicacionGps.latitud);
    const longitudBackend = coordenadaParaBackend(ubicacionGps.longitud);

    if (latitudBackend && !coordenadaEstaEnRango(latitudBackend, -90, 90)) {
      return "La latitud debe estar entre -90 y 90. Ejemplo: -25.296120";
    }

    if (longitudBackend && !coordenadaEstaEnRango(longitudBackend, -180, 180)) {
      return "La longitud debe estar entre -180 y 180. Ejemplo: -57.590290";
    }

    return null;
  };

  const cerrarModal = () => {
    if (guardando) return;
    onClose();
  };

  const limpiarUbicacionGps = () => {
    setUbicacionGps({
      latitud: "",
      longitud: "",
      googleMapsUrl: "",
    });
  };

  const eliminarImagenExistente = (index: number) => {
    setImagenesExistentesEditables((actuales) =>
      actuales.filter((_, i) => i !== index),
    );
  };

  const eliminarTodasImagenesExistentes = () => {
    setImagenesExistentesEditables([]);
  };

  const actualizarUbicacionGps = (
    campo: keyof UbicacionGpsForm,
    valor: string,
  ) => {
    setUbicacionGps((actual) => {
      const actualizado = {
        ...actual,
        [campo]: valor,
      };

      if (campo === "latitud" || campo === "longitud") {
        actualizado.googleMapsUrl = construirGoogleMapsUrl(
          actualizado.latitud,
          actualizado.longitud,
        );
      }

      return actualizado;
    });
  };

  const usarUbicacionActual = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        title: "Ubicación no disponible",
        text: "Tu navegador no soporta geolocalización.",
        icon: "info",
        confirmButtonColor: "#facc15",
        background: "#111827",
        color: "#fff",
      });
      return;
    }

    setObteniendoUbicacion(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitud = normalizarCoordenada(position.coords.latitude);
        const longitud = normalizarCoordenada(position.coords.longitude);
        const googleMapsUrl = construirGoogleMapsUrl(latitud, longitud);

        setUbicacionGps({
          latitud,
          longitud,
          googleMapsUrl,
        });

        setObteniendoUbicacion(false);

        Swal.fire({
          title: "Ubicación cargada",
          text: "Se obtuvo la ubicación GPS correctamente.",
          icon: "success",
          timer: 1600,
          showConfirmButton: false,
          background: "#111827",
          color: "#fff",
        });
      },
      () => {
        setObteniendoUbicacion(false);

        Swal.fire({
          title: "No se pudo obtener ubicación",
          text: "Verificá los permisos del navegador o pegá el enlace de Google Maps manualmente.",
          icon: "warning",
          confirmButtonColor: "#facc15",
          background: "#111827",
          color: "#fff",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      },
    );
  };

  const abrirMapa = () => {
    if (!googleMapsUrlFinal) {
      Swal.fire({
        title: "Ubicación no cargada",
        text: "Ingresá latitud y longitud, pegá un enlace de Google Maps o usá tu ubicación actual.",
        icon: "info",
        confirmButtonColor: "#facc15",
        background: "#111827",
        color: "#fff",
      });
      return;
    }

    window.open(googleMapsUrlFinal, "_blank", "noopener,noreferrer");
  };

  const mostrarModalProcesando = () => {
    Swal.fire({
      title: esEdicion ? "Actualizando publicación" : "Creando publicación",
      html: `
        <div style="padding-top: 6px;">
          <p style="margin: 0; color: #cbd5e1; font-size: 14px;">
            ${
              esEdicion
                ? "Estamos guardando los cambios de tu publicación."
                : "Estamos guardando los datos, subiendo las imágenes y preparando tu vitrina."
            }
          </p>
          <p style="margin: 10px 0 0; color: #facc15; font-size: 13px; font-weight: 600;">
            Aguardá un momento...
          </p>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background: "#111827",
      color: "#ffffff",
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const error = validarFormulario();

    if (error) {
      Swal.fire({
        title: "Faltan datos",
        text: error,
        icon: "warning",
        confirmButtonColor: "#facc15",
        background: "#111827",
        color: "#fff",
      });
      return;
    }

    try {
      setGuardando(true);
      mostrarModalProcesando();

      const formData = crearFormDataPublicacion(form);

      const latitudBackend = coordenadaParaBackend(ubicacionGps.latitud);
      const longitudBackend = coordenadaParaBackend(ubicacionGps.longitud);

      if (latitudBackend) {
        formData.append("Latitud", latitudBackend);
      }

      if (longitudBackend) {
        formData.append("Longitud", longitudBackend);
      }

      if (googleMapsUrlFinal) {
        formData.append("GoogleMapsUrl", googleMapsUrlFinal);
      }

      if (esEdicion) {
        formData.append("GestionarImagenes", "true");

        imagenesExistentes.forEach((img) => {
          if (img.mainUrl) {
            formData.append("ImagenesConservar", img.mainUrl);
          }
        });
      }

      if (esEdicion && publicacionAEditar?.id) {
        await actualizarPublicacion(publicacionAEditar.id, formData);
      } else {
        await crearPublicacion(formData);
      }

      Swal.fire({
        title: esEdicion ? "¡Publicación actualizada!" : "¡Publicación creada!",
        text: esModoVitrina
          ? "La publicación ya puede verse en tu vitrina pública y también en el marketplace."
          : esEdicion
            ? "Los cambios se guardaron correctamente."
            : "La publicación fue creada correctamente.",
        icon: "success",
        confirmButtonColor: "#facc15",
        background: "#111827",
        color: "#fff",
      });

      limpiarFormulario();
      limpiarUbicacionGps();

      if (esEdicion) {
        onActualizada?.();
      } else {
        onCreado?.();
        onPublicacionCreada?.();
      }

      onClose();
    } catch (error: any) {
      console.error(
        esEdicion
          ? "Error al actualizar publicación:"
          : "Error al crear publicación:",
        error,
      );

      const mensaje =
        error?.response?.data?.Errors?.[0] ||
        error?.response?.data?.Message ||
        error?.message ||
        (esEdicion
          ? "No se pudo actualizar la publicación."
          : "No se pudo crear la publicación.");

      Swal.fire({
        title: esEdicion ? "No se pudo actualizar" : "No se pudo publicar",
        text: mensaje,
        icon: "error",
        confirmButtonColor: "#facc15",
        background: "#111827",
        color: "#fff",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 px-3 py-4 backdrop-blur-md">
      <div className="relative flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b111c] text-white shadow-2xl">
        <div className="shrink-0 border-b border-white/10 bg-gradient-to-r from-yellow-400/10 via-white/[0.03] to-green-500/10 px-5 py-4 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-yellow-300">
                {esModoVitrina ? <Store size={13} /> : <Wand2 size={13} />}
                {esModoVitrina
                  ? esEdicion
                    ? "Editar publicación de tu vitrina"
                    : "Nueva publicación para tu vitrina"
                  : esEdicion
                    ? "Editar publicación"
                    : "Marketplace"}
              </div>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {esEdicion ? "Editar publicación" : "Crear publicación"}
              </h2>

              <p className="mt-1 max-w-3xl text-sm font-normal leading-relaxed text-gray-400">
                {esModoVitrina
                  ? "Cargá fotos, precio, ubicación y descripción. Esta publicación aparecerá en tu vitrina pública, en el marketplace y podrá usarse en campañas de WhatsApp."
                  : "Cargá la información principal del producto. Si elegís una categoría inmobiliaria, aparecerán campos especiales para propiedades."}
              </p>
            </div>

            <button
              type="button"
              onClick={cerrarModal}
              disabled={guardando}
              className="shrink-0 rounded-full border border-white/10 bg-white/10 p-2 text-gray-300 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form
          id="crear-publicacion-form"
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="premium-scroll min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.82fr)]">
              <div className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/15 text-yellow-300">
                      <Wand2 size={19} />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Datos principales
                      </h3>
                      <p className="mt-1 text-[13px] font-normal leading-5 text-gray-400">
                        Usá un título claro, una descripción útil y una
                        ubicación visible para que el cliente entienda rápido la
                        publicación.
                      </p>
                    </div>
                  </div>

                  <PublicacionDatosBasicos
                    form={form}
                    categorias={categoriasFinales}
                    esInmobiliario={Boolean(esInmobiliario)}
                    vendedorOfreceDelivery={vendedorOfreceDelivery}
                    onCampo={actualizarCampo}
                    onPrecio={actualizarPrecio}
                  />
                </div>

                {esInmobiliario && (
                  <div className="rounded-3xl border border-yellow-400/15 bg-yellow-400/[0.04] p-4 sm:p-5">
                    <PublicacionCamposInmuebles
                      form={form}
                      onCampoInmueble={actualizarCampoInmueble}
                    />
                  </div>
                )}

                {esInmobiliario && (
                  <div className="rounded-3xl border border-emerald-400/15 bg-emerald-500/[0.045] p-4 sm:p-5">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-200">
                        <MapPin size={19} />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Ubicación exacta / GPS
                        </h3>
                        <p className="mt-1 text-[13px] font-normal leading-5 text-gray-400">
                          Si estás en el inmueble, usá tu ubicación actual. Si
                          no, pegá un enlace de Google Maps o cargá latitud y
                          longitud.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={ubicacionGps.latitud}
                        onChange={(event) =>
                          actualizarUbicacionGps("latitud", event.target.value)
                        }
                        placeholder="Latitud (ej: -25.289724)"
                        className="premium-input rounded-2xl border border-white/10 bg-[#020817] px-4 py-3 text-sm font-normal text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/60"
                      />

                      <input
                        type="text"
                        inputMode="decimal"
                        value={ubicacionGps.longitud}
                        onChange={(event) =>
                          actualizarUbicacionGps("longitud", event.target.value)
                        }
                        placeholder="Longitud (ej: -57.604542)"
                        className="premium-input rounded-2xl border border-white/10 bg-[#020817] px-4 py-3 text-sm font-normal text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/60"
                      />

                      <input
                        type="text"
                        value={googleMapsUrlFinal}
                        onChange={(event) =>
                          actualizarUbicacionGps(
                            "googleMapsUrl",
                            event.target.value,
                          )
                        }
                        placeholder="Pegá el enlace de Google Maps si ya lo tenés"
                        className="premium-input rounded-2xl border border-white/10 bg-[#020817] px-4 py-3 text-sm font-normal text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/60 sm:col-span-2"
                      />
                    </div>

                    {googleMapsUrlFinal && (
                      <div className="mt-3 rounded-2xl border border-emerald-400/10 bg-black/20 px-4 py-3 text-[12px] leading-5 text-emerald-100/80">
                        Mapa listo para esta publicación.
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={usarUbicacionActual}
                        disabled={obteniendoUbicacion || guardando}
                        className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <LocateFixed size={16} />
                        {obteniendoUbicacion
                          ? "Obteniendo ubicación..."
                          : "Usar mi ubicación actual"}
                      </button>

                      <button
                        type="button"
                        onClick={abrirMapa}
                        disabled={guardando}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <ExternalLink size={16} />
                        Ver mapa
                      </button>
                    </div>
                  </div>
                )}

                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-200">
                      <ImagePlus size={20} />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Fotos y videos
                      </h3>
                      <p className="mt-1 text-[13px] font-normal leading-5 text-gray-400">
                        {esEdicion
                          ? "Podés quitar imágenes actuales y agregar nuevas. Se guardará exactamente lo que quede seleccionado."
                          : "Agregá varias fotos para que la galería de la publicación se vea completa y profesional."}
                      </p>
                    </div>
                  </div>

                  {esEdicion && (
                    <div className="mb-5 rounded-2xl border border-emerald-400/10 bg-emerald-500/[0.04] p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-semibold text-emerald-200">
                            Imágenes actuales
                          </h4>

                          <p className="mt-1 text-xs leading-5 text-emerald-100/70">
                            Tocá el basurero para quitar una imagen. Si agregás
                            nuevas, se guardará exactamente lo que quede
                            seleccionado.
                          </p>
                        </div>

                        {imagenesExistentes.length > 0 && (
                          <button
                            type="button"
                            onClick={eliminarTodasImagenesExistentes}
                            disabled={guardando}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 size={13} />
                            Quitar todas
                          </button>
                        )}
                      </div>

                      {imagenesExistentes.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-yellow-400/25 bg-black/20 px-4 py-4 text-xs leading-5 text-yellow-100/75">
                          No queda ninguna imagen actual. Agregá una nueva antes
                          de guardar para reemplazar la publicación.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                          {imagenesExistentes.map((img, index) => (
                            <div
                              key={`${img.mainUrl}-${index}`}
                              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                            >
                              <img
                                src={img.thumbUrl || img.mainUrl}
                                alt={`Imagen actual ${index + 1}`}
                                className="h-28 w-full object-cover"
                              />

                              <button
                                type="button"
                                onClick={() => eliminarImagenExistente(index)}
                                disabled={guardando}
                                title="Quitar imagen"
                                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-300/30 bg-red-600/90 text-white shadow-lg transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <PublicacionMediaUploader
                    previews={previews}
                    onAgregarArchivos={agregarArchivos}
                    onEliminarArchivo={eliminarArchivo}
                  />
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
                  <PublicacionPlanCredito
                    form={form}
                    onMostrarCompra={(valor) =>
                      actualizarCampo("mostrarBotonesCompra", valor)
                    }
                    onAgregarPlan={agregarPlanCredito}
                    onActualizarPlan={actualizarPlanCredito}
                    onEliminarPlan={eliminarPlanCredito}
                  />
                </div>
              </div>

              <aside className="flex flex-col gap-5">
                <div className="sticky top-0 space-y-5">
                  <PublicacionPreview
                    form={form}
                    previews={previews}
                    imagenesExistentes={imagenesExistentes}
                  />

                  {googleMapsUrlFinal && (
                    <button
                      type="button"
                      onClick={abrirMapa}
                      disabled={guardando}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <MapPin size={17} />
                      Vista previa de ubicación en Google Maps
                    </button>
                  )}

                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-[13px] font-normal leading-6 text-slate-300">
                    {esModoVitrina ? (
                      <>
                        Tu publicación se mostrará en tu vitrina pública, en el
                        marketplace y también podrá compartirse desde campañas
                        de WhatsApp.
                      </>
                    ) : (
                      <>
                        Tu publicación se mostrará en el marketplace. Si tenés
                        perfil público de vendedor, también aparecerá en tu
                        vitrina.
                      </>
                    )}
                  </div>

                  <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.07] px-4 py-3.5 text-[13px] font-normal leading-6 text-emerald-100/90">
                    <p className="text-[13px] font-semibold text-emerald-200">
                      Consejo para vender mejor
                    </p>
                    <p className="mt-1 text-[13px] font-normal leading-6 text-emerald-100/75">
                      Subí al menos 3 fotos nítidas, agregá ubicación clara y
                      una descripción concreta. Eso ayuda mucho en WhatsApp y en
                      la vitrina.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>

          <div className="shrink-0 border-t border-white/10 bg-[#0b111c]/95 px-5 py-4 backdrop-blur sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-400">
                {esModoVitrina
                  ? "La publicación aparecerá en tu vitrina pública y en el marketplace."
                  : "La publicación aparecerá en el marketplace."}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={guardando}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-yellow-300/30 bg-yellow-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 size={18} strokeWidth={2} />
                  {guardando
                    ? esEdicion
                      ? "Guardando cambios..."
                      : "Publicando..."
                    : esEdicion
                      ? "Guardar cambios"
                      : "Publicar ahora"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearPublicacionModal;

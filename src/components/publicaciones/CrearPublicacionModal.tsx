import React, { FormEvent, useMemo, useState } from "react";
import {
  CheckCircle2,
  ImagePlus,
  LocateFixed,
  MapPin,
  Navigation,
  Store,
  Wand2,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

import { crearPublicacion } from "../../api/publicacionesService";
import { CategoriaPublicacionOption } from "../../types/publicacion.types";

import { useCrearPublicacionForm } from "./hooks/useCrearPublicacionForm";
import PublicacionDatosBasicos from "./crear-publicacion/PublicacionDatosBasicos";
import PublicacionCamposInmuebles from "./crear-publicacion/PublicacionCamposInmuebles";
import PublicacionMediaUploader from "./crear-publicacion/PublicacionMediaUploader";
import PublicacionPlanCredito from "./crear-publicacion/PublicacionPlanCredito";
import PublicacionPreview from "./crear-publicacion/PublicacionPreview";

import {
  categoriasGenerales,
  categoriasInmuebles,
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
  categorias?: CategoriaPublicacionOption[];
  rubroVendedor?: string;
  modo?: "marketplace" | "perfil-vendedor";
}

type UbicacionGpsForm = {
  latitud: string;
  longitud: string;
  googleMapsUrl: string;
};

const CrearPublicacionModal: React.FC<Props> = ({
  abierto,
  isOpen,
  onClose,
  onCreado,
  onPublicacionCreada,
  categorias,
  rubroVendedor,
  modo = "marketplace",
}) => {
  const modalAbierto = abierto ?? isOpen ?? false;
  const [guardando, setGuardando] = useState(false);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);

  const [ubicacionGps, setUbicacionGps] = useState<UbicacionGpsForm>({
    latitud: "",
    longitud: "",
    googleMapsUrl: "",
  });

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
  } = useCrearPublicacionForm();

  const esModoVitrina = modo === "perfil-vendedor";

  const esInmobiliario =
    esCategoriaInmobiliaria(form.categoria) ||
    esCategoriaInmobiliaria(rubroVendedor);

  const categoriasFinales = useMemo<CategoriaPublicacionOption[]>(() => {
    if (categorias?.length) return categorias;

    if (esCategoriaInmobiliaria(rubroVendedor)) {
      return categoriasInmuebles.map((nombre) => ({ nombre }));
    }

    return categoriasGenerales.map((nombre) => ({ nombre }));
  }, [categorias, rubroVendedor]);

  if (!modalAbierto) return null;

  const validarFormulario = () => {
    if (!form.titulo.trim()) return "Ingresá el título de la publicación.";
    if (!form.descripcion.trim()) return "Ingresá la descripción.";
    if (!limpiarPrecio(form.precio)) return "Ingresá un precio válido.";
    if (!form.categoria.trim()) return "Seleccioná una categoría.";
    if (!form.archivos.length) return "Seleccioná al menos una imagen o video.";

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

  const actualizarUbicacionGps = (
    campo: keyof UbicacionGpsForm,
    valor: string,
  ) => {
    setUbicacionGps((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const generarGoogleMapsUrl = (latitud: string, longitud: string) => {
    if (!latitud || !longitud) return "";

    return `https://www.google.com/maps?q=${latitud},${longitud}`;
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
        const latitud = position.coords.latitude.toFixed(6);
        const longitud = position.coords.longitude.toFixed(6);
        const googleMapsUrl = generarGoogleMapsUrl(latitud, longitud);

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

  const handleGenerarLinkMaps = () => {
    if (!ubicacionGps.latitud || !ubicacionGps.longitud) {
      Swal.fire({
        title: "Faltan coordenadas",
        text: "Ingresá latitud y longitud para generar el enlace.",
        icon: "info",
        confirmButtonColor: "#facc15",
        background: "#111827",
        color: "#fff",
      });
      return;
    }

    const googleMapsUrl = generarGoogleMapsUrl(
      ubicacionGps.latitud,
      ubicacionGps.longitud,
    );

    setUbicacionGps((actual) => ({
      ...actual,
      googleMapsUrl,
    }));
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

      const formData = crearFormDataPublicacion(form);

      /**
       * Nuevos campos GPS.
       * El backend puede ignorarlos si aún no están mapeados.
       * Cuando se agreguen en el request/backend, ya estarán llegando.
       */
      formData.append("Latitud", ubicacionGps.latitud ?? "");
      formData.append("Longitud", ubicacionGps.longitud ?? "");
      formData.append("GoogleMapsUrl", ubicacionGps.googleMapsUrl ?? "");

      await crearPublicacion(formData);

      Swal.fire({
        title: "¡Publicación creada!",
        text: esModoVitrina
          ? "La publicación ya puede verse en tu vitrina pública y también en el marketplace."
          : "La publicación fue creada correctamente.",
        icon: "success",
        confirmButtonColor: "#facc15",
        background: "#111827",
        color: "#fff",
      });

      limpiarFormulario();
      limpiarUbicacionGps();
      onCreado?.();
      onPublicacionCreada?.();
      onClose();
    } catch (error: any) {
      console.error("Error al crear publicación:", error);

      const mensaje =
        error?.response?.data?.Errors?.[0] ||
        error?.response?.data?.Message ||
        error?.message ||
        "No se pudo crear la publicación.";

      Swal.fire({
        title: "No se pudo publicar",
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
        <div className="border-b border-white/10 bg-gradient-to-r from-yellow-400/10 via-white/[0.03] to-green-500/10 px-5 py-4 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-yellow-300">
                {esModoVitrina ? <Store size={13} /> : <Wand2 size={13} />}
                {esModoVitrina
                  ? "Nueva publicación para tu vitrina"
                  : "Marketplace"}
              </div>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Crear publicación
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
          onSubmit={handleSubmit}
          className="
            premium-scroll grid flex-1 gap-5 overflow-y-auto p-5 sm:p-6
            lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.82fr)]
          "
        >
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
                    Usá un título claro, una descripción útil y una ubicación
                    visible para que el cliente entienda rápido la publicación.
                  </p>
                </div>
              </div>

              <PublicacionDatosBasicos
                form={form}
                categorias={categoriasFinales}
                esInmobiliario={Boolean(esInmobiliario)}
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
                      Agregá coordenadas o un enlace de Google Maps. Esto ayuda
                      muchísimo para visitas y propiedades.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={ubicacionGps.latitud}
                    onChange={(event) =>
                      actualizarUbicacionGps("latitud", event.target.value)
                    }
                    placeholder="Latitud (ej: -25.263739)"
                    className="premium-input rounded-2xl border border-white/10 bg-[#020817] px-4 py-3 text-sm font-normal text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/60"
                  />

                  <input
                    type="text"
                    value={ubicacionGps.longitud}
                    onChange={(event) =>
                      actualizarUbicacionGps("longitud", event.target.value)
                    }
                    placeholder="Longitud (ej: -57.575926)"
                    className="premium-input rounded-2xl border border-white/10 bg-[#020817] px-4 py-3 text-sm font-normal text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/60"
                  />

                  <input
                    type="text"
                    value={ubicacionGps.googleMapsUrl}
                    onChange={(event) =>
                      actualizarUbicacionGps(
                        "googleMapsUrl",
                        event.target.value,
                      )
                    }
                    placeholder="Pegá el enlace de Google Maps"
                    className="premium-input rounded-2xl border border-white/10 bg-[#020817] px-4 py-3 text-sm font-normal text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/60 sm:col-span-2"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={usarUbicacionActual}
                    disabled={obteniendoUbicacion}
                    className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LocateFixed size={16} />
                    {obteniendoUbicacion
                      ? "Obteniendo ubicación..."
                      : "Usar mi ubicación actual"}
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerarLinkMaps}
                    className="inline-flex items-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-2.5 text-sm font-medium text-yellow-100 transition hover:bg-yellow-500/15"
                  >
                    <Navigation size={16} />
                    Generar link Maps
                  </button>

                  {ubicacionGps.googleMapsUrl && (
                    <a
                      href={ubicacionGps.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      <MapPin size={16} />
                      Ver mapa
                    </a>
                  )}
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
                    Agregá varias fotos para que la galería de la publicación se
                    vea completa y profesional.
                  </p>
                </div>
              </div>

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
              <PublicacionPreview form={form} previews={previews} />

              {ubicacionGps.googleMapsUrl && (
                <a
                  href={ubicacionGps.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/15"
                >
                  <MapPin size={17} />
                  Vista previa de ubicación en Google Maps
                </a>
              )}

              <button
                type="submit"
                disabled={guardando}
                className="
                  flex w-full items-center justify-center gap-2 rounded-2xl
                  border border-yellow-300/30 bg-yellow-400 px-6 py-3.5
                  text-[15px] font-semibold text-slate-950 shadow-sm
                  transition hover:bg-yellow-300
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              >
                <CheckCircle2 size={18} strokeWidth={2} />
                {guardando ? "Publicando..." : "Publicar ahora"}
              </button>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-[13px] font-normal leading-6 text-slate-300">
                {esModoVitrina ? (
                  <>
                    Tu publicación se mostrará en tu vitrina pública, en el
                    marketplace y también podrá compartirse desde campañas de
                    WhatsApp.
                  </>
                ) : (
                  <>
                    Tu publicación se mostrará en el marketplace. Si tenés
                    perfil público de vendedor, también aparecerá en tu vitrina.
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.07] px-4 py-3.5 text-[13px] font-normal leading-6 text-emerald-100/90">
                <p className="text-[13px] font-semibold text-emerald-200">
                  Consejo para vender mejor
                </p>
                <p className="mt-1 text-[13px] font-normal leading-6 text-emerald-100/75">
                  Subí al menos 3 fotos nítidas, agregá ubicación clara y una
                  descripción concreta. Eso ayuda mucho en WhatsApp y en la
                  vitrina.
                </p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default CrearPublicacionModal;

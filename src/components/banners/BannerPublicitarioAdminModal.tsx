import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { ImagePlus, X } from "lucide-react";

import {
  BANNER_ESTADOS,
  BANNER_TIPOS_DESTINO,
  BANNER_UBICACIONES,
  type BannerEstado,
  type BannerPublicitarioAdmin,
  type BannerPublicitarioArchivosForm,
  type BannerPublicitarioFormValues,
  type BannerTipoDestino,
  type BannerUbicacion,
  type ConfiguracionBannersPublicitarios,
} from "../../types/bannerPublicitario";

interface Props {
  abierto: boolean;
  banner?: BannerPublicitarioAdmin | null;
  configuracion?: ConfiguracionBannersPublicitarios | null;
  procesando?: boolean;

  onClose: () => void;

  onGuardar: (
    valores: BannerPublicitarioFormValues,
    archivos: BannerPublicitarioArchivosForm,
  ) => Promise<void>;
}

interface SelectorImagenProps {
  id: string;
  titulo: string;
  ayuda: string;

  archivo?: File | null;
  imagenActual?: string | null;
  disabled?: boolean;

  onChange: (archivo: File | null) => void;
}

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

function pad(valor: number) {
  return String(valor).padStart(2, "0");
}

function fechaLocalParaInput(fecha: Date) {
  return `${fecha.getFullYear()}-${pad(
    fecha.getMonth() + 1,
  )}-${pad(fecha.getDate())}T${pad(
    fecha.getHours(),
  )}:${pad(fecha.getMinutes())}`;
}

function sumarDias(fecha: Date, dias: number) {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);

  return resultado;
}

function normalizarFechaInput(valor?: string | null) {
  if (!valor) {
    return "";
  }

  const fecha = new Date(valor);

  return Number.isNaN(fecha.getTime())
    ? valor.slice(0, 16)
    : fechaLocalParaInput(fecha);
}

function unirOpcionesUnicas<T extends string>(
  opcionesBase: T[],
  opcionesConfiguradas?: T[] | null,
): T[] {
  const opciones = [...opcionesBase, ...(opcionesConfiguradas ?? [])].filter(
    Boolean,
  );

  return Array.from(new Set(opciones));
}

function crearValoresIniciales(
  banner?: BannerPublicitarioAdmin | null,
): BannerPublicitarioFormValues {
  const ahora = new Date();

  if (!banner) {
    return {
      nombreCliente: "",
      ubicacion: BANNER_UBICACIONES.HOME_TOP,

      titulo: "",
      subtitulo: "",
      descripcion: "",
      etiqueta: "Publicidad",

      tipoDestino: BANNER_TIPOS_DESTINO.URL,
      urlDestino: "",
      whatsappUrl: "",

      textoBoton: "Conocer más",
      mostrarBotonWhatsapp: false,
      textoBotonWhatsapp: "Escribir por WhatsApp",
      abrirNuevaPestana: true,

      fechaInicio: fechaLocalParaInput(ahora),
      fechaFin: fechaLocalParaInput(sumarDias(ahora, 30)),

      estado: BANNER_ESTADOS.BORRADOR,
      orden: 1,
      prioridad: 0,
      esExclusivo: false,

      eliminarImagenMobile: false,
    };
  }

  return {
    nombreCliente: banner.nombreCliente,
    ubicacion: banner.ubicacion,

    titulo: banner.titulo ?? "",
    subtitulo: banner.subtitulo ?? "",
    descripcion: banner.descripcion ?? "",
    etiqueta: banner.etiqueta ?? "Publicidad",

    tipoDestino: banner.tipoDestino ?? BANNER_TIPOS_DESTINO.URL,

    urlDestino: banner.urlDestino ?? "",
    whatsappUrl: banner.whatsappUrl ?? "",

    textoBoton: banner.textoBoton ?? "Conocer más",

    mostrarBotonWhatsapp: banner.mostrarBotonWhatsapp,

    textoBotonWhatsapp: banner.textoBotonWhatsapp ?? "Escribir por WhatsApp",

    abrirNuevaPestana: banner.abrirNuevaPestana,

    fechaInicio: normalizarFechaInput(banner.fechaInicio),

    fechaFin: normalizarFechaInput(banner.fechaFin),

    estado: banner.estado,
    orden: banner.orden,
    prioridad: banner.prioridad,
    esExclusivo: banner.esExclusivo,

    eliminarImagenMobile: false,
  };
}

function SelectorImagen({
  id,
  titulo,
  ayuda,
  archivo,
  imagenActual,
  disabled,
  onChange,
}: SelectorImagenProps) {
  const previewTemporal = useMemo(
    () => (archivo ? URL.createObjectURL(archivo) : ""),
    [archivo],
  );

  useEffect(() => {
    return () => {
      if (previewTemporal) {
        URL.revokeObjectURL(previewTemporal);
      }
    };
  }, [previewTemporal]);

  const preview = previewTemporal || imagenActual || "";

  const manejarCambio = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.files?.[0] ?? null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-gray-200">
          {titulo}
        </label>

        <p className="mt-1 text-xs leading-5 text-gray-400">{ayuda}</p>
      </div>

      <label
        htmlFor={id}
        className="grid min-h-[170px] cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-yellow-400/60 bg-black/30 transition hover:border-yellow-300 hover:bg-black/50"
      >
        {preview ? (
          <img
            src={preview}
            alt={`Vista previa de ${titulo}`}
            className="h-[170px] w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-gray-400">
            <ImagePlus size={30} />

            <strong className="text-sm text-yellow-400">
              Seleccionar imagen
            </strong>

            <span className="text-xs">JPG, PNG o WebP</span>
          </div>
        )}
      </label>

      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={manejarCambio}
      />

      {archivo && (
        <p className="text-xs text-gray-400">Archivo nuevo: {archivo.name}</p>
      )}
    </div>
  );
}

function esUrlValida(valor: string) {
  if (!valor.trim()) {
    return false;
  }

  if (valor.trim().startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(valor.trim());

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function obtenerErrores(
  valores: BannerPublicitarioFormValues,
  archivos: BannerPublicitarioArchivosForm,
  esEdicion: boolean,
) {
  const errores: string[] = [];

  if (!valores.nombreCliente.trim()) {
    errores.push("Ingresá el nombre del anunciante.");
  }

  if (!valores.titulo.trim()) {
    errores.push("Ingresá un título para identificar la campaña.");
  }

  if (!valores.fechaInicio) {
    errores.push("Indicá la fecha de inicio.");
  }

  if (!valores.fechaFin) {
    errores.push("Indicá la fecha de finalización.");
  }

  if (
    valores.fechaInicio &&
    valores.fechaFin &&
    new Date(valores.fechaFin).getTime() <=
      new Date(valores.fechaInicio).getTime()
  ) {
    errores.push("La fecha de finalización debe ser posterior al inicio.");
  }

  if (!esEdicion && !archivos.imagenDesktop) {
    errores.push("Seleccioná la imagen de escritorio.");
  }

  if (
    archivos.imagenDesktop &&
    !TIPOS_PERMITIDOS.includes(archivos.imagenDesktop.type)
  ) {
    errores.push("La imagen de escritorio debe ser JPG, PNG o WebP.");
  }

  if (
    archivos.imagenMobile &&
    !TIPOS_PERMITIDOS.includes(archivos.imagenMobile.type)
  ) {
    errores.push("La imagen móvil debe ser JPG, PNG o WebP.");
  }

  if (valores.tipoDestino === BANNER_TIPOS_DESTINO.WHATSAPP) {
    if (!valores.whatsappUrl.trim()) {
      errores.push("Ingresá el WhatsApp del anunciante.");
    }
  } else if (!esUrlValida(valores.urlDestino)) {
    errores.push("Ingresá una URL de destino válida.");
  }

  if (valores.mostrarBotonWhatsapp && !valores.whatsappUrl.trim()) {
    errores.push("Ingresá el WhatsApp para mostrar el botón secundario.");
  }

  return errores;
}

export default function BannerPublicitarioAdminModal({
  abierto,
  banner,
  configuracion,
  procesando = false,
  onClose,
  onGuardar,
}: Props) {
  const esEdicion = Boolean(banner?.id);

  const [valores, setValores] = useState<BannerPublicitarioFormValues>(() =>
    crearValoresIniciales(banner),
  );

  const [archivos, setArchivos] = useState<BannerPublicitarioArchivosForm>({});

  const [errores, setErrores] = useState<string[]>([]);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    setValores(crearValoresIniciales(banner));
    setArchivos({});
    setErrores([]);
  }, [abierto, banner]);

  const medidaActual = useMemo(
    () =>
      configuracion?.medidas.find(
        (medida) => medida.ubicacion === valores.ubicacion,
      ),
    [configuracion?.medidas, valores.ubicacion],
  );

  if (!abierto) {
    return null;
  }

  const actualizarValor = <K extends keyof BannerPublicitarioFormValues>(
    nombre: K,
    valor: BannerPublicitarioFormValues[K],
  ) => {
    setValores((actual) => ({
      ...actual,
      [nombre]: valor,
    }));
  };

  const manejarSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validaciones = obtenerErrores(valores, archivos, esEdicion);

    if (validaciones.length > 0) {
      setErrores(validaciones);
      return;
    }

    setErrores([]);

    await onGuardar(valores, archivos);
  };

  const ubicaciones = unirOpcionesUnicas<BannerUbicacion>(
    Object.values(BANNER_UBICACIONES),
    configuracion?.ubicaciones,
  );

  const tiposDestino = unirOpcionesUnicas<BannerTipoDestino>(
    Object.values(BANNER_TIPOS_DESTINO),
    configuracion?.tiposDestino,
  );

  const estados = unirOpcionesUnicas<BannerEstado>(
    Object.values(BANNER_ESTADOS),
    configuracion?.estadosEditables,
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">
      <section
        className="
          max-h-[96vh]
          w-full
          max-w-5xl
          overflow-y-auto
          rounded-2xl
          border
          border-yellow-400/30
          bg-[#202124]
          text-white
          shadow-2xl
          [scrollbar-width:thin]
          [scrollbar-color:#facc15_rgba(255,255,255,0.08)]
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-track]:bg-white/10
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-yellow-400
          [&::-webkit-scrollbar-thumb:hover]:bg-yellow-300
          [&::-webkit-scrollbar-button]:hidden
        "
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-[#202124] px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">
              Publicidad comercial
            </p>

            <h2 className="mt-1 text-xl font-bold">
              {esEdicion ? "Editar banner" : "Crear banner"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={procesando}
            className="rounded-full bg-white/10 p-2 text-gray-200 transition hover:bg-white/20"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={manejarSubmit} className="flex flex-col gap-5 p-5">
          {errores.length > 0 && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              <strong>Revisá estos puntos:</strong>

              <ul className="mt-2 list-disc space-y-1 pl-5">
                {errores.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <section>
            <h3 className="text-base font-bold text-yellow-400">
              Datos principales
            </h3>

            <p className="mt-1 text-sm text-gray-400">
              Información interna y textos visibles del anuncio.
            </p>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">
                Cliente anunciante
              </label>

              <input
                value={valores.nombreCliente}
                onChange={(event) =>
                  actualizarValor("nombreCliente", event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 outline-none focus:border-yellow-400"
                placeholder="Ej.: Ferretería San Miguel"
                disabled={procesando}
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Título de campaña</label>

              <input
                value={valores.titulo}
                onChange={(event) =>
                  actualizarValor("titulo", event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 outline-none focus:border-yellow-400"
                placeholder="Ej.: Promoción especial"
                disabled={procesando}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Subtítulo</label>

              <input
                value={valores.subtitulo}
                onChange={(event) =>
                  actualizarValor("subtitulo", event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 outline-none focus:border-yellow-400"
                placeholder="Texto breve visible"
                disabled={procesando}
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Etiqueta</label>

              <input
                value={valores.etiqueta}
                onChange={(event) =>
                  actualizarValor("etiqueta", event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 outline-none focus:border-yellow-400"
                placeholder="Publicidad"
                disabled={procesando}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">Descripción interna</label>

            <textarea
              value={valores.descripcion}
              onChange={(event) =>
                actualizarValor("descripcion", event.target.value)
              }
              rows={3}
              className="mt-2 w-full resize-y rounded-lg border border-white/15 bg-black/25 px-3 py-2 outline-none focus:border-yellow-400"
              placeholder="Información adicional de la campaña"
              disabled={procesando}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-semibold">Ubicación</label>

              <select
                value={valores.ubicacion}
                onChange={(event) =>
                  actualizarValor(
                    "ubicacion",
                    event.target.value as BannerUbicacion,
                  )
                }
                className="mt-2 w-full rounded-lg border border-white/15 bg-[#18191c] px-3 py-2 outline-none focus:border-yellow-400"
                disabled={procesando}
              >
                {ubicaciones.map((ubicacion) => (
                  <option
                    key={ubicacion}
                    value={ubicacion}
                    className="bg-[#18191c] text-white"
                  >
                    {ubicacion}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">Orden</label>

              <input
                type="number"
                min={1}
                value={valores.orden}
                onChange={(event) =>
                  actualizarValor("orden", Number(event.target.value))
                }
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 outline-none focus:border-yellow-400"
                disabled={procesando}
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Prioridad</label>

              <input
                type="number"
                min={0}
                value={valores.prioridad}
                onChange={(event) =>
                  actualizarValor("prioridad", Number(event.target.value))
                }
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 outline-none focus:border-yellow-400"
                disabled={procesando}
              />
            </div>
          </div>

          <div className="rounded-xl border border-yellow-400/25 bg-yellow-400/5 px-4 py-3 text-sm text-gray-200">
            <p>
              Escritorio:{" "}
              <strong>{medidaActual?.desktop || "Según configuración"}</strong>
            </p>

            <p className="mt-1">
              Celular:{" "}
              <strong>{medidaActual?.mobile || "Según configuración"}</strong>
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectorImagen
              id="banner-imagen-desktop"
              titulo="Imagen de escritorio"
              ayuda={
                esEdicion
                  ? "Podés dejarla sin cambios para conservar la imagen actual."
                  : "Obligatoria al crear el banner."
              }
              archivo={archivos.imagenDesktop}
              imagenActual={banner?.imagenDesktopUrl}
              disabled={procesando}
              onChange={(imagenDesktop) =>
                setArchivos((actual) => ({
                  ...actual,
                  imagenDesktop,
                }))
              }
            />

            <SelectorImagen
              id="banner-imagen-mobile"
              titulo="Imagen para celular"
              ayuda="Opcional. Si no cargás una pieza móvil, se utilizará la imagen de escritorio."
              archivo={archivos.imagenMobile}
              imagenActual={
                valores.eliminarImagenMobile ? null : banner?.imagenMobileUrl
              }
              disabled={procesando}
              onChange={(imagenMobile) => {
                setArchivos((actual) => ({
                  ...actual,
                  imagenMobile,
                }));

                if (imagenMobile) {
                  actualizarValor("eliminarImagenMobile", false);
                }
              }}
            />
          </div>

          {esEdicion && banner?.imagenMobileUrl && (
            <label className="flex items-center gap-2 text-sm text-gray-200">
              <input
                type="checkbox"
                checked={valores.eliminarImagenMobile}
                onChange={(event) =>
                  actualizarValor("eliminarImagenMobile", event.target.checked)
                }
                disabled={procesando || Boolean(archivos.imagenMobile)}
                className="accent-yellow-400"
              />
              Eliminar la imagen móvil actual
            </label>
          )}

          <section className="border-t border-white/10 pt-5">
            <h3 className="text-base font-bold text-yellow-400">
              Destino del anuncio
            </h3>

            <p className="mt-1 text-sm text-gray-400">
              Configurá la acción principal y WhatsApp cuando corresponda.
            </p>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Tipo de destino</label>

              <select
                value={valores.tipoDestino}
                onChange={(event) =>
                  actualizarValor(
                    "tipoDestino",
                    event.target.value as BannerTipoDestino,
                  )
                }
                className="mt-2 w-full rounded-lg border border-white/15 bg-[#18191c] px-3 py-2 outline-none focus:border-yellow-400"
                disabled={procesando}
              >
                {tiposDestino.map((tipo) => (
                  <option
                    key={tipo}
                    value={tipo}
                    className="bg-[#18191c] text-white"
                  >
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">
                Texto del botón principal
              </label>

              <input
                value={valores.textoBoton}
                onChange={(event) =>
                  actualizarValor("textoBoton", event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 outline-none focus:border-yellow-400"
                placeholder={
                  valores.tipoDestino === BANNER_TIPOS_DESTINO.WHATSAPP
                    ? "Escribir por WhatsApp"
                    : "Conocer más"
                }
                disabled={procesando}
              />
            </div>
          </div>

          {valores.tipoDestino !== BANNER_TIPOS_DESTINO.WHATSAPP && (
            <div>
              <label className="text-sm font-semibold">URL principal</label>

              <input
                value={valores.urlDestino}
                onChange={(event) =>
                  actualizarValor("urlDestino", event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 outline-none focus:border-yellow-400"
                placeholder={
                  valores.tipoDestino === BANNER_TIPOS_DESTINO.PERFIL_PUBLICO
                    ? "https://www.tuvendedor.com.py/vendedor/mi-negocio"
                    : "https://www.cliente.com.py"
                }
                disabled={procesando}
              />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">
                WhatsApp del anunciante
              </label>

              <input
                value={valores.whatsappUrl}
                onChange={(event) =>
                  actualizarValor("whatsappUrl", event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 outline-none focus:border-yellow-400"
                placeholder="595981123456 o https://wa.me/595981123456"
                disabled={procesando}
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Texto del botón WhatsApp
              </label>

              <input
                value={valores.textoBotonWhatsapp}
                onChange={(event) =>
                  actualizarValor("textoBotonWhatsapp", event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 outline-none focus:border-yellow-400"
                placeholder="Escribir por WhatsApp"
                disabled={procesando}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-200">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={valores.mostrarBotonWhatsapp}
                onChange={(event) =>
                  actualizarValor("mostrarBotonWhatsapp", event.target.checked)
                }
                disabled={
                  procesando ||
                  valores.tipoDestino === BANNER_TIPOS_DESTINO.WHATSAPP
                }
                className="accent-yellow-400"
              />
              Mostrar botón secundario de WhatsApp
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={valores.abrirNuevaPestana}
                onChange={(event) =>
                  actualizarValor("abrirNuevaPestana", event.target.checked)
                }
                disabled={procesando}
                className="accent-yellow-400"
              />
              Abrir destino en una pestaña nueva
            </label>
          </div>

          <section className="border-t border-white/10 pt-5">
            <h3 className="text-base font-bold text-yellow-400">
              Vigencia y publicación
            </h3>
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-semibold">Inicio</label>

              <input
                type="datetime-local"
                value={valores.fechaInicio}
                onChange={(event) =>
                  actualizarValor("fechaInicio", event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 outline-none focus:border-yellow-400"
                disabled={procesando}
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Finalización</label>

              <input
                type="datetime-local"
                value={valores.fechaFin}
                onChange={(event) =>
                  actualizarValor("fechaFin", event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/25 px-3 py-2 outline-none focus:border-yellow-400"
                disabled={procesando}
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Estado</label>

              <select
                value={valores.estado}
                onChange={(event) =>
                  actualizarValor("estado", event.target.value as BannerEstado)
                }
                className="mt-2 w-full rounded-lg border border-white/15 bg-[#18191c] px-3 py-2 outline-none focus:border-yellow-400"
                disabled={procesando}
              >
                {estados.map((estado) => (
                  <option
                    key={estado}
                    value={estado}
                    className="bg-[#18191c] text-white"
                  >
                    {estado}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-200">
            <input
              type="checkbox"
              checked={valores.esExclusivo}
              onChange={(event) =>
                actualizarValor("esExclusivo", event.target.checked)
              }
              disabled={procesando}
              className="accent-yellow-400"
            />
            Banner exclusivo para su ubicación durante la vigencia
          </label>

          <footer className="sticky bottom-0 -mx-5 -mb-5 mt-2 flex justify-end gap-3 border-t border-white/10 bg-[#202124] px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={procesando}
              className="rounded-lg border border-white/15 px-4 py-2 font-semibold text-gray-200 transition hover:bg-white/10"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={procesando}
              className="rounded-lg bg-yellow-400 px-4 py-2 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-wait disabled:opacity-60"
            >
              {procesando
                ? "Guardando..."
                : esEdicion
                  ? "Guardar cambios"
                  : "Crear banner"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

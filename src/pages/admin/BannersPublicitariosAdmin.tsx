import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Eye,
  ImagePlus,
  MessageCircle,
  MousePointerClick,
  PauseCircle,
  Pencil,
  PlayCircle,
  RefreshCcw,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import Swal from "sweetalert2";

import {
  actualizarBannerPublicitarioAdmin,
  cambiarEstadoBannerPublicitarioAdmin,
  crearBannerPublicitarioAdmin,
  eliminarBannerPublicitarioAdmin,
  obtenerBannerPublicitarioAdmin,
  obtenerBannersPublicitariosAdmin,
  obtenerConfiguracionBannersPublicitariosAdmin,
  obtenerResumenBannersPublicitariosAdmin,
} from "../../api/bannersPublicitariosService";

import BannerPublicitarioAdminModal from "../../components/banners/BannerPublicitarioAdminModal";

import { useUsuario } from "../../context/UsuarioContext";

import {
  BANNER_ESTADOS,
  type BannerPublicitarioAdmin,
  type BannerPublicitarioArchivosForm,
  type BannerPublicitarioFormValues,
  type ConfiguracionBannersPublicitarios,
  type ResumenBannersPublicitarios,
} from "../../types/bannerPublicitario";

const RESUMEN_INICIAL: ResumenBannersPublicitarios = {
  totalBanners: 0,
  bannersActivos: 0,
  bannersPausados: 0,
  bannersBorrador: 0,

  cantidadImpresiones: 0,
  cantidadClicks: 0,
  cantidadWhatsapp: 0,

  ctr: 0,
};

function formatearNumero(valor?: number | null) {
  return Number(valor ?? 0).toLocaleString(
    "es-PY",
  );
}

function formatearFecha(
  valor?: string | null,
) {
  if (!valor) {
    return "Sin límite";
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return valor;
  }

  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

function obtenerClaseEstado(
  estado: string,
) {
  if (estado === BANNER_ESTADOS.ACTIVO) {
    return "border-green-400/30 bg-green-400/10 text-green-300";
  }

  if (estado === BANNER_ESTADOS.PAUSADO) {
    return "border-orange-400/30 bg-orange-400/10 text-orange-300";
  }

  return "border-gray-400/30 bg-gray-400/10 text-gray-300";
}

interface TarjetaResumenProps {
  titulo: string;
  valor: string;
  ayuda: string;
  icono: React.ReactNode;
}

function TarjetaResumen({
  titulo,
  valor,
  ayuda,
  icono,
}: TarjetaResumenProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-400">
          {titulo}
        </p>

        <span className="text-yellow-400">
          {icono}
        </span>
      </div>

      <strong className="mt-4 block text-3xl font-black tracking-tight text-white">
        {valor}
      </strong>

      <span className="mt-2 block text-xs text-gray-500">
        {ayuda}
      </span>
    </article>
  );
}

export default function BannersPublicitariosAdmin() {
  const navigate = useNavigate();

  const { esAdmin } = useUsuario();

  const [banners, setBanners] = useState<
    BannerPublicitarioAdmin[]
  >([]);

  const [resumen, setResumen] =
    useState<ResumenBannersPublicitarios>(
      RESUMEN_INICIAL,
    );

  const [configuracion, setConfiguracion] =
    useState<ConfiguracionBannersPublicitarios | null>(
      null,
    );

  const [cargando, setCargando] =
    useState(true);

  const [procesando, setProcesando] =
    useState(false);

  const [idProcesando, setIdProcesando] =
    useState<string | number | null>(null);

  const [busqueda, setBusqueda] =
    useState("");

  const [modalAbierto, setModalAbierto] =
    useState(false);

  const [bannerSeleccionado, setBannerSeleccionado] =
    useState<BannerPublicitarioAdmin | null>(
      null,
    );

  const cargarDatos = useCallback(async () => {
    setCargando(true);

    try {
      const [
        resultadoBanners,
        resultadoResumen,
        resultadoConfiguracion,
      ] = await Promise.all([
        obtenerBannersPublicitariosAdmin({
          pagina: 1,
          tamanioPagina: 100,
        }),

        obtenerResumenBannersPublicitariosAdmin(),

        obtenerConfiguracionBannersPublicitariosAdmin(),
      ]);

      setBanners(resultadoBanners.items);
      setResumen(resultadoResumen);
      setConfiguracion(resultadoConfiguracion);
    } catch (error: any) {
      await Swal.fire({
        title: "No pudimos cargar los banners",
        text:
          error?.message ??
          "Ocurrió un inconveniente inesperado.",
        icon: "error",
      });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (esAdmin) {
      void cargarDatos();
    }
  }, [cargarDatos, esAdmin]);

  const bannersFiltrados = useMemo(() => {
    const texto = busqueda
      .trim()
      .toLowerCase();

    if (!texto) {
      return banners;
    }

    return banners.filter((banner) => {
      return [
        banner.nombreCliente,
        banner.titulo,
        banner.subtitulo,
        banner.ubicacion,
        banner.estado,
      ]
        .filter(Boolean)
        .some((valor) =>
          String(valor)
            .toLowerCase()
            .includes(texto),
        );
    });
  }, [banners, busqueda]);

  const abrirCreacion = () => {
    setBannerSeleccionado(null);
    setModalAbierto(true);
  };

  const abrirEdicion = async (
    banner: BannerPublicitarioAdmin,
  ) => {
    setIdProcesando(banner.id);

    try {
      const detalle =
        await obtenerBannerPublicitarioAdmin(
          banner.id,
        );

      setBannerSeleccionado(detalle);
      setModalAbierto(true);
    } catch (error: any) {
      await Swal.fire({
        title: "No pudimos abrir el banner",
        text:
          error?.message ??
          "Ocurrió un inconveniente inesperado.",
        icon: "error",
      });
    } finally {
      setIdProcesando(null);
    }
  };

  const cerrarModal = () => {
    if (procesando) {
      return;
    }

    setModalAbierto(false);
    setBannerSeleccionado(null);
  };

  const guardarBanner = async (
    valores: BannerPublicitarioFormValues,
    archivos: BannerPublicitarioArchivosForm,
  ) => {
    setProcesando(true);

    try {
      if (bannerSeleccionado) {
        await actualizarBannerPublicitarioAdmin(
          bannerSeleccionado.id,
          valores,
          archivos,
        );
      } else {
        await crearBannerPublicitarioAdmin(
          valores,
          archivos,
        );
      }

      await Swal.fire({
        title: bannerSeleccionado
          ? "Banner actualizado"
          : "Banner creado",
        text: "La campaña fue guardada correctamente.",
        icon: "success",
        confirmButtonColor: "#facc15",
      });

      setModalAbierto(false);
      setBannerSeleccionado(null);

      await cargarDatos();
    } catch (error: any) {
      await Swal.fire({
        title: "No pudimos guardar el banner",
        text:
          error?.message ??
          "Ocurrió un inconveniente inesperado.",
        icon: "error",
      });
    } finally {
      setProcesando(false);
    }
  };

  const cambiarEstado = async (
    banner: BannerPublicitarioAdmin,
  ) => {
    const nuevoEstado =
      banner.estado === BANNER_ESTADOS.ACTIVO
        ? BANNER_ESTADOS.PAUSADO
        : BANNER_ESTADOS.ACTIVO;

    const confirmacion = await Swal.fire({
      title:
        nuevoEstado === BANNER_ESTADOS.ACTIVO
          ? "¿Activar campaña?"
          : "¿Pausar campaña?",

      text: banner.titulo ?? banner.nombreCliente,

      icon: "question",

      showCancelButton: true,

      confirmButtonText:
        nuevoEstado === BANNER_ESTADOS.ACTIVO
          ? "Sí, activar"
          : "Sí, pausar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#facc15",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    setIdProcesando(banner.id);

    try {
      await cambiarEstadoBannerPublicitarioAdmin(
        banner.id,
        nuevoEstado,
      );

      await cargarDatos();
    } catch (error: any) {
      await Swal.fire({
        title: "No pudimos cambiar el estado",
        text:
          error?.message ??
          "Ocurrió un inconveniente inesperado.",
        icon: "error",
      });
    } finally {
      setIdProcesando(null);
    }
  };

  const eliminar = async (
    banner: BannerPublicitarioAdmin,
  ) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar campaña?",

      text: `Se eliminará el banner: ${
        banner.titulo ?? banner.nombreCliente
      }`,

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",

      confirmButtonColor: "#dc2626",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    setIdProcesando(banner.id);

    try {
      await eliminarBannerPublicitarioAdmin(
        banner.id,
      );

      await Swal.fire({
        title: "Banner eliminado",
        text: "La campaña fue eliminada correctamente.",
        icon: "success",
        confirmButtonColor: "#facc15",
      });

      await cargarDatos();
    } catch (error: any) {
      await Swal.fire({
        title: "No pudimos eliminar el banner",
        text:
          error?.message ??
          "Ocurrió un inconveniente inesperado.",
        icon: "error",
      });
    } finally {
      setIdProcesando(null);
    }
  };

  if (!esAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#1e1f23] px-4 text-white">
        <section className="max-w-lg rounded-2xl border border-red-400/20 bg-white/5 p-8 text-center">
          <ShieldAlert
            className="mx-auto text-red-300"
            size={42}
          />

          <h1 className="mt-4 text-2xl font-black">
            Acceso restringido
          </h1>

          <p className="mt-2 text-gray-400">
            Esta pantalla está disponible únicamente para administradores.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-5 rounded-lg bg-yellow-400 px-4 py-2 font-bold text-black"
          >
            Volver al marketplace
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1e1f23] px-4 py-6 text-white md:px-8">
      <section className="mx-auto max-w-[1500px]">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-yellow-400 hover:text-yellow-300"
            >
              <ArrowLeft size={17} />
              Volver al marketplace
            </button>

            <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-400">
              Tu Vendedor · Publicidad
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Administrador de banners
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
              Gestioná campañas, vigencias, imágenes, enlaces y métricas comerciales.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirCreacion}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 font-black text-black transition hover:bg-yellow-300"
          >
            <ImagePlus size={19} />
            Crear banner
          </button>
        </header>

        <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <TarjetaResumen
            titulo="Campañas"
            valor={formatearNumero(
              resumen.totalBanners,
            )}
            ayuda={`${formatearNumero(
              resumen.bannersActivos,
            )} activas`}
            icono={<Eye size={21} />}
          />

          <TarjetaResumen
            titulo="Impresiones"
            valor={formatearNumero(
              resumen.cantidadImpresiones,
            )}
            ayuda="Visualizaciones registradas"
            icono={<Eye size={21} />}
          />

          <TarjetaResumen
            titulo="Clics"
            valor={formatearNumero(
              resumen.cantidadClicks,
            )}
            ayuda={`CTR: ${resumen.ctr.toFixed(2)}%`}
            icono={<MousePointerClick size={21} />}
          />

          <TarjetaResumen
            titulo="WhatsApp"
            valor={formatearNumero(
              resumen.cantidadWhatsapp,
            )}
            ayuda="Contactos iniciados"
            icono={<MessageCircle size={21} />}
          />
        </section>

        <section className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl">
          <header className="flex flex-col justify-between gap-4 border-b border-white/10 p-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-black">
                Campañas cargadas
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                {bannersFiltrados.length} campañas visibles
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex min-w-[260px] items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-3">
                <Search
                  size={17}
                  className="text-gray-500"
                />

                <input
                  value={busqueda}
                  onChange={(event) =>
                    setBusqueda(event.target.value)
                  }
                  className="w-full bg-transparent py-2 text-sm outline-none"
                  placeholder="Buscar campaña o cliente"
                />
              </label>

              <button
                type="button"
                onClick={() => void cargarDatos()}
                disabled={cargando}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-yellow-400/40 px-3 py-2 text-sm font-bold text-yellow-400 transition hover:bg-yellow-400 hover:text-black disabled:opacity-60"
              >
                <RefreshCcw
                  size={17}
                  className={
                    cargando
                      ? "animate-spin"
                      : ""
                  }
                />

                Actualizar
              </button>
            </div>
          </header>

          {cargando ? (
            <div className="grid min-h-[260px] place-items-center text-yellow-400">
              Cargando banners...
            </div>
          ) : bannersFiltrados.length === 0 ? (
            <div className="grid min-h-[260px] place-items-center px-4 text-center text-gray-400">
              Todavía no hay campañas cargadas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1180px] w-full">
                <thead className="bg-black/20 text-left text-xs uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-4 py-3">
                      Campaña
                    </th>

                    <th className="px-4 py-3">
                      Ubicación
                    </th>

                    <th className="px-4 py-3">
                      Vigencia
                    </th>

                    <th className="px-4 py-3">
                      Métricas
                    </th>

                    <th className="px-4 py-3">
                      Estado
                    </th>

                    <th className="px-4 py-3 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {bannersFiltrados.map((banner) => {
                    const estaProcesando =
                      idProcesando === banner.id;

                    return (
                      <tr
                        key={String(banner.id)}
                        className="border-t border-white/10 text-sm"
                      >
                        <td className="px-4 py-4">
                          <div className="flex min-w-[250px] items-center gap-3">
                            <img
                              src={
                                banner.imagenDesktopUrl
                              }
                              alt={
                                banner.titulo ??
                                "Banner"
                              }
                              className="h-14 w-24 rounded-lg object-cover"
                            />

                            <div>
                              <strong className="block text-white">
                                {banner.titulo ||
                                  "Sin título"}
                              </strong>

                              <span className="mt-1 block text-xs text-gray-400">
                                {banner.nombreCliente}
                              </span>

                              <span className="mt-1 block text-xs text-gray-500">
                                Orden: {banner.orden} · Prioridad:{" "}
                                {banner.prioridad}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-gray-300">
                          {banner.ubicacion}
                        </td>

                        <td className="px-4 py-4 text-xs leading-5 text-gray-400">
                          <span className="block">
                            Desde:{" "}
                            {formatearFecha(
                              banner.fechaInicio,
                            )}
                          </span>

                          <span className="block">
                            Hasta:{" "}
                            {formatearFecha(
                              banner.fechaFin,
                            )}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-xs leading-5 text-gray-400">
                          <span className="block">
                            {formatearNumero(
                              banner.cantidadImpresiones,
                            )}{" "}
                            impresiones
                          </span>

                          <span className="block">
                            {formatearNumero(
                              banner.cantidadClicks,
                            )}{" "}
                            clics
                          </span>

                          <span className="block">
                            {formatearNumero(
                              banner.cantidadWhatsapp,
                            )}{" "}
                            WhatsApp
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-xs font-black ${obtenerClaseEstado(
                              banner.estado,
                            )}`}
                          >
                            {banner.estado}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                void abrirEdicion(
                                  banner,
                                )
                              }
                              disabled={
                                estaProcesando
                              }
                              className="rounded-lg border border-white/15 p-2 text-gray-200 transition hover:bg-white/10 disabled:opacity-50"
                              title="Editar"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void cambiarEstado(
                                  banner,
                                )
                              }
                              disabled={
                                estaProcesando
                              }
                              className="rounded-lg border border-yellow-400/30 p-2 text-yellow-400 transition hover:bg-yellow-400 hover:text-black disabled:opacity-50"
                              title={
                                banner.estado ===
                                BANNER_ESTADOS.ACTIVO
                                  ? "Pausar"
                                  : "Activar"
                              }
                            >
                              {banner.estado ===
                              BANNER_ESTADOS.ACTIVO ? (
                                <PauseCircle
                                  size={17}
                                />
                              ) : (
                                <PlayCircle
                                  size={17}
                                />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void eliminar(banner)
                              }
                              disabled={
                                estaProcesando
                              }
                              className="rounded-lg border border-red-400/30 p-2 text-red-300 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                              title="Eliminar"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      <BannerPublicitarioAdminModal
        abierto={modalAbierto}
        banner={bannerSeleccionado}
        configuracion={configuracion}
        procesando={procesando}
        onClose={cerrarModal}
        onGuardar={guardarBanner}
      />
    </main>
  );
}
// src/pages/clientes/ListarInteresados.tsx

import React, { useCallback, useEffect, useMemo, useState } from "react";

import Swal from "sweetalert2";

import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { obtenerInteresados } from "../../api/clientesService";
import { FiltroInteresadosRequest, Interesado } from "../../types/clientes";

import {
  esFechaServidorDeHoyEnParaguay,
  formatearFechaHoraServidorParaguay,
} from "../../utils/fechaServidor";

interface Props {
  seleccionado: Interesado | null;
  setSeleccionado: (i: Interesado | null) => void;
  recargarLista: boolean;
  setRecargarLista: (v: boolean) => void;
}

const filtrosIniciales: FiltroInteresadosRequest = {
  nombre: "",
  estado: "Activo",
  origen: "",
  estadoConsulta: "",
  soloSeguimiento: false,
  soloSinRespuesta: false,
  soloSeguimientoVencido: false,
  fechaRegistroDesde: "",
  fechaRegistroHasta: "",
  fechaProximoContactoDesde: "",
  fechaProximoContactoHasta: "",
  numeroPagina: 1,
  registrosPorPagina: 20,
};

const fechaCorta = (fecha?: string | null) => {
  if (!fecha) {
    return "—";
  }

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "—";
  }

  return valor.toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const fechaHora = (fecha?: string | null) =>
  formatearFechaHoraServidorParaguay(fecha, false);

const esConsultaDeHoy = (interesado: Interesado) => {
  const fecha =
    interesado.fechaUltimoMensajeCliente || interesado.fechaUltimaInteraccion;

  return esFechaServidorDeHoyEnParaguay(fecha);
};

const estadoLabel = (estado?: string | null) => {
  switch (estado) {
    case "CONSULTANDO":
      return "Consultando";
    case "ESPERANDO_MODELO":
      return "Esperando modelo";
    case "CONSULTA_PROMO":
      return "Consultó promo";
    case "COTIZADO":
      return "Cotizado";
    case "PENDIENTE_ASESOR":
      return "Pendiente asesor";
    case "CREDITO_EN_PROCESO":
      return "Crédito en proceso";
    case "CONTADO_EN_PROCESO":
      return "Contado en proceso";
    case "DERIVADO_HUMANO":
      return "Atención humana";
    case "CERRADO":
      return "Cerrado";
    case "SIN_RESPUESTA":
      return "Sin respuesta";
    case "REGISTRADO":
      return "Registrado";
    default:
      return estado?.replaceAll("_", " ") || "Sin etapa";
  }
};

const estadoClass = (interesado: Interesado) => {
  if (interesado.sinRespuesta) {
    return "border-red-400/40 bg-red-400/10 text-red-300";
  }

  switch (interesado.estadoGestion || interesado.estadoConsulta) {
    case "CREDITO_EN_PROCESO":
      return "border-yellow-400/40 bg-yellow-400/10 text-yellow-300";
    case "CONTADO_EN_PROCESO":
      return "border-orange-400/40 bg-orange-400/10 text-orange-300";
    case "COTIZADO":
      return "border-sky-400/40 bg-sky-400/10 text-sky-300";
    case "DERIVADO_HUMANO":
      return "border-violet-400/40 bg-violet-400/10 text-violet-300";
    case "CERRADO":
      return "border-gray-500/40 bg-gray-500/10 text-gray-400";
    default:
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  }
};

const ListarInteresados: React.FC<Props> = ({
  seleccionado,
  setSeleccionado,
  recargarLista,
  setRecargarLista,
}) => {
  const [interesados, setInteresados] = useState<Interesado[]>([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [borrador, setBorrador] =
    useState<FiltroInteresadosRequest>(filtrosIniciales);

  const [aplicados, setAplicados] =
    useState<FiltroInteresadosRequest>(filtrosIniciales);

  const cargarInteresados = useCallback(async () => {
    setCargando(true);

    try {
      const data = await obtenerInteresados({
        ...aplicados,

        nombre: aplicados.nombre?.trim() || undefined,

        estado: aplicados.estado || undefined,

        origen: aplicados.origen || undefined,

        estadoConsulta: aplicados.estadoConsulta || undefined,

        fechaRegistroDesde: aplicados.fechaRegistroDesde || undefined,

        fechaRegistroHasta: aplicados.fechaRegistroHasta || undefined,

        fechaProximoContactoDesde:
          aplicados.fechaProximoContactoDesde || undefined,

        fechaProximoContactoHasta:
          aplicados.fechaProximoContactoHasta || undefined,
      });

      setInteresados(data.items || []);
      setTotalRegistros(data.totalRegistros || 0);

      if (seleccionado && !data.items.some((x) => x.id === seleccionado.id)) {
        setSeleccionado(null);
      }
    } catch {
      Swal.fire("Error", "No se pudieron obtener los interesados.", "error");
    } finally {
      setCargando(false);
      setRecargarLista(false);
    }
  }, [aplicados, seleccionado, setRecargarLista, setSeleccionado]);

  useEffect(() => {
    void cargarInteresados();
  }, [cargarInteresados, recargarLista]);

  const totalPaginas = useMemo(
    () =>
      Math.max(
        1,
        Math.ceil(totalRegistros / Math.max(1, aplicados.registrosPorPagina)),
      ),
    [aplicados.registrosPorPagina, totalRegistros],
  );

  const aplicarFiltros = () => {
    setAplicados({
      ...borrador,
      numeroPagina: 1,
    });
  };

  const limpiarFiltros = () => {
    setBorrador(filtrosIniciales);
    setAplicados(filtrosIniciales);
  };

  const aplicarEstadoRapido = (
    estadoConsulta: string,
    soloSinRespuesta = false,
  ) => {
    const siguiente = {
      ...borrador,
      estadoConsulta,
      soloSinRespuesta,
      numeroPagina: 1,
    };

    setBorrador(siguiente);
    setAplicados(siguiente);
  };

  const cambiarPagina = (pagina: number) => {
    const segura = Math.min(totalPaginas, Math.max(1, pagina));

    setBorrador((actual) => ({
      ...actual,
      numeroPagina: segura,
    }));

    setAplicados((actual) => ({
      ...actual,
      numeroPagina: segura,
    }));
  };

  return (
    <aside className="w-full xl:w-[42%] 2xl:w-[38%] border-b xl:border-b-0 xl:border-r border-yellow-400/40 bg-gray-950/50">
      <div className="p-4 border-b border-gray-800 sticky top-0 z-10 bg-gray-950/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-bold text-yellow-400">
              Interesados y seguimiento
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {totalRegistros} cliente
              {totalRegistros === 1 ? "" : "s"} encontrado
              {totalRegistros === 1 ? "" : "s"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMostrarFiltros((valor) => !valor)}
            className="h-9 w-9 rounded-lg border border-gray-700 bg-gray-900 grid place-items-center text-gray-300 hover:border-yellow-400 hover:text-yellow-300 transition"
            title="Filtros"
          >
            <SlidersHorizontal size={17} />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            aplicarFiltros();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              value={borrador.nombre || ""}
              onChange={(event) =>
                setBorrador((actual) => ({
                  ...actual,
                  nombre: event.target.value,
                }))
              }
              placeholder="Nombre, teléfono, marca o modelo..."
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-900 border border-gray-700 text-sm focus:outline-none focus:border-yellow-400"
            />
          </div>

          <button
            type="submit"
            className="h-10 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm"
          >
            Buscar
          </button>
        </form>

        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => aplicarEstadoRapido("")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-xs font-semibold ${
              !aplicados.estadoConsulta && !aplicados.soloSinRespuesta
                ? "bg-yellow-400 border-yellow-400 text-black"
                : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}
          >
            Todos
          </button>

          <button
            type="button"
            onClick={() => aplicarEstadoRapido("SIN_RESPUESTA", true)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-xs font-semibold ${
              aplicados.soloSinRespuesta
                ? "bg-red-400 border-red-400 text-black"
                : "border-gray-700 text-gray-400 hover:border-red-400/60"
            }`}
          >
            Sin respuesta
          </button>

          <button
            type="button"
            onClick={() => aplicarEstadoRapido("COTIZADO")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-xs font-semibold ${
              aplicados.estadoConsulta === "COTIZADO"
                ? "bg-sky-400 border-sky-400 text-black"
                : "border-gray-700 text-gray-400 hover:border-sky-400/60"
            }`}
          >
            Cotizados
          </button>

          <button
            type="button"
            onClick={() => aplicarEstadoRapido("CREDITO_EN_PROCESO")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-xs font-semibold ${
              aplicados.estadoConsulta === "CREDITO_EN_PROCESO"
                ? "bg-yellow-400 border-yellow-400 text-black"
                : "border-gray-700 text-gray-400 hover:border-yellow-400/60"
            }`}
          >
            Crédito
          </button>

          <button
            type="button"
            onClick={() => aplicarEstadoRapido("CONTADO_EN_PROCESO")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-xs font-semibold ${
              aplicados.estadoConsulta === "CONTADO_EN_PROCESO"
                ? "bg-orange-400 border-orange-400 text-black"
                : "border-gray-700 text-gray-400 hover:border-orange-400/60"
            }`}
          >
            Contado
          </button>
        </div>

        {mostrarFiltros && (
          <div className="mt-3 p-3 rounded-xl border border-gray-800 bg-gray-900/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="space-y-1">
              <span className="text-gray-400">Origen</span>
              <select
                value={borrador.origen || ""}
                onChange={(event) =>
                  setBorrador((actual) => ({
                    ...actual,
                    origen: event.target.value,
                  }))
                }
                className="w-full h-9 rounded bg-gray-950 border border-gray-700 px-2"
              >
                <option value="">Todos</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="MANUAL">Manual</option>
                <option value="MANUAL+WHATSAPP">Manual + WhatsApp</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-gray-400">Estado del registro</span>
              <select
                value={borrador.estado || ""}
                onChange={(event) =>
                  setBorrador((actual) => ({
                    ...actual,
                    estado: event.target.value,
                  }))
                }
                className="w-full h-9 rounded bg-gray-950 border border-gray-700 px-2"
              >
                <option value="">Todos</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-gray-400">Registrado desde</span>
              <input
                type="date"
                value={borrador.fechaRegistroDesde || ""}
                onChange={(event) =>
                  setBorrador((actual) => ({
                    ...actual,
                    fechaRegistroDesde: event.target.value,
                  }))
                }
                className="w-full h-9 rounded bg-gray-950 border border-gray-700 px-2"
              />
            </label>

            <label className="space-y-1">
              <span className="text-gray-400">Registrado hasta</span>
              <input
                type="date"
                value={borrador.fechaRegistroHasta || ""}
                onChange={(event) =>
                  setBorrador((actual) => ({
                    ...actual,
                    fechaRegistroHasta: event.target.value,
                  }))
                }
                className="w-full h-9 rounded bg-gray-950 border border-gray-700 px-2"
              />
            </label>

            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={Boolean(borrador.soloSeguimiento)}
                onChange={(event) =>
                  setBorrador((actual) => ({
                    ...actual,
                    soloSeguimiento: event.target.checked,
                  }))
                }
                className="accent-yellow-400"
              />
              <span className="text-gray-300">
                Solo los que requieren seguimiento
              </span>
            </label>

            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={Boolean(borrador.soloSeguimientoVencido)}
                onChange={(event) =>
                  setBorrador((actual) => ({
                    ...actual,
                    soloSeguimientoVencido: event.target.checked,
                  }))
                }
                className="accent-red-400"
              />
              <span className="text-gray-300">Solo seguimientos vencidos</span>
            </label>

            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={limpiarFiltros}
                className="px-3 py-2 rounded-lg border border-gray-700 text-gray-300"
              >
                Limpiar
              </button>

              <button
                type="button"
                onClick={aplicarFiltros}
                className="px-3 py-2 rounded-lg bg-yellow-400 text-black font-bold"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
        {cargando ? (
          <div className="py-12 text-center text-gray-500">
            Cargando interesados...
          </div>
        ) : interesados.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No encontramos interesados con estos filtros.
          </div>
        ) : (
          interesados.map((interesado) => {
            const seleccionadoAhora = seleccionado?.id === interesado.id;

            const consultaHoy = esConsultaDeHoy(interesado);

            const fechaActividad =
              interesado.fechaUltimoMensajeCliente ||
              interesado.fechaUltimaInteraccion ||
              interesado.fechaRegistro;

            return (
              <button
                type="button"
                key={interesado.id}
                onClick={() => setSeleccionado(interesado)}
                className={`relative w-full overflow-hidden text-left rounded-xl border px-3 py-2.5 transition-all ${
                  consultaHoy
                    ? seleccionadoAhora
                      ? "border-emerald-300 bg-emerald-950/55 shadow-[0_0_0_1px_rgba(110,231,183,0.14)]"
                      : "border-emerald-500/45 bg-gradient-to-r from-emerald-950/45 via-gray-900/90 to-gray-900/80 hover:border-emerald-400/70"
                    : seleccionadoAhora
                      ? "border-yellow-400 bg-yellow-400/5"
                      : "border-gray-800 bg-gray-900/70 hover:border-gray-600"
                }`}
              >
                {consultaHoy && (
                  <span className="absolute inset-y-0 left-0 w-1 bg-emerald-400/80" />
                )}

                <div className="flex items-start justify-between gap-2 pl-0.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="font-bold text-sm text-white truncate">
                        {interesado.nombre || "Cliente WhatsApp"}
                      </div>

                      {consultaHoy && (
                        <span className="shrink-0 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-emerald-300">
                          HOY
                        </span>
                      )}
                    </div>

                    <div
                      className={`text-[11px] mt-0.5 ${
                        consultaHoy ? "text-emerald-200/70" : "text-gray-500"
                      }`}
                    >
                      {interesado.telefono || "Número pendiente de resolver"}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 px-2 py-1 rounded-full border text-[9px] font-bold uppercase ${estadoClass(
                      interesado,
                    )}`}
                  >
                    {interesado.sinRespuesta
                      ? "Sin respuesta"
                      : estadoLabel(
                          interesado.estadoGestion || interesado.estadoConsulta,
                        )}
                  </span>
                </div>

                <div className="mt-2 flex items-end justify-between gap-3 pl-0.5">
                  <div className="min-w-0">
                    <div className="font-semibold text-[12px] text-yellow-300 truncate">
                      {interesado.marcaInteres || interesado.modeloInteres
                        ? `${interesado.marcaInteres || ""} ${
                            interesado.modeloInteres || ""
                          }`.trim()
                        : interesado.productoInteres ||
                          "Consulta sin modelo definido"}
                    </div>

                    {interesado.codigoReferencia && (
                      <div className="text-[10px] text-gray-600 mt-0.5 truncate">
                        Ref. {interesado.codigoReferencia}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <div
                      className={`inline-flex items-center gap-1 text-[10px] ${
                        consultaHoy
                          ? "font-semibold text-emerald-300"
                          : "text-gray-500"
                      }`}
                    >
                      <Clock3 size={11} />
                      {fechaHora(fechaActividad)}
                    </div>
                  </div>
                </div>

                {interesado.requiereSeguimiento && (
                  <div className="mt-1.5 pl-0.5">
                    <span
                      className={`text-[10px] font-semibold ${
                        interesado.seguimientoVencido
                          ? "text-red-300"
                          : "text-yellow-300"
                      }`}
                    >
                      Seguimiento{" "}
                      {interesado.seguimientoVencido
                        ? "vencido"
                        : fechaCorta(interesado.fechaProximoContacto)}
                    </span>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <span>Mostrar</span>

          <select
            value={aplicados.registrosPorPagina}
            onChange={(event) => {
              const cantidad = Number(event.target.value);

              setBorrador((actual) => ({
                ...actual,
                registrosPorPagina: cantidad,
                numeroPagina: 1,
              }));

              setAplicados((actual) => ({
                ...actual,
                registrosPorPagina: cantidad,
                numeroPagina: 1,
              }));
            }}
            className="bg-gray-900 border border-gray-700 rounded px-2 py-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-gray-500">
            Página {aplicados.numeroPagina} de {totalPaginas}
          </span>

          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => cambiarPagina(aplicados.numeroPagina - 1)}
              disabled={aplicados.numeroPagina <= 1}
              className="h-8 w-8 rounded bg-gray-900 border border-gray-700 grid place-items-center disabled:opacity-30"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              type="button"
              onClick={() => cambiarPagina(aplicados.numeroPagina + 1)}
              disabled={aplicados.numeroPagina >= totalPaginas}
              className="h-8 w-8 rounded bg-gray-900 border border-gray-700 grid place-items-center disabled:opacity-30"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ListarInteresados;

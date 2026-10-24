import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Bike,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileSpreadsheet,
  Filter,
  Home,
  Loader2,
  MapPin,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  AlertCircle,
  NotebookPen,
  CalendarDays,
} from "lucide-react";
import Panel from "./Panel";
import { useUsuario } from "../../context/UsuarioContext";
import {
  cambiarGestionProspecto,
  listarProspectosDrive,
  sincronizarProspectosDrive,
  type EstadoProspecto,
  type ListadoProspectosDrive,
  type ProspectoDrive,
  type RubroProspectos,
} from "../../api/prospectosDriveService";

const ESTADOS: Array<{ valor: EstadoProspecto; texto: string }> = [
  { valor: "NUEVO", texto: "Nuevo" },
  { valor: "EN_REVISION", texto: "En revisión" },
  { valor: "CONTACTADO", texto: "Contactado" },
  { valor: "DESCARTADO", texto: "Descartado" },
];
const claseEstado: Record<EstadoProspecto, string> = {
  NUEVO: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  EN_REVISION: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  CONTACTADO: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  DESCARTADO: "border-slate-500/30 bg-slate-500/10 text-slate-400",
};
const formatoFecha = (valor: string | null) => {
  if (!valor) return "Sin sincronizar";
  const fecha = new Date(valor.endsWith("Z") ? valor : `${valor}Z`);
  return Number.isNaN(fecha.getTime())
    ? "Sin fecha"
    : fecha.toLocaleString("es-PY", {
        timeZone: "America/Asuncion",
        dateStyle: "short",
        timeStyle: "short",
      });
};
const textoError = (error: unknown) => {
  const e = error as {
    response?: { status?: number; data?: { message?: string } };
    message?: string;
  };
  if (e?.response?.status === 401 || e?.response?.status === 403)
    return "Solo administradores pueden consultar las investigaciones.";
  return (
    e?.response?.data?.message ||
    e?.message ||
    "No se pudieron cargar las investigaciones."
  );
};
const etiqueta = (valor?: string | null) => valor?.trim() || "No consta";

function Info({ titulo, valor }: { titulo: string; valor?: string | null }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs uppercase tracking-wide text-slate-500">
        {titulo}
      </dt>
      <dd className="break-words text-sm text-slate-200">{etiqueta(valor)}</dd>
    </div>
  );
}

function ModalProspecto({
  prospecto,
  cerrando,
  guardando,
  guardar,
}: {
  prospecto: ProspectoDrive;
  cerrando: () => void;
  guardando: boolean;
  guardar: (estado: EstadoProspecto, notas: string) => Promise<void>;
}) {
  const [estado, setEstado] = useState<EstadoProspecto>(
    prospecto.estadoGestion,
  );
  const [notas, setNotas] = useState(prospecto.notasGestion || "");
  const [error, setError] = useState("");
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrando();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cerrando]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) cerrando();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-prospecto"
        className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-700 bg-[#101c2e] p-5 shadow-2xl sm:p-7"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-amber-300">
              Detalle de oportunidad
            </p>
            <h2
              id="titulo-prospecto"
              className="text-xl font-bold leading-snug text-white"
            >
              {prospecto.solicitudCompra}
            </h2>
          </div>
          <button
            type="button"
            onClick={cerrando}
            aria-label="Cerrar detalle"
            className="rounded-xl bg-white/10 p-2 hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </header>
        <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4 sm:grid-cols-2">
          <Info
            titulo="Zona buscada"
            valor={[prospecto.distrito, prospecto.departamento]
              .filter(Boolean)
              .join(" · ")}
          />
          <Info titulo="Fuente" valor={prospecto.fuente} />
          <Info
            titulo="Fecha publicación"
            valor={prospecto.fechaPublicacionOriginal}
          />
          <Info titulo="Prioridad" valor={prospecto.prioridad} />
          <Info
            titulo="Presupuesto confirmado"
            valor={prospecto.presupuestoConfirmadoGs}
          />
          <Info
            titulo="Importe mostrado (no confirmado)"
            valor={prospecto.importeMostradoGs}
          />
          <Info titulo="Nivel de confianza" valor={prospecto.confianza} />
          <Info
            titulo="Verificación de vigencia"
            valor={prospecto.estadoFuente}
          />
          <div className="sm:col-span-2">
            <Info titulo="Evidencia" valor={prospecto.motivoConfianza} />
          </div>
          <div className="sm:col-span-2">
            <Info
              titulo="Observaciones de investigación"
              valor={prospecto.observaciones}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {prospecto.urlOriginal && (
            <a
              href={prospecto.urlOriginal}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-300"
            >
              <ExternalLink size={17} /> Ver anuncio original
            </a>
          )}
          {prospecto.urlPlanilla && (
            <a
              href={prospecto.urlPlanilla}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10"
            >
              <FileSpreadsheet size={17} /> Abrir planilla
            </a>
          )}
        </div>
        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="mb-4 flex items-center gap-2 font-semibold">
            <NotebookPen size={18} className="text-amber-300" /> Seguimiento
            comercial
          </div>
          <label
            className="block text-xs font-medium text-slate-400"
            htmlFor="estado-gestion"
          >
            Estado del prospecto
          </label>
          <select
            id="estado-gestion"
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoProspecto)}
            className="mt-2 w-full rounded-xl border border-slate-600 bg-[#0a1423] p-3 text-sm text-white focus:border-amber-400 focus:outline-none"
          >
            {ESTADOS.map((x) => (
              <option key={x.valor} value={x.valor}>
                {x.texto}
              </option>
            ))}
          </select>
          <label
            htmlFor="notas-gestion"
            className="mt-4 block text-xs font-medium text-slate-400"
          >
            Notas internas
          </label>
          <textarea
            id="notas-gestion"
            maxLength={2000}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Ej.: Verificar vigencia del anuncio antes de contactar"
            className="mt-2 w-full resize-y rounded-xl border border-slate-600 bg-[#0a1423] p-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
          />
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={cerrando}
              className="rounded-xl px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={guardando}
              onClick={async () => {
                try {
                  setError("");
                  await guardar(estado, notas);
                } catch (e) {
                  setError(textoError(e));
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50"
            >
              {guardando && <Loader2 size={16} className="animate-spin" />}{" "}
              Guardar seguimiento
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ProspectosDrive() {
  const navegar = useNavigate();
  const { esAdmin } = useUsuario();
  const [rubro, setRubro] = useState<RubroProspectos>("INMUEBLES");
  const [estado, setEstado] = useState<EstadoProspecto | "">("");
  const [texto, setTexto] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState<ListadoProspectosDrive | null>(null);
  const [cargando, setCargando] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [seleccionado, setSeleccionado] = useState<ProspectoDrive | null>(null);
  const porPagina = 20;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBusqueda(texto.trim());
      setPagina(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [texto]);

  const cargar = useCallback(
    async (silencioso = false) => {
      if (!esAdmin) {
        setCargando(false);
        return;
      }
      if (!silencioso) setCargando(true);
      try {
        const r = await listarProspectosDrive({
          rubro,
          estado,
          buscar: busqueda,
          pagina,
          porPagina,
        });
        setDatos(r);
        setError("");
      } catch (e) {
        setError(textoError(e));
      } finally {
        setCargando(false);
      }
    },
    [esAdmin, rubro, estado, busqueda, pagina],
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      void cargar(true);
    }, 60000);
    return () => window.clearInterval(timer);
  }, [cargar]);

  const sincronizar = async () => {
    setSincronizando(true);
    setAviso("");
    setError("");
    try {
      const r = await sincronizarProspectosDrive();
      setAviso(
        `Drive actualizado: ${r.planillas} planillas · ${r.filasNuevas} nuevos · ${r.filasRepetidas} repetidos omitidos.`,
      );
      await cargar(true);
    } catch (e) {
      setError(textoError(e));
    } finally {
      setSincronizando(false);
    }
  };
  const guardar = async (estadoNuevo: EstadoProspecto, notas: string) => {
    if (!seleccionado) return;
    setGuardando(true);
    try {
      await cambiarGestionProspecto(seleccionado.id, rubro, estadoNuevo, notas);
      setSeleccionado(null);
      setAviso(
        "Seguimiento actualizado. Los datos de investigación no se modificaron.",
      );
      await cargar(true);
    } finally {
      setGuardando(false);
    }
  };
  const paginas = Math.max(1, Math.ceil((datos?.total || 0) / porPagina));
  const registros = useMemo(() => datos?.items ?? [], [datos]);

  return (
    <div className="min-h-screen bg-[#08101e] text-slate-100 md:flex">
      <aside className="w-full border-r border-white/10 bg-[#0d1524] p-3 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:overflow-auto">
        <Panel />
      </aside>
      <main className="mx-auto w-full min-w-0 max-w-7xl space-y-6 p-4 pb-24 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => navegar("/clientes/dashboard")}
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300"
            >
              <ArrowLeft size={16} /> Panel de clientes
            </button>
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-amber-400/10 p-3 text-amber-300">
                <Sparkles size={26} />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Investigaciones comerciales
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Oportunidades detectadas en Drive, sin esperar al informe
                  diario.
                </p>
              </div>
            </div>
          </div>
          {esAdmin && (
            <button
              type="button"
              disabled={sincronizando}
              onClick={sincronizar}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-60"
            >
              <RefreshCcw
                size={17}
                className={sincronizando ? "animate-spin" : ""}
              />{" "}
              {sincronizando ? "Sincronizando…" : "Sincronizar Drive"}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#101c2e] p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Rubro
            </span>
            {(
              [
                { valor: "INMUEBLES", texto: "Inmuebles", icono: Home },
                { valor: "MOTOS", texto: "Motos", icono: Bike },
              ] as const
            ).map(({ valor, texto, icono: Icono }) => (
              <button
                key={valor}
                type="button"
                onClick={() => {
                  setRubro(valor);
                  setPagina(1);
                  setEstado("");
                  setTexto("");
                  setSeleccionado(null);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${rubro === valor ? "bg-amber-400 text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                <Icono size={17} /> {texto}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock3 size={15} /> Última sincronización:{" "}
            <span className="font-medium text-slate-200">
              {formatoFecha(datos?.ultimaSincronizacionUtc ?? null)}
            </span>
          </div>
        </div>

        {!esAdmin && (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5 text-amber-200">
            Solo un administrador puede acceder a investigaciones comerciales.
          </div>
        )}
        {esAdmin && (
          <>
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
              >
                <AlertCircle size={19} className="shrink-0" /> {error}
              </div>
            )}
            {aviso && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200"
              >
                <CheckCircle2 size={19} className="shrink-0" /> {aviso}
              </div>
            )}
            {datos &&
              !datos.ultimaSincronizacionExitosa &&
              datos.ultimaSincronizacionUtc && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-200">
                  La última sincronización falló. Los registros existentes
                  siguen disponibles; comprobá el acceso de Google Drive en el
                  servidor.
                </div>
              )}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  nombre: "Total detectados",
                  valor: datos?.total ?? 0,
                  icono: Search,
                  ayuda: "Según los filtros actuales",
                },
                {
                  nombre: "Nuevos",
                  valor: datos?.nuevos ?? 0,
                  icono: Sparkles,
                  ayuda: "Sin revisión comercial",
                },
                {
                  nombre: "En revisión",
                  valor: datos?.enRevision ?? 0,
                  icono: Clock3,
                  ayuda: "Pendientes de validar",
                },
                {
                  nombre: "Contactados",
                  valor: datos?.contactados ?? 0,
                  icono: ShieldCheck,
                  ayuda: "Con seguimiento registrado",
                },
              ].map(({ nombre, valor, icono: Icono, ayuda }) => (
                <div
                  key={nombre}
                  className="rounded-2xl border border-white/10 bg-[#101c2e] p-5"
                >
                  <div className="mb-3 flex items-center justify-between text-slate-400">
                    <span className="text-sm">{nombre}</span>
                    <Icono size={18} className="text-amber-300" />
                  </div>
                  <p className="text-3xl font-bold">{valor}</p>
                  <p className="mt-1 text-xs text-slate-500">{ayuda}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#101c2e] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {rubro === "INMUEBLES"
                      ? "Compradores de inmuebles"
                      : "Interesados en motocicletas"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    La detección indica interés, no confirma que la compra siga
                    vigente.
                  </p>
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-700 bg-[#0a1423] px-3 sm:w-60">
                    <Search size={18} className="shrink-0 text-slate-500" />
                    <input
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      placeholder="Buscar por zona, fuente..."
                      aria-label="Buscar prospectos"
                      className="w-full min-w-0 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-500"
                    />
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0a1423] px-3">
                    <Filter size={17} className="text-slate-500" />
                    <select
                      aria-label="Filtrar por estado"
                      value={estado}
                      onChange={(e) => {
                        setEstado(e.target.value as EstadoProspecto | "");
                        setPagina(1);
                      }}
                      className="bg-transparent py-2.5 text-sm text-white outline-none"
                    >
                      <option value="">Todos</option>
                      {ESTADOS.map((s) => (
                        <option value={s.valor} key={s.valor}>
                          {s.texto}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-sm">
                  <thead className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="pb-4 pr-4">Interés detectado</th>
                      <th className="pb-4 pr-4">Ubicación</th>
                      <th className="pb-4 pr-4">Fuente / publicación</th>
                      <th className="pb-4 pr-4">Prioridad</th>
                      <th className="pb-4 pr-4">Gestión</th>
                      <th className="pb-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {registros.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.025]">
                        <td className="max-w-xs py-4 pr-4 align-top">
                          <p className="line-clamp-3 font-medium leading-relaxed text-slate-100">
                            {p.solicitudCompra}
                          </p>
                          <span className="mt-2 inline-block text-xs text-slate-500">
                            Confianza: {etiqueta(p.confianza)}
                          </span>
                        </td>
                        <td className="py-4 pr-4 align-top">
                          <div className="flex items-start gap-1.5 text-slate-300">
                            <MapPin
                              size={16}
                              className="mt-0.5 shrink-0 text-slate-500"
                            />
                            <span>{etiqueta(p.distrito)}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4 align-top">
                          <p className="text-slate-300">{etiqueta(p.fuente)}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {etiqueta(p.fechaPublicacionOriginal)}
                          </p>
                        </td>
                        <td className="py-4 pr-4 align-top">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs ${p.prioridad?.toLowerCase() === "alta" ? "border-amber-400/30 bg-amber-400/10 text-amber-300" : "border-white/10 bg-white/5 text-slate-300"}`}
                          >
                            {etiqueta(p.prioridad)}
                          </span>
                        </td>
                        <td className="py-4 pr-4 align-top">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${claseEstado[p.estadoGestion]}`}
                          >
                            {ESTADOS.find((s) => s.valor === p.estadoGestion)
                              ?.texto || p.estadoGestion}
                          </span>
                        </td>
                        <td className="py-4 text-right align-top">
                          <button
                            type="button"
                            onClick={() => setSeleccionado(p)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-400/10"
                          >
                            Ver detalle <ArrowUpRight size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!cargando && !error && registros.length === 0 && (
                  <div className="py-16 text-center">
                    <FileSpreadsheet
                      size={34}
                      className="mx-auto mb-3 text-slate-500"
                    />
                    <p className="font-semibold text-slate-200">
                      No hay registros para mostrar
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Probá quitando filtros o sincronizando la carpeta de
                      Drive.
                    </p>
                  </div>
                )}
                {cargando && (
                  <div className="flex justify-center gap-2 py-12 text-sm text-slate-400">
                    <Loader2 className="animate-spin" size={18} /> Cargando
                    investigaciones...
                  </div>
                )}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-slate-400">
                <span>
                  {datos?.total ?? 0} registros filtrados · página {pagina} de{" "}
                  {paginas}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={pagina <= 1}
                    onClick={() => setPagina((p) => p - 1)}
                    className="rounded-lg border border-white/15 px-3 py-2 disabled:opacity-30"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={pagina >= paginas}
                    onClick={() => setPagina((p) => p + 1)}
                    className="rounded-lg border border-white/15 px-3 py-2 disabled:opacity-30"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
            <p className="flex items-start gap-2 text-xs text-slate-500">
              <CalendarDays size={15} className="shrink-0" /> Los importes
              mostrados en anuncios no equivalen necesariamente a presupuestos
              confirmados. Verificá la vigencia y evitá mensajes no solicitados.
            </p>
          </>
        )}
      </main>
      {seleccionado && (
        <ModalProspecto
          key={seleccionado.id}
          prospecto={seleccionado}
          guardando={guardando}
          guardar={guardar}
          cerrando={() => setSeleccionado(null)}
        />
      )}
    </div>
  );
}

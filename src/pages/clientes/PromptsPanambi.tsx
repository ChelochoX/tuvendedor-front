import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  FolderSearch,
  Loader2,
  MessageCircle,
  PencilLine,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import {
  listarPrompts,
  publicarPrompt,
  restaurarPrompt,
  textoErrorPrompt,
  versionesPrompt,
  type PromptCatalogo,
  type PromptVersion,
} from "../../api/promptsPanambiService";

type Filtro = "TODOS" | "EDITOR" | "LEGADO" | "PREDETERMINADO";
type Orden = "TITULO" | "CODIGO";

const ejemplos: Record<string, { cliente: string; aclaracion: string }> = {
  DICCIONARIO_SOCIAL: {
    cliente: "Mba'éichapa che amigo / ¿Qué tal César? / Bien y vos",
    aclaracion:
      "Una expresión por línea: TIPO|expresión. Tipos válidos: SALUDO, RESPUESTA_SOCIAL, AGRADECIMIENTO, DESPEDIDA, ACLARACION. Publicar modifica el reconocimiento en nuevos mensajes SIN desplegar backend.",
  },
  RESPUESTA_SOCIAL: {
    cliente: "Bien, y vos?",
    aclaracion: "Solo cortesía: no vender productos sin solicitud.",
  },
  RESPUESTA_AGRADECIMIENTO: {
    cliente: "Aguyje",
    aclaracion: "Agradecimiento cordial sin recomendaciones.",
  },
  RESPUESTA_DESPEDIDA: {
    cliente: "Jajotopata",
    aclaracion: "Cerrar de forma amable.",
  },
  RESPUESTA_ACLARACION: {
    cliente: "No entendí",
    aclaracion: "Solicitar explicación concreta.",
  },
  MARKETPLACE_SALUDO: {
    cliente: "¿Qué opciones de terreno tenés por Areguá?",
    aclaracion:
      "Se utiliza después de encontrar coincidencias reales por rubro y zona. Si la plantilla incluye {opciones}, conservá esa variable.",
  },
  MARKETPLACE_CIERRE: {
    cliente: "Me interesa el segundo terreno",
    aclaracion:
      "Aparece al terminar de mostrar opciones reales. No modifica datos ni condiciones de las publicaciones.",
  },
  MARKETPLACE_SIN_RESULTADOS: {
    cliente: "¿Tenés terrenos en una zona sin publicaciones?",
    aclaracion:
      "El backend confirma que no existen coincidencias antes de utilizar este mensaje.",
  },
  CONVERSACION_GENERAL: {
    cliente: "Hola, ¿cómo me podés ayudar?",
    aclaracion:
      "Se envía a Ollama junto con las reglas de negocio y los datos verificables que aporta el sistema.",
  },
  SALUDO_CASUAL: {
    cliente: "Hola, ¿qué tal?",
    aclaracion:
      "Debe responder con amabilidad y sin ofrecer publicaciones no solicitadas.",
  },
  MOTO_VENTAS_BASE: {
    cliente: "¿Cuánto cuesta la Kenton?",
    aclaracion:
      "Estas instrucciones no alteran el precio, la disponibilidad ni las condiciones del catálogo.",
  },
};

const etiquetaOrigen = (origen: PromptCatalogo["origen"]): string => {
  if (origen === "EDITOR") return "Publicado";
  if (origen === "LEGADO") return "Original";
  return "Predeterminado";
};

const claseEstado = (origen: PromptCatalogo["origen"]): string => {
  if (origen === "EDITOR")
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (origen === "LEGADO")
    return "border-sky-500/30 bg-sky-500/10 text-sky-300";
  return "border-amber-500/30 bg-amber-500/10 text-amber-300";
};

const fechaLocal = (texto: string): string => {
  if (!texto) return "Fecha no disponible";
  const iso = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(texto) ? texto : `${texto}Z`;
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? texto : fecha.toLocaleString("es-PY");
};

const descripcionPlantilla = (item: PromptCatalogo): string =>
  item.descripcion?.trim() || `Instrucciones de ${item.titulo.toLowerCase()}.`;

const tipoPlantilla = (
  item: PromptCatalogo,
): "moto" | "marketplace" | "general" | "credito" | "otra" => {
  if (item.codigo.startsWith("CREDITO_")) return "credito";
  if (item.codigo.startsWith("MARKETPLACE_")) return "marketplace";
  if (item.codigo.startsWith("MOTO_")) return "moto";
  if (
    [
      "CONVERSACION_GENERAL",
      "SALUDO_CASUAL",
      "DICCIONARIO_SOCIAL",
      "RESPUESTA_SOCIAL",
      "RESPUESTA_AGRADECIMIENTO",
      "RESPUESTA_DESPEDIDA",
      "RESPUESTA_ACLARACION",
    ].includes(item.codigo)
  )
    return "general";
  return "otra";
};

const PromptsPanambi: React.FC = () => {
  const [items, setItems] = useState<PromptCatalogo[]>([]);
  const [modalCodigo, setModalCodigo] = useState<string | null>(null);
  const [borrador, setBorrador] = useState("");
  const [historial, setHistorial] = useState<PromptVersion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [errorModal, setErrorModal] = useState("");
  const [aviso, setAviso] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("TODOS");
  const [orden, setOrden] = useState<Orden>("TITULO");
  const dialogoRef = useRef<HTMLDivElement>(null);
  const enfoqueAnteriorRef = useRef<HTMLElement | null>(null);
  const solicitudHistorialRef = useRef(0);

  const actual = useMemo(
    () => items.find((item) => item.codigo === modalCodigo),
    [items, modalCodigo],
  );
  const modificado = !!actual && actual.contenido !== borrador;

  const cantidades = useMemo(
    () => ({
      TODOS: items.length,
      EDITOR: items.filter((i) => i.origen === "EDITOR").length,
      LEGADO: items.filter((i) => i.origen === "LEGADO").length,
      PREDETERMINADO: items.filter((i) => i.origen === "PREDETERMINADO").length,
    }),
    [items],
  );

  const visibles = useMemo(() => {
    const criterio = busqueda.trim().toLocaleLowerCase("es-PY");
    return items
      .filter((item) => {
        if (filtro !== "TODOS" && item.origen !== filtro) return false;
        return (
          !criterio ||
          [item.titulo, item.codigo, item.descripcion].some((texto) =>
            (texto || "").toLocaleLowerCase("es-PY").includes(criterio),
          )
        );
      })
      .sort((a, b) =>
        orden === "CODIGO"
          ? a.codigo.localeCompare(b.codigo, "es")
          : a.titulo.localeCompare(b.titulo, "es"),
      );
  }, [items, busqueda, filtro, orden]);

  const cargar = async (codigoActivo?: string | null) => {
    setCargando(true);
    setError("");
    try {
      const datos = await listarPrompts();
      setItems(datos);
      if (codigoActivo) {
        const encontrado = datos.find((item) => item.codigo === codigoActivo);
        if (encontrado) setBorrador(encontrado.contenido);
      }
    } catch (e) {
      setError(textoErrorPrompt(e));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const cerrar = (): void => {
    if (guardando) return;
    if (
      modificado &&
      !window.confirm("Tenés cambios sin publicar. ¿Descartarlos y cerrar?")
    )
      return;
    solicitudHistorialRef.current += 1;
    setModalCodigo(null);
    setHistorial([]);
    setErrorModal("");
  };

  const abrir = async (item: PromptCatalogo): Promise<void> => {
    if (guardando) return;
    if (
      modificado &&
      !window.confirm("Tenés cambios sin publicar. ¿Descartarlos?")
    )
      return;
    enfoqueAnteriorRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setModalCodigo(item.codigo);
    setBorrador(item.contenido);
    setHistorial([]);
    setErrorModal("");
    setCargandoHistorial(true);
    const solicitud = ++solicitudHistorialRef.current;
    try {
      const versiones = await versionesPrompt(item.codigo);
      if (solicitud === solicitudHistorialRef.current) setHistorial(versiones);
    } catch (e) {
      if (solicitud === solicitudHistorialRef.current)
        setErrorModal(textoErrorPrompt(e));
    } finally {
      if (solicitud === solicitudHistorialRef.current)
        setCargandoHistorial(false);
    }
  };

  useEffect(() => {
    if (!modalCodigo) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogoRef.current?.focus();
    return () => {
      document.body.style.overflow = overflowAnterior;
      enfoqueAnteriorRef.current?.focus();
    };
  }, [modalCodigo]);

  // Escape cierra el modal; se solicita confirmación si hay un texto sin publicar.
  useEffect(() => {
    if (!modalCodigo) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cerrar();
      }
      // Evitar que el foco abandone accidentalmente el diálogo con Tab.
      if (event.key === "Tab" && dialogoRef.current) {
        const elementos = Array.from(
          dialogoRef.current.querySelectorAll<HTMLElement>(
            "button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]",
          ),
        ).filter((el) => el.getClientRects().length > 0);
        if (!elementos.length) return;
        const primero = elementos[0];
        const ultimo = elementos[elementos.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === primero ||
            document.activeElement === dialogoRef.current)
        ) {
          event.preventDefault();
          ultimo.focus();
        } else if (!event.shiftKey && document.activeElement === ultimo) {
          event.preventDefault();
          primero.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modalCodigo, modificado, guardando]);

  const refrescar = async (): Promise<void> => {
    if (guardando) return;
    if (
      modificado &&
      !window.confirm("Tenés cambios sin publicar. ¿Descartarlos y actualizar?")
    )
      return;
    setAviso("");
    setErrorModal("");
    await cargar(modalCodigo);
    if (modalCodigo) {
      const solicitud = ++solicitudHistorialRef.current;
      setCargandoHistorial(true);
      try {
        const versiones = await versionesPrompt(modalCodigo);
        if (solicitud === solicitudHistorialRef.current)
          setHistorial(versiones);
      } catch (e) {
        if (solicitud === solicitudHistorialRef.current)
          setErrorModal(textoErrorPrompt(e));
      } finally {
        if (solicitud === solicitudHistorialRef.current)
          setCargandoHistorial(false);
      }
    }
  };

  const publicar = async (): Promise<void> => {
    if (!actual || !modificado || !borrador.trim() || guardando) return;
    if (
      !window.confirm(
        `¿Publicar los cambios de «${actual.titulo}»? Se utilizarán en los próximos mensajes.`,
      )
    )
      return;
    const codigo = actual.codigo;
    setGuardando(true);
    setErrorModal("");
    setAviso("");
    try {
      await publicarPrompt(codigo, borrador, actual.version);
      const datos = await listarPrompts();
      setItems(datos);
      setBorrador(
        datos.find((i) => i.codigo === codigo)?.contenido ?? borrador,
      );
      setHistorial(await versionesPrompt(codigo));
      setAviso(
        `Se publicó «${actual.titulo}». Los siguientes mensajes utilizarán la versión nueva.`,
      );
    } catch (e) {
      setErrorModal(textoErrorPrompt(e));
    } finally {
      setGuardando(false);
    }
  };

  const restaurar = async (version: number): Promise<void> => {
    if (!actual || guardando) return;
    if (
      modificado &&
      !window.confirm(
        "Tenés cambios sin publicar. ¿Descartarlos para restaurar una versión anterior?",
      )
    )
      return;
    if (
      !window.confirm(
        `¿Restaurar la versión ${version} de «${actual.titulo}»? Se publicará como una nueva versión.`,
      )
    )
      return;
    const codigo = actual.codigo;
    setGuardando(true);
    setErrorModal("");
    setAviso("");
    try {
      await restaurarPrompt(codigo, version, actual.version);
      const datos = await listarPrompts();
      setItems(datos);
      setBorrador(datos.find((i) => i.codigo === codigo)?.contenido ?? "");
      setHistorial(await versionesPrompt(codigo));
      setAviso(`Se restauró la versión ${version} de «${actual.titulo}».`);
    } catch (e) {
      setErrorModal(textoErrorPrompt(e));
    } finally {
      setGuardando(false);
    }
  };

  const filtros: { id: Filtro; texto: string; punto: string }[] = [
    { id: "TODOS", texto: "Todas", punto: "bg-yellow-400" },
    { id: "EDITOR", texto: "Publicadas", punto: "bg-emerald-400" },
    { id: "LEGADO", texto: "Originales", punto: "bg-sky-400" },
    { id: "PREDETERMINADO", texto: "Predeterminadas", punto: "bg-amber-400" },
  ];

  return (
    <main className="min-h-screen bg-[#090e18] text-slate-100 px-4 py-6 sm:px-7">
      <div className="mx-auto max-w-[1480px] space-y-5">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link
              to="/clientes/dashboard"
              className="inline-flex gap-2 items-center text-xs text-slate-400 hover:text-yellow-400 mb-3"
            >
              <ArrowLeft size={14} /> Panel de clientes
            </Link>
            <h1 className="text-2xl font-bold flex gap-3 items-center">
              <Sparkles size={26} className="text-yellow-400" /> Prompts de
              Panambí
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Editá instrucciones comerciales y publicalas sin modificar el
              backend ni volver a desplegar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refrescar()}
            disabled={cargando || guardando}
            className="flex gap-2 items-center border border-slate-700 rounded-lg px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-40"
          >
            <RefreshCw size={15} className={cargando ? "animate-spin" : ""} />{" "}
            Actualizar
          </button>
        </header>

        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-sm p-4 flex gap-3 items-start">
          <ShieldAlert className="text-yellow-400 shrink-0 mt-0.5" size={18} />
          <div>
            <strong className="text-yellow-300">Reglas protegidas:</strong> los
            prompts no pueden modificar datos reales del catálogo, anular
            atención humana ni evitar las reglas de rechazo. Los filtros
            comerciales se validan desde el backend.
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="border border-red-600/40 bg-red-950/30 text-red-200 p-3 rounded-lg"
          >
            {error}
          </div>
        )}
        {aviso && (
          <div
            role="status"
            className="border border-emerald-500/40 bg-emerald-900/20 text-emerald-300 p-3 rounded-lg flex gap-2 items-center"
          >
            <CheckCircle2 size={17} />
            {aviso}
          </div>
        )}

        <section aria-label="Plantillas disponibles" className="space-y-4">
          <div className="flex flex-col xl:flex-row xl:items-center gap-3 xl:justify-between">
            <label className="relative block w-full xl:max-w-[370px]">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <span className="sr-only">Buscar plantillas</span>
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar plantillas por nombre o código…"
                className="w-full rounded-xl border border-slate-700 bg-[#101c2e] py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-400"
              />
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {filtros.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setFiltro(item.id)}
                  aria-pressed={filtro === item.id}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold border transition-colors ${filtro === item.id ? "border-yellow-400 bg-yellow-400/10 text-yellow-200" : "border-slate-700 bg-[#101c2e] text-slate-300 hover:border-slate-500"}`}
                >
                  {item.id !== "TODOS" && (
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 rounded-full ${item.punto}`}
                    />
                  )}
                  {item.texto} ({cantidades[item.id]})
                </button>
              ))}
              <label className="sr-only" htmlFor="orden-prompts">
                Ordenar plantillas
              </label>
              <select
                id="orden-prompts"
                value={orden}
                onChange={(e) => setOrden(e.target.value as Orden)}
                className="bg-[#101c2e] border border-slate-700 rounded-lg text-xs text-slate-200 py-2 px-3 focus:outline-none focus:border-yellow-400"
              >
                <option value="TITULO">Nombre A–Z</option>
                <option value="CODIGO">Código A–Z</option>
              </select>
            </div>
          </div>

          {cargando && (
            <div className="flex items-center gap-2 p-5 text-slate-400 text-sm">
              <Loader2 className="animate-spin" size={18} /> Cargando
              plantillas…
            </div>
          )}
          {!cargando && visibles.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-[#101c2e] p-10 text-center space-y-2">
              <FolderSearch className="text-slate-400 mx-auto" size={30} />
              <p className="font-medium">
                No hay plantillas que coincidan con la búsqueda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setBusqueda("");
                  setFiltro("TODOS");
                }}
                className="text-yellow-300 text-sm underline"
              >
                Ver todas las plantillas
              </button>
            </div>
          )}
          {!cargando && visibles.length > 0 && (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {visibles.map((item) => {
                const rubro = tipoPlantilla(item);
                const Icono =
                  rubro === "general"
                    ? MessageCircle
                    : rubro === "marketplace"
                      ? FolderSearch
                      : rubro === "credito"
                        ? FileText
                        : BookOpen;
                return (
                  <button
                    key={item.codigo}
                    type="button"
                    onClick={() => void abrir(item)}
                    className="group text-left flex flex-col gap-3 min-h-[148px] rounded-xl bg-[#101c2e] border border-slate-800 p-4 hover:border-yellow-500/70 hover:bg-[#14243a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-sky-600/30 bg-sky-500/10 text-sky-300 group-hover:text-yellow-300 group-hover:bg-yellow-500/10 group-hover:border-yellow-500/30">
                        <Icono size={19} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-100 leading-5 break-words">
                          {item.titulo}
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-1 break-all">
                          {item.codigo}
                        </span>
                      </span>
                      <PencilLine
                        size={15}
                        className="text-slate-500 shrink-0 group-hover:text-yellow-300"
                      />
                    </div>
                    <p className="text-xs text-slate-400 leading-5 line-clamp-2 flex-1">
                      {descripcionPlantilla(item)}
                    </p>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${claseEstado(item.origen)}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {etiquetaOrigen(item.origen)}
                      </span>
                      {item.version > 0 && (
                        <span className="text-[11px] text-slate-400">
                          Versión {item.version}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {!cargando && items.length > 0 && (
            <p className="text-xs text-slate-500">
              Mostrando {visibles.length} de {items.length} plantillas.
              Seleccioná una tarjeta para abrir su editor.
            </p>
          )}
        </section>

        <aside className="rounded-xl border border-slate-800 bg-[#101c2e] p-4 flex gap-3 items-start">
          <BookOpen size={21} className="text-yellow-400 shrink-0" />
          <div>
            <h2 className="font-semibold text-sm">Acerca de los prompts</h2>
            <p className="text-xs text-slate-400 mt-1 leading-5">
              Cada plantilla determina una parte del estilo de conversación de
              Panambí. Los datos, rechazos y reglas comerciales siguen
              controlados por el backend.
            </p>
          </div>
        </aside>
      </div>

      {modalCodigo &&
        actual &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] bg-[#02060d]/85 backdrop-blur-[3px] flex items-center justify-center px-2 py-3 sm:p-5"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) cerrar();
            }}
          >
            <div
              ref={dialogoRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-modal-prompt"
              tabIndex={-1}
              className="flex flex-col w-full max-w-4xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] overflow-hidden outline-none rounded-2xl bg-[#101c2e] border border-slate-600/80 shadow-[0_20px_90px_rgba(0,0,0,0.75)]"
            >
              <header className="shrink-0 px-4 sm:px-6 py-4 flex items-start gap-3 border-b border-slate-700/70">
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-yellow-400/10 border border-yellow-500/40 text-yellow-400 shrink-0">
                  <MessageCircle size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2
                    id="titulo-modal-prompt"
                    className="text-lg sm:text-xl font-bold break-words"
                  >
                    {actual.titulo}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    {descripcionPlantilla(actual)}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${claseEstado(actual.origen)}`}
                    >
                      {etiquetaOrigen(actual.origen)} ·{" "}
                      {actual.version
                        ? `Versión ${actual.version}`
                        : "Versión original"}
                    </span>
                    {modificado && (
                      <span className="rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[11px] font-semibold px-2.5 py-1">
                        Cambios sin publicar
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={cerrar}
                  disabled={guardando}
                  aria-label="Cerrar editor"
                  className="p-2 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                >
                  <X size={21} />
                </button>
              </header>

              <div className="overflow-y-auto flex-1 min-h-0 p-4 sm:p-6 space-y-4 overscroll-contain">
                {errorModal && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200"
                  >
                    {errorModal}
                  </div>
                )}
                <section className="rounded-xl border border-slate-700/70 bg-[#13223a] p-3 sm:p-4 space-y-3">
                  <div className="flex gap-2 items-center justify-between flex-wrap">
                    <label
                      htmlFor="prompt-editor"
                      className="inline-flex gap-2 items-center text-sm font-semibold"
                    >
                      <PencilLine size={17} className="text-yellow-400" />{" "}
                      Instrucciones y redacción
                    </label>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {borrador.length.toLocaleString("es-PY")} / 12.000
                      caracteres
                    </span>
                  </div>
                  <textarea
                    id="prompt-editor"
                    value={borrador}
                    onChange={(e) => setBorrador(e.target.value)}
                    maxLength={12000}
                    disabled={guardando}
                    spellCheck
                    rows={11}
                    className="block w-full min-h-[220px] sm:min-h-[260px] rounded-lg bg-[#080f1c] border border-slate-600 p-3 sm:p-4 font-mono text-[13px] leading-6 text-slate-100 focus:outline-none focus:border-yellow-400 resize-y disabled:opacity-60"
                  />
                  <p className="text-[11px] text-slate-400">
                    Los cambios no se aplican hasta presionar «Publicar
                    cambios».
                  </p>
                </section>
                <section className="rounded-xl border border-slate-700/70 bg-[#13223a] p-3 sm:p-4 space-y-2">
                  <h3 className="text-sm font-semibold inline-flex gap-2 items-center">
                    <BookOpen className="text-yellow-400" size={17} /> Contexto
                    de ejemplo
                  </h3>
                  <div className="rounded-lg border border-slate-700 bg-[#0b1627] px-3 py-3 text-sm text-slate-200">
                    {ejemplos[actual.codigo]?.cliente ??
                      "Consulta comercial sobre una publicación de TuVendedor"}
                  </div>
                  <p className="text-xs leading-5 text-slate-400">
                    {ejemplos[actual.codigo]?.aclaracion ??
                      "Este prompt se combina con la información confirmada por el backend."}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Este ejemplo es orientativo: no llama a Ollama ni envía
                    mensajes de WhatsApp.
                  </p>
                </section>
                <section className="rounded-xl border border-slate-700/70 bg-[#13223a] p-3 sm:p-4 space-y-3">
                  <h3 className="inline-flex gap-2 items-center text-sm font-semibold">
                    <Clock3 size={18} className="text-yellow-400" /> Historial y
                    recuperación
                  </h3>
                  {cargandoHistorial && (
                    <p className="text-slate-400 text-xs flex gap-2 items-center">
                      <Loader2 size={14} className="animate-spin" /> Cargando
                      historial…
                    </p>
                  )}
                  {!cargandoHistorial && historial.length === 0 && (
                    <p className="text-slate-400 text-xs">
                      Esta plantilla todavía no tiene versiones publicadas desde
                      el panel.
                    </p>
                  )}
                  {!cargandoHistorial &&
                    historial.map((version) => (
                      <div
                        key={version.id}
                        className="rounded-lg border border-slate-700 bg-[#0b1627] px-3 py-3 flex items-center justify-between gap-3 flex-wrap"
                      >
                        <div>
                          <p className="text-sm font-semibold">
                            Versión {version.version} · {version.estado}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {fechaLocal(version.fechaCreacionUtc)} · Usuario{" "}
                            {version.idUsuario ?? "—"}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={guardando || version.estado === "PUBLICADO"}
                          onClick={() => void restaurar(version.version)}
                          className="inline-flex gap-1.5 items-center text-xs text-yellow-300 px-3 py-2 border border-yellow-500/40 rounded-lg hover:bg-yellow-400/10 disabled:opacity-35 disabled:cursor-not-allowed"
                        >
                          <RotateCcw size={14} /> Restaurar
                        </button>
                      </div>
                    ))}
                </section>
              </div>

              <footer className="shrink-0 border-t border-slate-700/70 px-4 sm:px-6 py-3 sm:py-4 bg-[#101c2e] flex gap-3 items-center justify-between flex-wrap">
                <button
                  type="button"
                  onClick={cerrar}
                  disabled={guardando}
                  className="px-4 py-2.5 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700 disabled:opacity-40 text-sm"
                >
                  {modificado ? "Descartar y cerrar" : "Cerrar"}
                </button>
                <button
                  type="button"
                  onClick={() => void publicar()}
                  disabled={!modificado || !borrador.trim() || guardando}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-[#17160f] font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {guardando ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {guardando ? "Publicando…" : "Publicar cambios"}
                </button>
              </footer>
            </div>
          </div>,
          document.body,
        )}
    </main>
  );
};

export default PromptsPanambi;

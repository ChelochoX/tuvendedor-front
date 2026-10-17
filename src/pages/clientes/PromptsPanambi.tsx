import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldAlert,
  Sparkles,
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

const ejemplos: Record<
  string,
  { titulo: string; cliente: string; aclaracion: string }
> = {
  MARKETPLACE_SALUDO: {
    titulo: "Búsqueda de terrenos",
    cliente: "¿Qué opciones de terreno tenés por Areguá?",
    aclaracion:
      "El saludo se agrega únicamente cuando SQL Server encuentra publicaciones que coinciden con rubro y zona. Usá {opciones} para singular/plural automático.",
  },
  MARKETPLACE_CIERRE: {
    titulo: "Elección del producto",
    cliente: "Me interesa el segundo terreno",
    aclaracion:
      "El cierre aparece después de mostrar publicaciones reales; no puede cambiar su precio ni ubicación.",
  },
  MARKETPLACE_SIN_RESULTADOS: {
    titulo: "Búsqueda sin coincidencias",
    cliente: "¿Tenés terrenos en una zona sin publicaciones?",
    aclaracion:
      "El backend confirma que no encontró coincidencias antes de mostrar este texto.",
  },
  CONVERSACION_GENERAL: {
    titulo: "Conversación abierta",
    cliente: "Hola, ¿cómo me podés ayudar?",
    aclaracion:
      "Estas instrucciones se envían a Ollama junto con reglas de catálogo verificable.",
  },
  MOTO_VENTAS_BASE: {
    titulo: "Ofertas de motos",
    cliente: "¿Cuánto cuesta la Kenton?",
    aclaracion:
      "Este texto reemplaza el prompt base de moto al publicarlo. No modifica importes de la base de datos.",
  },
};

const tituloEstado = (s: string) =>
  s === "EDITOR"
    ? "Publicado desde el panel"
    : s === "LEGADO"
      ? "Prompt original de SQL"
      : "Texto predeterminado";

const PromptsPanambi: React.FC = () => {
  const [items, setItems] = useState<PromptCatalogo[]>([]);
  const [seleccion, setSeleccion] = useState("");
  const [borrador, setBorrador] = useState("");
  const [historial, setHistorial] = useState<PromptVersion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const actual = useMemo(
    () => items.find((x) => x.codigo === seleccion),
    [items, seleccion],
  );
  const modificado = !!actual && actual.contenido !== borrador;

  const cargar = async (conservar = true) => {
    setError("");
    setCargando(true);
    try {
      const datos = await listarPrompts();
      setItems(datos);
      const codigo =
        conservar && seleccion && datos.some((x) => x.codigo === seleccion)
          ? seleccion
          : (datos[0]?.codigo ?? "");
      const seleccionado = datos.find((x) => x.codigo === codigo);
      setSeleccion(codigo);
      setBorrador(seleccionado?.contenido ?? "");
      setHistorial(codigo ? await versionesPrompt(codigo) : []);
    } catch (e) {
      setError(textoErrorPrompt(e));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar(false); /* al montar la pantalla */
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cambiar = async (codigo: string) => {
    if (
      modificado &&
      !window.confirm("Tenés cambios sin publicar. ¿Descartarlos?")
    )
      return;
    setSeleccion(codigo);
    setBorrador(items.find((x) => x.codigo === codigo)?.contenido ?? "");
    setAviso("");
    setError("");
    try {
      setHistorial(await versionesPrompt(codigo));
    } catch (e) {
      setError(textoErrorPrompt(e));
    }
  };

  const publicar = async () => {
    if (!actual || !borrador.trim() || guardando) return;
    if (
      !window.confirm(
        `¿Publicar ${actual.codigo}? El siguiente mensaje procesado utilizará esta versión.`,
      )
    )
      return;
    setGuardando(true);
    setError("");
    setAviso("");
    try {
      await publicarPrompt(actual.codigo, borrador, actual.version);
      await cargar();
      setAviso(
        "Prompt publicado. Los nuevos mensajes utilizarán esta redacción sin redeploy.",
      );
    } catch (e) {
      setError(textoErrorPrompt(e));
    } finally {
      setGuardando(false);
    }
  };

  const restaurar = async (version: number) => {
    if (!actual || guardando) return;
    if (
      !window.confirm(
        `¿Recuperar la versión ${version} de ${actual.codigo}? Se publicará como una versión nueva.`,
      )
    )
      return;
    setGuardando(true);
    setError("");
    setAviso("");
    try {
      await restaurarPrompt(actual.codigo, version, actual.version);
      await cargar();
      setAviso(
        `Restaurada la versión ${version}. Se creó una nueva versión publicada.`,
      );
    } catch (e) {
      setError(textoErrorPrompt(e));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090e18] text-slate-100 px-4 py-6 sm:px-7">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
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
            onClick={() => {
              if (
                !modificado ||
                window.confirm("¿Descartar los cambios no publicados?")
              )
                void cargar();
            }}
            className="flex gap-2 items-center border border-slate-700 rounded-lg px-4 py-2 hover:bg-slate-800"
          >
            <RefreshCw size={15} /> Actualizar
          </button>
        </div>
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-sm p-4 flex gap-3 items-start">
          <ShieldAlert className="text-yellow-400 shrink-0 mt-0.5" size={18} />
          <div>
            <strong>Reglas protegidas:</strong> los textos editables no pueden
            alterar los datos reales del catálogo, bloquear atención humana ni
            cancelar las políticas de rechazo. La búsqueda por rubro y zona se
            valida en SQL Server, no mediante el prompt.
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
          <div className="border border-emerald-500/40 bg-emerald-900/20 text-emerald-300 p-3 rounded-lg flex gap-2 items-center">
            <CheckCircle2 size={17} />
            {aviso}
          </div>
        )}
        {cargando && (
          <p className="text-slate-400 text-sm">Cargando configuración…</p>
        )}
        {!cargando && !!actual && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4 items-start">
            <aside className="bg-[#101c2e] border border-slate-800 rounded-xl p-3 space-y-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 px-2 py-2">
                Plantillas disponibles
              </p>
              {items.map((item) => (
                <button
                  key={item.codigo}
                  onClick={() => void cambiar(item.codigo)}
                  className={`text-left w-full rounded-lg px-3 py-3 border transition ${seleccion === item.codigo ? "bg-yellow-400/10 border-yellow-500/50 text-yellow-300" : "bg-[#0b1524] border-slate-800 text-slate-200 hover:border-slate-600"}`}
                >
                  <span className="block text-sm font-semibold">
                    {item.titulo}
                  </span>
                  <span className="block text-xs text-slate-500 mt-1 break-all">
                    {item.codigo}
                  </span>
                  <span className="block text-[11px] mt-1 opacity-75">
                    {item.version
                      ? `v${item.version} · Editado`
                      : item.origen === "LEGADO"
                        ? "Original"
                        : "Sin personalizar"}
                  </span>
                </button>
              ))}
            </aside>
            <section className="space-y-4 min-w-0">
              <div className="rounded-xl bg-[#101c2e] border border-slate-800 p-4 sm:p-5 space-y-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="font-semibold text-lg">{actual.titulo}</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      {actual.descripcion}
                    </p>
                    <p className="text-xs text-yellow-400 mt-2">
                      {tituloEstado(actual.origen)} ·{" "}
                      {actual.version
                        ? `Versión ${actual.version}`
                        : "Versión original"}
                    </p>
                  </div>
                  {modificado && (
                    <span className="rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 px-3 py-1 text-xs">
                      Cambios sin publicar
                    </span>
                  )}
                </div>
                <label
                  className="block text-sm font-medium"
                  htmlFor="prompt-editor"
                >
                  Instrucciones y redacción
                </label>
                <textarea
                  id="prompt-editor"
                  value={borrador}
                  onChange={(e) => setBorrador(e.target.value)}
                  spellCheck
                  maxLength={12000}
                  rows={13}
                  className="w-full bg-[#070e19] border border-slate-700 rounded-lg p-4 text-sm leading-6 focus:outline-none focus:border-yellow-400 resize-y font-mono text-slate-100"
                />
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-xs text-slate-500">
                    {borrador.length.toLocaleString("es-PY")} / 12.000
                    caracteres
                  </span>
                  <button
                    onClick={() => void publicar()}
                    disabled={!modificado || !borrador.trim() || guardando}
                    className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 text-black font-semibold px-5 py-2.5 disabled:opacity-40 hover:bg-yellow-300"
                  >
                    <Save size={17} />
                    {guardando ? "Publicando…" : "Publicar cambios"}
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-[#101c2e] border border-slate-800 p-4 space-y-2">
                <div className="flex gap-2 items-center font-medium">
                  <BookOpen size={17} className="text-yellow-400" /> Contexto de
                  ejemplo
                </div>
                <p className="text-sm text-slate-200">
                  {ejemplos[seleccion]?.cliente ??
                    "Consulta comercial sobre un modelo"}
                </p>
                <p className="text-xs text-slate-400">
                  {ejemplos[seleccion]?.aclaracion ??
                    "Este prompt se combina con información confirmada por el backend."}
                </p>
                <p className="text-xs text-slate-500">
                  Esta tarjeta es una referencia para editar; no genera una
                  respuesta de Ollama ni envía mensajes reales.
                </p>
              </div>
              <div className="rounded-xl bg-[#101c2e] border border-slate-800 p-4 space-y-3">
                <h3 className="font-medium flex gap-2 items-center">
                  <Clock3 size={18} className="text-yellow-400" /> Historial y
                  recuperación
                </h3>
                {historial.length === 0 && (
                  <p className="text-sm text-slate-400">
                    Todavía no hay versiones publicadas desde esta pantalla.
                  </p>
                )}
                {historial.map((h) => (
                  <div
                    key={h.id}
                    className="border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-3 flex-wrap"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        Versión {h.version} · {h.estado}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(
                          h.fechaCreacionUtc +
                            (h.fechaCreacionUtc.endsWith("Z") ? "" : "Z"),
                        ).toLocaleString("es-PY")}{" "}
                        · Usuario {h.idUsuario ?? "-"}
                      </p>
                    </div>
                    <button
                      disabled={h.estado === "PUBLICADO" || guardando}
                      onClick={() => void restaurar(h.version)}
                      className="text-xs text-yellow-300 border border-yellow-500/40 px-3 py-2 rounded-lg disabled:opacity-40 inline-flex items-center gap-2"
                    >
                      <RotateCcw size={14} /> Restaurar
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default PromptsPanambi;

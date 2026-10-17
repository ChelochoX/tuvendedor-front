import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  CircleHelp,
  Link2,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  WifiOff,
  X,
  Power,
  LogOut,
} from "lucide-react";
import Panel from "./Panel";
import {
  CanalWhatsapp,
  listarCanalesWhatsapp,
  crearCanalWhatsapp,
  obtenerQrCanalWhatsapp,
  configurarIaCanalWhatsapp,
  reiniciarCanalWhatsapp,
  configurarConexionCanalWhatsapp,
  cerrarSesionCanalWhatsapp,
} from "../../api/canalesWhatsappService";

function textoError(error: unknown): string {
  const e = error as {
    response?: { data?: { message?: string }; status?: number };
    message?: string;
  };
  if (e?.response?.status === 403)
    return "Solo un administrador de TuVendedor puede gestionar números de WhatsApp.";
  return (
    e?.response?.data?.message ||
    e?.message ||
    "No se pudo conectar con el administrador de canales."
  );
}
const claseBoton =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export default function CanalesWhatsapp() {
  const navegar = useNavigate();
  const [canales, setCanales] = useState<CanalWhatsapp[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);
  const [imagen, setImagen] = useState<string | null>(null);
  const [qrInfo, setQrInfo] = useState("Esperando el QR de WhatsApp…");
  const [qrCargando, setQrCargando] = useState(false);
  const actualizar = useCallback(async (silencioso = false) => {
    try {
      const lista = await listarCanalesWhatsapp();
      setCanales(lista);
      if (!silencioso) setError(null);
    } catch (e) {
      if (!silencioso) setError(textoError(e));
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, []);
  useEffect(() => {
    void actualizar();
  }, [actualizar]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      void actualizar(true);
    }, 12000);
    return () => window.clearInterval(timer);
  }, [actualizar]);
  const refrescarQr = useCallback(async (id: string) => {
    setQrCargando(true);
    try {
      const resultado = await obtenerQrCanalWhatsapp(id);
      setImagen(resultado.data?.imagen || null);
      setQrInfo(
        resultado.data?.listo
          ? "Este WhatsApp ya está vinculado."
          : resultado.message ||
              (resultado.data?.imagen
                ? "Escaneá el QR desde Dispositivos vinculados."
                : "Esperando el QR de WhatsApp…"),
      );
    } catch (e) {
      setImagen(null);
      setQrInfo(textoError(e));
    } finally {
      setQrCargando(false);
    }
  }, []);
  useEffect(() => {
    if (!qrId) return;
    void refrescarQr(qrId);
    const timer = window.setInterval(() => {
      void refrescarQr(qrId);
    }, 8500);
    return () => window.clearInterval(timer);
  }, [qrId, refrescarQr]);
  async function ejecutar(tarea: () => Promise<unknown>, mensaje: string) {
    setOcupado(true);
    setError(null);
    setAviso(null);
    try {
      await tarea();
      setAviso(mensaje);
      await actualizar(true);
    } catch (e) {
      setError(textoError(e));
    } finally {
      setOcupado(false);
    }
  }
  async function crear() {
    const valor = nombre.trim();
    if (valor.length < 3) {
      setError("Ingresá un nombre para el canal de al menos 3 caracteres.");
      return;
    }
    setOcupado(true);
    setError(null);
    setAviso(null);
    try {
      const nuevo = await crearCanalWhatsapp(valor);
      setNombre("");
      setAviso(
        "Canal creado con Panambí pausado. Escaneá el QR y probalo antes de habilitar respuestas.",
      );
      await actualizar(true);
      if (nuevo?.id) setQrId(nuevo.id);
    } catch (e) {
      setError(textoError(e));
    } finally {
      setOcupado(false);
    }
  }
  const conectados = canales.filter((c) => c.listo).length;
  return (
    <div className="min-h-screen bg-[#080e19] text-slate-100 md:flex">
      <aside className="w-full border-r border-white/10 bg-[#0d1524] md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:overflow-auto p-3">
        <Panel />
      </aside>
      <main className="w-full min-w-0 max-w-7xl mx-auto p-4 pb-24 md:p-8 space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <button
              onClick={() => navegar("/clientes/dashboard")}
              className="mb-3 flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300"
            >
              <ArrowLeft size={16} /> Panel de clientes
            </button>
            <div className="flex items-center gap-3">
              <span className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-amber-300">
                <MessageCircle size={26} />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Canales de WhatsApp
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Vinculá más números y atendé todo el catálogo con Panambí.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setCargando(true);
              void actualizar();
            }}
            disabled={cargando}
            className={`${claseBoton} border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10`}
          >
            <RefreshCw size={16} className={cargando ? "animate-spin" : ""} />{" "}
            Actualizar
          </button>
        </header>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#111d30] p-4">
            <span className="text-xs text-slate-400">Canales registrados</span>
            <div className="mt-2 text-3xl font-bold">{canales.length}</div>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-[#111d30] p-4">
            <span className="text-xs text-slate-400">Conectados</span>
            <div className="mt-2 text-3xl font-bold text-emerald-400">
              {conectados}
            </div>
          </div>
          <div className="col-span-2 rounded-2xl border border-amber-400/20 bg-[#111d30] p-4 sm:col-span-1">
            <span className="text-xs text-slate-400">Catálogo disponible</span>
            <div className="mt-2 text-base font-semibold text-amber-300">
              Todos los rubros
            </div>
          </div>
        </div>
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200"
          >
            {error}
          </div>
        )}
        {aviso && (
          <div
            role="status"
            className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-200"
          >
            {aviso}
          </div>
        )}
        <section className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm text-slate-300 flex items-start gap-3">
          <ShieldCheck size={22} className="shrink-0 text-amber-300" />
          <p>
            <strong className="text-amber-200">
              Todos los números se administran desde acá.
            </strong>{" "}
            El principal mantiene sus credenciales originales; los nuevos se
            crean con Panambí pausado. Cada número puede vender motos, terrenos,
            casas y otros productos, con un contexto separado por conversación.
          </p>
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          {cargando && canales.length === 0 ? (
            <div className="text-slate-400 flex items-center gap-2">
              <Loader2 className="animate-spin" /> Consultando canales…
            </div>
          ) : (
            canales.map((c) => (
              <article
                key={c.id}
                className="rounded-2xl border border-white/10 bg-[#111d30] p-5 shadow-xl shadow-black/10 space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-amber-300">
                      <Smartphone size={23} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold truncate">{c.nombre}</h2>
                      <p className="text-xs text-slate-400 break-all">
                        {c.numero ||
                          (c.principal
                            ? "Número existente"
                            : "Aún no vinculado")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${c.listo ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}
                  >
                    {c.listo
                      ? "Conectado"
                      : c.estado === "DESCONECTADO_MANUAL"
                        ? "Desconectado manualmente"
                        : c.estado === "ESPERANDO_QR"
                          ? "Escanear QR"
                          : c.estado === "SIN_ACCESO"
                            ? "Sin acceso"
                            : "Sin conectar"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {c.listo ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <WifiOff size={16} className="text-amber-400" />
                  )}
                  {c.principal
                    ? "Número principal · Sesión original protegida · Catálogo completo"
                    : "Sesión independiente · Catálogo completo"}
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b1422] px-3 py-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Bot
                      size={17}
                      className={
                        c.activo ? "text-emerald-300" : "text-slate-400"
                      }
                    />
                    {c.activo ? "Panambí activo" : "Panambí pausado"}
                  </div>
                  {!c.editable ? (
                    <span className="text-xs text-slate-500">
                      El bridge de este número todavía no está disponible para
                      administrar
                    </span>
                  ) : (
                    <button
                      disabled={ocupado || c.operativo === false || !c.listo}
                      onClick={() => {
                        if (
                          !c.activo &&
                          !window.confirm(
                            "¿Confirmás activar Panambí? Responderá automáticamente los mensajes entrantes de este número.",
                          )
                        )
                          return;
                        void ejecutar(
                          () => configurarIaCanalWhatsapp(c.id, !c.activo),
                          !c.activo
                            ? "Panambí activado en este número."
                            : "Panambí pausado. WhatsApp sigue vinculado.",
                        );
                      }}
                      className={`${claseBoton} px-3 py-1.5 text-xs ${c.activo ? "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25" : "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"}`}
                    >
                      {c.activo ? (
                        <ShieldOff size={14} />
                      ) : (
                        <ShieldCheck size={14} />
                      )}{" "}
                      {c.activo ? "Pausar IA" : "Activar IA"}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.operativo === false ? (
                    <button
                      disabled={ocupado}
                      onClick={() =>
                        void ejecutar(
                          () => configurarConexionCanalWhatsapp(c.id, true),
                          "Conectando WhatsApp. Panambí permanece pausado; si hace falta, mostrá el QR.",
                        )
                      }
                      className={`${claseBoton} bg-emerald-500/15 text-emerald-300 text-sm`}
                    >
                      <Power size={16} /> Volver a conectar
                    </button>
                  ) : (
                    <>
                      {(c.editable || c.puedeQr) && (
                        <button
                          onClick={() => {
                            setQrId(c.id);
                            setImagen(null);
                          }}
                          className={`${claseBoton} bg-amber-400 text-[#101827] hover:bg-amber-300 text-sm`}
                        >
                          <Link2 size={16} />{" "}
                          {c.listo ? "Ver vinculación" : "Mostrar QR"}
                        </button>
                      )}
                      {c.editable && (
                        <>
                          <button
                            disabled={ocupado}
                            onClick={() => {
                              if (
                                window.confirm(
                                  "¿Desconectar temporalmente este número? Se conservará la vinculación, pero dejará de recibir y responder mensajes mediante TuVendedor.",
                                )
                              )
                                void ejecutar(
                                  () =>
                                    configurarConexionCanalWhatsapp(
                                      c.id,
                                      false,
                                    ),
                                  "Número desconectado temporalmente. Podés volver a conectarlo cuando quieras.",
                                );
                            }}
                            className={`${claseBoton} border border-white/15 bg-white/5 text-slate-200 text-sm`}
                          >
                            <Power size={15} /> Desconectar
                          </button>
                          <button
                            disabled={ocupado}
                            onClick={() => {
                              if (
                                window.confirm(
                                  "¿Reiniciar esta conexión? Conservaremos la sesión de WhatsApp.",
                                )
                              )
                                void ejecutar(
                                  () => reiniciarCanalWhatsapp(c.id),
                                  "Conexión reiniciándose sin perder la vinculación.",
                                );
                            }}
                            className={`${claseBoton} border border-white/15 bg-white/5 text-slate-200 text-sm`}
                          >
                            <RefreshCw size={15} /> Reiniciar
                          </button>
                        </>
                      )}
                      {c.editable && c.listo && (
                        <button
                          disabled={ocupado}
                          onClick={() => {
                            if (
                              window.confirm(
                                `ATENCIÓN: vas a cerrar la sesión de ${c.nombre} en WhatsApp. Para volver a vincular el número necesitarás escanear un QR desde el teléfono. ¿Continuar?`,
                              )
                            ) {
                              void ejecutar(
                                () => cerrarSesionCanalWhatsapp(c.id),
                                "Se solicitó cerrar la sesión de WhatsApp. Para volver a vincularlo, necesitás escanear un QR.",
                              );
                            }
                          }}
                          className={`${claseBoton} border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 text-sm`}
                        >
                          <LogOut size={15} /> Cerrar sesión
                        </button>
                      )}
                    </>
                  )}
                  {!c.editable && !c.puedeQr && (
                    <span className="text-xs text-amber-300">
                      Bridge no disponible o no actualizado. Instalá el puente
                      principal del paquete unificado.
                    </span>
                  )}
                </div>
                {c.principal && c.editable && (
                  <p className="text-xs text-emerald-200/75">
                    Este número principal tiene los mismos controles de sesión
                    que los demás. Su autenticación actual permanece en su
                    carpeta original.
                  </p>
                )}
                {c.estado === "DESCONECTADO_MANUAL" && (
                  <p className="text-xs text-amber-200/75">
                    Sesión guardada. Para recibir nuevos mensajes en TuVendedor,
                    pulsá «Volver a conectar».
                  </p>
                )}
              </article>
            ))
          )}
        </section>
        <section className="rounded-2xl border border-white/10 bg-[#111d30] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Plus size={19} className="text-amber-300" />
            <h2 className="text-lg font-bold">Agregar otro número</h2>
          </div>
          <p className="text-sm text-slate-400">
            Asignale un nombre para identificarlo. Después podrás escanear el QR
            desde el teléfono correspondiente. Panambí estará pausado
            inicialmente.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void crear();
            }}
            className="flex flex-wrap gap-3"
          >
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. WhatsApp de ventas 2"
              maxLength={65}
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-[#080e19] px-4 py-3 text-slate-100 outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={ocupado}
              className={`${claseBoton} bg-amber-400 text-[#101827] hover:bg-amber-300`}
            >
              <Plus size={16} /> Crear canal
            </button>
          </form>
        </section>
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <CircleHelp size={16} /> Vinculación mediante WhatsApp Web
          (integración no oficial). Su disponibilidad depende de WhatsApp y
          puede requerir volver a escanear QR.
        </p>
      </main>
      {qrId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setQrId(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Vincular WhatsApp"
            className="w-full max-w-md rounded-3xl border border-amber-400/20 bg-[#111d30] p-5 shadow-2xl space-y-4"
          >
            <div className="flex justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Vincular WhatsApp</h2>
                <p className="text-xs text-slate-400 mt-1">
                  {canales.find((c) => c.id === qrId)?.nombre || "Canal"}
                </p>
              </div>
              <button
                onClick={() => setQrId(null)}
                className="rounded-lg p-2 hover:bg-white/10"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="rounded-2xl bg-white p-3 min-h-[250px] flex items-center justify-center">
              {imagen ? (
                <img
                  src={imagen}
                  alt="Código QR real de WhatsApp para vincular este dispositivo"
                  className="w-full max-w-[300px] aspect-square object-contain"
                />
              ) : (
                <div className="text-center text-slate-700 p-7">
                  {qrCargando ? (
                    <Loader2 className="mx-auto animate-spin mb-3" size={36} />
                  ) : (
                    <Smartphone size={36} className="mx-auto mb-3" />
                  )}
                  {qrInfo}
                </div>
              )}
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-300">
              <li>Abrí WhatsApp en el otro celular.</li>
              <li>
                Entrá a <strong>Dispositivos vinculados</strong>.
              </li>
              <li>
                Tocá <strong>Vincular dispositivo</strong> y escaneá este QR.
              </li>
            </ol>
            <button
              onClick={() => void refrescarQr(qrId)}
              disabled={qrCargando}
              className={`${claseBoton} w-full border border-amber-400/35 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20`}
            >
              <RefreshCw size={16} /> Actualizar QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AxiosError } from "axios";
import {
  RefreshCw,
  Settings2,
  ClipboardList,
  FlaskConical,
  Clock3,
  Send,
  CircleAlert,
  CheckCircle2,
  Ban,
  Search,
  Info,
  AlertTriangle,
  ShieldCheck,
  Power,
  CalendarDays,
  MessageSquareText,
  Play,
  X,
} from "lucide-react";
import {
  ConfiguracionSeguimiento,
  EnvioSeguimiento,
  ReglaSeguimiento,
  UnidadDemora,
  guardarConfiguracionSeguimiento,
  obtenerConfiguracionSeguimiento,
  obtenerEnviosSeguimiento,
  procesarSeguimientosAhora,
  iniciarPruebaWhatsapp,
  estadoPruebaWhatsapp,
  cancelarPruebaWhatsapp,
  EstadoPruebaWhatsapp,
} from "../../api/seguimientoWhatsappService";
import {
  obtenerDetalleInteresado,
  obtenerInteresados,
} from "../../api/clientesService";
import type {
  Interesado,
  InteresadoDetalle,
  FiltroInteresadosRequest,
} from "../../types/clientes";
import "./SeguimientoWhatsapp.css";
import BotonVolverPanel from "./components/BotonVolverPanel";

type Pestana = "config" | "cola" | "prueba";
type Aviso = { tipo: "error" | "success"; texto: string };

const fechaLocal = (valor: string | null) => (valor ? valor.slice(0, 10) : "");
const hora = (valor: string) => (valor || "08:00").slice(0, 5);
const fechaPantalla = (valor?: string | null) => {
  if (!valor) return "—";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? valor
    : fecha.toLocaleString("es-PY", { dateStyle: "short", timeStyle: "short" });
};
const nuevoPaso = (orden: number): ReglaSeguimiento => ({
  orden,
  demoraValor: 1,
  demoraUnidad: "DIA",
  activo: true,
  mensaje:
    "Hola{saludo} 😊 ¿Seguís interesado en la {moto}? Si querés, vemos esta opción u otras motos que te puedan gustar.",
});
const mensajeError = (e: unknown): string => {
  if (e instanceof AxiosError) {
    const data = e.response?.data as
      | { message?: string; Message?: string }
      | undefined;
    return data?.Message || data?.message || e.message;
  }
  return e instanceof Error ? e.message : "Ocurrió un error inesperado.";
};

const estadosComerciales = [
  ["TODOS", "Todas las etapas"],
  ["CONSULTANDO", "Consultando"],
  ["COTIZADO", "Cotizado"],
  ["SIN_RESPUESTA", "Sin respuesta"],
  ["CREDITO_EN_PROCESO", "Crédito en proceso"],
  ["CONTADO_EN_PROCESO", "Contado en proceso"],
  ["PENDIENTE_ASESOR", "Pendiente de asesor"],
  ["DERIVADO_HUMANO", "Atención humana"],
  ["ESPERANDO_MODELO", "Esperando modelo"],
  ["CONSULTA_PROMO", "Consultó promoción"],
  ["CERRADO", "Cerrado"],
  ["REGISTRADO", "Registrado"],
  ["SIN_ESTADO", "Sin etapa disponible"],
] as const;

const etapaCliente = (cliente?: Interesado | null): string => {
  if (!cliente) return "SIN_ESTADO";
  if (cliente.estadoConsulta === "CERRADO") return "CERRADO";
  if (cliente.sinRespuesta) return "SIN_RESPUESTA";
  return cliente.estadoGestion || cliente.estadoConsulta || "SIN_ESTADO";
};
const etiquetaEtapa = (estado?: string | null) =>
  estadosComerciales.find(([valor]) => valor === estado)?.[1] ||
  estado?.replaceAll("_", " ") ||
  "Sin etapa";
const claseEtapa = (etapa: string) =>
  `sw-etapa sw-etapa-${etapa.toLowerCase().replace(/[^a-z0-9_-]/g, "")}`;

const SeguimientoWhatsapp: React.FC = () => {
  const [config, setConfig] = useState<ConfiguracionSeguimiento | null>(null);
  const [envios, setEnvios] = useState<EnvioSeguimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [trabajando, setTrabajando] = useState(false);
  const [editado, setEditado] = useState(false);
  const [pestana, setPestana] = useState<Pestana>("config");
  const [filtro, setFiltro] = useState("TODOS");
  const [buscar, setBuscar] = useState("");
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<EnvioSeguimiento | null>(null);
  const [detalleCliente, setDetalleCliente] =
    useState<InteresadoDetalle | null>(null);
  const detalleSolicitudRef = useRef(0);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);
  const [crm, setCrm] = useState<Record<number, Interesado>>({});
  const [crmCargando, setCrmCargando] = useState(false);
  const [crmAviso, setCrmAviso] = useState("");
  const [filtroEtapa, setFiltroEtapa] = useState("TODOS");

  const [telefonoPrueba, setTelefonoPrueba] = useState("");
  const [consentimientoPrueba, setConsentimientoPrueba] = useState(false);
  const [idEnvioPrueba, setIdEnvioPrueba] = useState<number | null>(null);
  const [intervaloPrueba, setIntervaloPrueba] = useState(5);
  const [estadoPrueba, setEstadoPrueba] = useState<EstadoPruebaWhatsapp | null>(
    null,
  );
  const [trabajandoPrueba, setTrabajandoPrueba] = useState(false);

  const cargar = useCallback(
    async (inicial = false) => {
      if (inicial) setCargando(true);
      try {
        const [conf, cola] = await Promise.all([
          obtenerConfiguracionSeguimiento(),
          obtenerEnviosSeguimiento(),
        ]);
        if (inicial || !editado) setConfig(conf);
        setEnvios(cola);
      } catch (e) {
        setAviso({ tipo: "error", texto: mensajeError(e) });
      } finally {
        setCargando(false);
      }
    },
    [editado],
  );

  useEffect(() => {
    void cargar(true); /* carga inicial */
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Consulta los estados CRM usando el endpoint EXISTENTE y su paginación.
  // La cola sigue funcionando aunque el CRM no esté disponible.
  const cargarEtapasCrm = useCallback(async () => {
    setCrmCargando(true);
    setCrmAviso("");
    try {
      const base: FiltroInteresadosRequest = {
        nombre: "",
        estado: "",
        origen: "",
        estadoConsulta: "",
        soloSeguimiento: false,
        soloSinRespuesta: false,
        soloSeguimientoVencido: false,
        numeroPagina: 1,
        registrosPorPagina: 100,
      };
      const primerLote = await obtenerInteresados(base);
      const paginas = Math.ceil(primerLote.totalRegistros / 100);
      const maxPaginas = Math.min(10, paginas);
      const interesados = [...primerLote.items];
      for (let pagina = 2; pagina <= maxPaginas; pagina++) {
        const siguientes = await obtenerInteresados({
          ...base,
          numeroPagina: pagina,
        });
        interesados.push(...siguientes.items);
      }
      setCrm(Object.fromEntries(interesados.map((item) => [item.id, item])));
      if (paginas > maxPaginas) {
        setCrmAviso(
          `Se consultaron ${interesados.length} de ${primerLote.totalRegistros} clientes. Las etapas no cargadas aparecen como «Sin etapa disponible».`,
        );
      }
    } catch (error) {
      setCrmAviso(
        `No se pudieron consultar las etapas comerciales: ${mensajeError(error)}. La cola de envíos sigue disponible.`,
      );
    } finally {
      setCrmCargando(false);
    }
  }, []);

  useEffect(() => {
    if (pestana === "cola") void cargarEtapasCrm();
  }, [pestana, cargarEtapasCrm]);

  const abrirDetalle = async (item: EnvioSeguimiento) => {
    const solicitud = ++detalleSolicitudRef.current;
    setVistaPrevia(item);
    setDetalleCliente(null);
    setErrorDetalle(null);
    setCargandoDetalle(true);
    try {
      const resultado = await obtenerDetalleInteresado(item.idInteresado);
      if (detalleSolicitudRef.current === solicitud)
        setDetalleCliente(resultado);
    } catch (error) {
      if (detalleSolicitudRef.current === solicitud)
        setErrorDetalle(mensajeError(error));
    } finally {
      if (detalleSolicitudRef.current === solicitud) setCargandoDetalle(false);
    }
  };
  const cerrarDetalle = () => {
    detalleSolicitudRef.current++;
    setVistaPrevia(null);
    setDetalleCliente(null);
    setErrorDetalle(null);
  };

  const cambiar = <K extends keyof ConfiguracionSeguimiento>(
    clave: K,
    valor: ConfiguracionSeguimiento[K],
  ) => {
    setConfig((anterior) =>
      anterior ? { ...anterior, [clave]: valor } : anterior,
    );
    setEditado(true);
  };
  const cambiarPaso = <K extends keyof ReglaSeguimiento>(
    indice: number,
    clave: K,
    valor: ReglaSeguimiento[K],
  ) => {
    if (!config) return;
    cambiar(
      "reglas",
      config.reglas.map((paso, i) =>
        i === indice ? { ...paso, [clave]: valor } : paso,
      ),
    );
  };

  const guardar = async () => {
    if (!config || trabajando) return;
    const reglas = config.reglas.map((paso, i) => ({
      ...paso,
      orden: i + 1,
      demoraValor: Number(paso.demoraValor),
    }));
    if (
      Number(config.separacionEnviosMinutos) < 1 ||
      reglas.some((r) => r.demoraValor < 1 || !r.mensaje.trim())
    ) {
      setAviso({
        tipo: "error",
        texto:
          "Revisá la separación, los tiempos y el texto de todos los mensajes.",
      });
      return;
    }
    if (
      config.activo &&
      config.modoEnvio === "ACTIVO" &&
      !window.confirm(
        "PRODUCCIÓN REAL: al guardar con el motor encendido, Panambí puede enviar WhatsApp a clientes elegibles según las fechas programadas. ¿Confirmás?",
      )
    )
      return;
    setTrabajando(true);
    try {
      const guardada = await guardarConfiguracionSeguimiento({
        ...config,
        horaInicio: `${hora(config.horaInicio)}:00`,
        horaFin: `${hora(config.horaFin)}:00`,
        fechaDesdeElegibilidad: config.fechaDesdeElegibilidad
          ? `${fechaLocal(config.fechaDesdeElegibilidad)}T00:00:00`
          : null,
        separacionEnviosMinutos: Number(config.separacionEnviosMinutos),
        minutosReintentoTecnico: Number(config.minutosReintentoTecnico),
        maximoReintentosTecnicos: Number(config.maximoReintentosTecnicos),
        reglas,
      });
      setConfig(guardada);
      setEditado(false);
      setEnvios(await obtenerEnviosSeguimiento());
      setAviso({
        tipo: "success",
        texto: "Configuración guardada y cola actualizada correctamente.",
      });
    } catch (e) {
      setAviso({ tipo: "error", texto: mensajeError(e) });
    } finally {
      setTrabajando(false);
    }
  };

  const procesar = async () => {
    if (trabajando || !config) return;
    if (editado) {
      setAviso({
        tipo: "error",
        texto: "Guardá primero los cambios pendientes.",
      });
      return;
    }
    if (!config.activo) {
      setAviso({
        tipo: "error",
        texto:
          "Para ejecutar un ciclo manual, el motor debe estar activado y su configuración guardada.",
      });
      return;
    }
    if (
      config.modoEnvio === "ACTIVO" &&
      !window.confirm(
        "REVISIÓN MANUAL EN PRODUCCIÓN: puede enviar AHORA un WhatsApp real si existe un seguimiento vencido y elegible. No reinicia pasos ni adelanta fechas. ¿Ejecutar?",
      )
    )
      return;
    setTrabajando(true);
    try {
      const cola = await procesarSeguimientosAhora();
      setEnvios(cola);
      setPestana("cola");
      setAviso({
        tipo: "success",
        texto:
          config.modoEnvio === "SIMULACION"
            ? "Revisión realizada en simulación. No se enviaron mensajes comerciales."
            : "Revisión manual ejecutada. Consultá los estados en la cola.",
      });
    } catch (e) {
      setAviso({ tipo: "error", texto: mensajeError(e) });
    } finally {
      setTrabajando(false);
    }
  };

  const consultarPrueba = async () => {
    try {
      setEstadoPrueba(await estadoPruebaWhatsapp());
    } catch (e) {
      setAviso({ tipo: "error", texto: mensajeError(e) });
    }
  };
  const cancelarPrueba = async () => {
    try {
      setEstadoPrueba(await cancelarPruebaWhatsapp());
    } catch (e) {
      setAviso({ tipo: "error", texto: mensajeError(e) });
    }
  };
  const resumen = useMemo(
    () => ({
      total: envios.length,
      pendientes: envios.filter((x) => x.estado === "PENDIENTE").length,
      enviados: envios.filter((x) => x.estado === "ENVIADO").length,
      errores: envios.filter((x) => x.estado === "ERROR").length,
      cancelados: envios.filter((x) => x.estado === "CANCELADO").length,
    }),
    [envios],
  );
  const origenPrueba = envios.find(
    (e) =>
      e.id === idEnvioPrueba &&
      e.estado === "PENDIENTE" &&
      e.productoInteres &&
      e.mensaje,
  );
  const disponiblesPrueba = envios.filter(
    (e) => e.estado === "PENDIENTE" && e.productoInteres && e.mensaje,
  );
  const pruebaPermitida = Boolean(
    config && !config.activo && config.modoEnvio === "SIMULACION",
  );
  const iniciarPrueba = async () => {
    if (
      !origenPrueba ||
      !pruebaPermitida ||
      !window.confirm(
        `Se utilizarán datos REALES de ${origenPrueba.cliente} (${origenPrueba.productoInteres}), pero se enviarán hasta 3 mensajes SOLO al ${telefonoPrueba}. ¿Confirmás?`,
      )
    )
      return;
    setTrabajandoPrueba(true);
    try {
      setEstadoPrueba(
        await iniciarPruebaWhatsapp(
          telefonoPrueba,
          intervaloPrueba,
          origenPrueba.id,
          consentimientoPrueba,
        ),
      );
      setAviso({
        tipo: "success",
        texto: "Prueba iniciada. Consultá «Ver estado» para supervisarla.",
      });
    } catch (e) {
      setAviso({ tipo: "error", texto: mensajeError(e) });
    } finally {
      setTrabajandoPrueba(false);
    }
  };
  const visibles = useMemo(
    () =>
      envios.filter(
        (x) =>
          (filtro === "TODOS" || x.estado === filtro) &&
          (filtroEtapa === "TODOS" ||
            etapaCliente(crm[x.idInteresado]) === filtroEtapa) &&
          `${x.cliente} ${x.telefono} ${x.productoInteres || ""}`
            .toLowerCase()
            .includes(buscar.toLowerCase()),
      ),
    [envios, filtro, filtroEtapa, crm, buscar],
  );
  const estadoMotor = !config?.activo
    ? "Motor apagado"
    : config.modoEnvio === "ACTIVO"
      ? "Envíos reales activos"
      : "Simulación activa";

  return (
    <div className="sw-page">
      <header className="sw-global-header">
        <div className="sw-global-content">
          <BotonVolverPanel />
          <div>
            <span className="sw-brand">TU VENDEDOR · PANAMBÍ</span>
            <h1>Seguimientos automáticos</h1>
          </div>
        </div>
      </header>
      <main className="sw-shell">
        {aviso && (
          <div className={`sw-alert sw-${aviso.tipo}`} role="status">
            {aviso.tipo === "success" ? (
              <CheckCircle2 size={19} />
            ) : (
              <CircleAlert size={19} />
            )}
            <span>{aviso.texto}</span>
            <button
              type="button"
              onClick={() => setAviso(null)}
              aria-label="Cerrar aviso"
            >
              <X size={16} />
            </button>
          </div>
        )}
        {cargando && !config ? (
          <section className="sw-panel">Cargando configuración…</section>
        ) : !config ? (
          <section className="sw-panel">
            No se pudo cargar la configuración.{" "}
            <button
              type="button"
              className="sw-btn sw-outline"
              onClick={() => void cargar(true)}
            >
              Reintentar
            </button>
          </section>
        ) : (
          <>
            <div className="sw-head">
              <div>
                <div className="sw-eyebrow">
                  CENTRO DE OPERACIONES · WHATSAPP
                </div>
                <h2>Panel de seguimientos</h2>
                <p>
                  Gestioná oportunidades de motos, controlá los envíos y mantené
                  las pruebas separadas.
                </p>
              </div>
              <div className="sw-head-actions">
                <span
                  className={`sw-chip ${!config.activo ? "sw-off" : config.modoEnvio === "SIMULACION" ? "sw-test" : "sw-live"}`}
                >
                  <span className="sw-chip-dot" />
                  {estadoMotor}
                </span>
                <button
                  type="button"
                  className="sw-btn sw-outline"
                  disabled={trabajando || editado}
                  onClick={() => {
                    void cargar();
                    if (pestana === "cola") void cargarEtapasCrm();
                  }}
                  title={
                    editado
                      ? "Guardá o descartá tus cambios antes de actualizar"
                      : "Actualizar datos sin ejecutar envíos"
                  }
                >
                  <RefreshCw size={16} /> Actualizar datos
                </button>
              </div>
            </div>

            <div
              className="sw-stats"
              aria-label="Resumen de la cola, hasta 200 registros"
            >
              <div className="sw-stat sw-stat-total">
                <ClipboardList size={19} />
                <span>
                  Registros en cola <small>(hasta 200)</small>
                </span>
                <strong>{resumen.total}</strong>
              </div>
              <div className="sw-stat sw-stat-pending">
                <Clock3 size={19} />
                <span>Pendientes</span>
                <strong>{resumen.pendientes}</strong>
              </div>
              <div className="sw-stat sw-stat-sent">
                <Send size={19} />
                <span>Enviados</span>
                <strong>{resumen.enviados}</strong>
              </div>
              <div className="sw-stat sw-stat-cancel">
                <Ban size={19} />
                <span>Cancelados</span>
                <strong>{resumen.cancelados}</strong>
              </div>
              <div className="sw-stat sw-stat-error">
                <CircleAlert size={19} />
                <span>Errores</span>
                <strong>{resumen.errores}</strong>
              </div>
            </div>

            <nav
              className="sw-tabs"
              aria-label="Secciones de seguimiento"
              role="tablist"
            >
              <button
                id="sw-tab-config"
                type="button"
                role="tab"
                aria-selected={pestana === "config"}
                aria-controls="sw-tab-content"
                className={pestana === "config" ? "active" : ""}
                onClick={() => setPestana("config")}
              >
                <Settings2 size={18} /> Configuración
              </button>
              <button
                id="sw-tab-cola"
                type="button"
                role="tab"
                aria-selected={pestana === "cola"}
                aria-controls="sw-tab-content"
                className={pestana === "cola" ? "active" : ""}
                onClick={() => setPestana("cola")}
              >
                <ClipboardList size={18} /> Cola y auditoría{" "}
                <span>{resumen.total}</span>
              </button>
              <button
                id="sw-tab-prueba"
                type="button"
                role="tab"
                aria-selected={pestana === "prueba"}
                aria-controls="sw-tab-content"
                className={pestana === "prueba" ? "active" : ""}
                onClick={() => setPestana("prueba")}
              >
                <FlaskConical size={18} /> Prueba controlada
              </button>
            </nav>

            <div
              id="sw-tab-content"
              role="tabpanel"
              aria-labelledby={`sw-tab-${pestana}`}
            >
              {pestana === "config" && (
                <>
                  <section className="sw-panel sw-config-panel">
                    <div className="sw-section-header">
                      <div className="sw-section-heading">
                        <span className="sw-icon-block sw-icon-blue">
                          <Settings2 size={20} />
                        </span>
                        <div>
                          <h3>Control general</h3>
                          <p>Estado del motor, horarios y límites de envío.</p>
                        </div>
                      </div>
                    </div>
                    <div className="sw-operation-grid">
                      <div
                        className={`sw-engine-card ${config.activo ? "on" : ""}`}
                      >
                        <div className="sw-engine-card-top">
                          <Power size={22} />
                          <span>ESTADO DEL MOTOR</span>
                        </div>
                        <strong>{estadoMotor}</strong>
                        <p>
                          {config.activo
                            ? "Panambí procesa automáticamente las consultas elegibles."
                            : "No se ejecutan ciclos automáticos de seguimiento."}
                        </p>
                        <label className="sw-switch-row">
                          <span>{config.activo ? "Encendido" : "Apagado"}</span>
                          <input
                            aria-label="Motor activo"
                            type="checkbox"
                            checked={config.activo}
                            onChange={(e) =>
                              cambiar("activo", e.target.checked)
                            }
                          />
                          <span
                            className="sw-switch-track"
                            aria-hidden="true"
                          />
                        </label>
                      </div>
                      <div className="sw-settings-grid">
                        <label className="sw-field sw-field-wide">
                          Modo de envío
                          <select
                            value={config.modoEnvio}
                            onChange={(e) =>
                              cambiar(
                                "modoEnvio",
                                e.target.value as "SIMULACION" | "ACTIVO",
                              )
                            }
                          >
                            <option value="SIMULACION">
                              Simulación (sin enviar)
                            </option>
                            <option value="ACTIVO">
                              Producción (envía WhatsApp)
                            </option>
                          </select>
                        </label>
                        <label className="sw-field">
                          Desde (horario)
                          <input
                            type="time"
                            value={hora(config.horaInicio)}
                            onChange={(e) =>
                              cambiar("horaInicio", e.target.value)
                            }
                          />
                        </label>
                        <label className="sw-field">
                          Hasta (horario)
                          <input
                            type="time"
                            value={hora(config.horaFin)}
                            onChange={(e) => cambiar("horaFin", e.target.value)}
                          />
                        </label>
                        <label className="sw-field sw-field-wide">
                          <span>
                            Conversaciones desde <CalendarDays size={14} />
                          </span>
                          <input
                            type="date"
                            value={fechaLocal(config.fechaDesdeElegibilidad)}
                            onChange={(e) =>
                              cambiar(
                                "fechaDesdeElegibilidad",
                                e.target.value
                                  ? `${e.target.value}T00:00:00`
                                  : null,
                              )
                            }
                          />
                        </label>
                        <label className="sw-field">
                          Separación entre envíos (min)
                          <input
                            type="number"
                            min="1"
                            max="1440"
                            value={config.separacionEnviosMinutos}
                            onChange={(e) =>
                              cambiar(
                                "separacionEnviosMinutos",
                                Number(e.target.value),
                              )
                            }
                          />
                        </label>
                        <label className="sw-field">
                          Reintento técnico (min)
                          <input
                            type="number"
                            min="1"
                            max="1440"
                            value={config.minutosReintentoTecnico}
                            onChange={(e) =>
                              cambiar(
                                "minutosReintentoTecnico",
                                Number(e.target.value),
                              )
                            }
                          />
                        </label>
                        <label className="sw-field">
                          Máximo de reintentos
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={config.maximoReintentosTecnicos}
                            onChange={(e) =>
                              cambiar(
                                "maximoReintentosTecnicos",
                                Number(e.target.value),
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                    <div
                      className={`sw-context-note ${config.activo && config.modoEnvio === "ACTIVO" ? "sw-note-warning" : ""}`}
                    >
                      <Info size={17} />
                      <span>
                        {config.activo && config.modoEnvio === "ACTIVO"
                          ? "Producción encendida: un seguimiento vencido y elegible puede enviarse automáticamente. Para detener envíos nuevos, apagá el motor y guardá."
                          : "La separación entre envíos es entre clientes; la frecuencia para volver a contactar a una persona se define en los pasos de abajo."}
                      </span>
                    </div>
                  </section>

                  <section className="sw-panel sw-rules-panel">
                    <div className="sw-section-header">
                      <div className="sw-section-heading">
                        <span className="sw-icon-block sw-icon-purple">
                          <MessageSquareText size={21} />
                        </span>
                        <div>
                          <h3>Mensajes y tiempos</h3>
                          <p>
                            Secuencia automática. Variables disponibles:{" "}
                            <code>{"{saludo}"}</code> y <code>{"{moto}"}</code>.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="sw-btn sw-outline"
                        onClick={() =>
                          cambiar("reglas", [
                            ...config.reglas,
                            nuevoPaso(config.reglas.length + 1),
                          ])
                        }
                      >
                        + Agregar paso
                      </button>
                    </div>
                    <div className="sw-rules">
                      {config.reglas.map((paso, indice) => (
                        <div className="sw-rule" key={paso.id || indice}>
                          <div className="sw-rule-top">
                            <div>
                              <span className="sw-rule-index">
                                {indice + 1}
                              </span>
                              <strong>Seguimiento {indice + 1}</strong>
                            </div>
                            <label className="sw-toggle">
                              <input
                                type="checkbox"
                                checked={paso.activo}
                                onChange={(e) =>
                                  cambiarPaso(
                                    indice,
                                    "activo",
                                    e.target.checked,
                                  )
                                }
                              />{" "}
                              Activo
                            </label>
                          </div>
                          <div className="sw-rule-fields">
                            <label className="sw-field">
                              Esperar
                              <input
                                type="number"
                                min="1"
                                value={paso.demoraValor}
                                onChange={(e) =>
                                  cambiarPaso(
                                    indice,
                                    "demoraValor",
                                    Number(e.target.value),
                                  )
                                }
                              />
                            </label>
                            <label className="sw-field">
                              Unidad
                              <select
                                value={paso.demoraUnidad}
                                onChange={(e) =>
                                  cambiarPaso(
                                    indice,
                                    "demoraUnidad",
                                    e.target.value as UnidadDemora,
                                  )
                                }
                              >
                                <option value="MINUTO">Minutos</option>
                                <option value="HORA">Horas</option>
                                <option value="DIA">Días</option>
                              </select>
                            </label>
                          </div>
                          <label className="sw-field sw-message-label">
                            Texto del mensaje
                            <textarea
                              rows={4}
                              maxLength={1000}
                              value={paso.mensaje}
                              onChange={(e) =>
                                cambiarPaso(indice, "mensaje", e.target.value)
                              }
                            />
                          </label>
                          <div className="sw-rule-footer">
                            <small>
                              {indice === 0
                                ? "Desde la última consulta del cliente."
                                : "Después del seguimiento anterior."}
                            </small>
                            <button
                              type="button"
                              className="sw-link sw-danger-text"
                              disabled={config.reglas.length < 2}
                              onClick={() =>
                                cambiar(
                                  "reglas",
                                  config.reglas.filter((_, i) => i !== indice),
                                )
                              }
                            >
                              Eliminar paso
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  <div className="sw-action-bar">
                    <div className="sw-save-status">
                      {editado ? (
                        <>
                          <CircleAlert size={17} /> Tenés cambios sin guardar.
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={17} /> Configuración sincronizada
                          con el backend.
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      className="sw-btn sw-primary"
                      disabled={trabajando || !editado}
                      onClick={() => void guardar()}
                    >
                      {trabajando ? "Guardando…" : "Guardar configuración"}
                    </button>
                  </div>
                </>
              )}

              {pestana === "cola" && (
                <section className="sw-panel sw-queue-panel">
                  <div className="sw-section-header sw-queue-header">
                    <div className="sw-section-heading">
                      <span className="sw-icon-block sw-icon-teal">
                        <ClipboardList size={21} />
                      </span>
                      <div>
                        <h3>Cola y auditoría</h3>
                        <p>
                          Historial de hasta 200 mensajes. Cada fila identifica
                          el seguimiento y su estado.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="sw-btn sw-manual"
                      disabled={trabajando || editado || !config.activo}
                      onClick={() => void procesar()}
                    >
                      <Play size={15} />
                      {trabajando ? "Procesando…" : "Ejecutar revisión manual"}
                    </button>
                  </div>
                  <div
                    className={`sw-context-note ${config.activo && config.modoEnvio === "ACTIVO" ? "sw-note-warning" : ""}`}
                  >
                    <AlertTriangle size={17} />
                    <span>
                      El motor activo revisa automáticamente la cola. No
                      necesitás ejecutar la revisión manual.{" "}
                      {config.activo && config.modoEnvio === "ACTIVO"
                        ? "En producción, este botón puede enviar un WhatsApp real si hay un pendiente vencido y elegible."
                        : "En simulación no se envían mensajes comerciales."}
                    </span>
                  </div>
                  <div className="sw-filter-intro">
                    <strong>Dos estados diferentes</strong>
                    <span>
                      El estado del envío identifica qué hizo WhatsApp; la etapa
                      comercial muestra cómo quedó registrada la conversación en
                      el CRM.
                    </span>
                  </div>
                  <div className="sw-filters">
                    <label className="sw-search">
                      <Search size={18} />
                      <input
                        aria-label="Buscar cliente, teléfono o moto"
                        placeholder="Buscar cliente, teléfono o moto…"
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                      />
                    </label>
                    <label className="sw-filter-select">
                      <span>Estado del envío</span>
                      <select
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                      >
                        {[
                          "TODOS",
                          "PENDIENTE",
                          "PROCESANDO",
                          "ENVIADO",
                          "ERROR",
                          "CANCELADO",
                        ].map((x) => (
                          <option key={x} value={x}>
                            {x === "TODOS" ? "Todos los envíos" : x}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="sw-filter-select">
                      <span>Etapa comercial (CRM)</span>
                      <select
                        value={filtroEtapa}
                        onChange={(e) => setFiltroEtapa(e.target.value)}
                      >
                        {estadosComerciales.map(([valor, etiqueta]) => (
                          <option key={valor} value={valor}>
                            {etiqueta}
                          </option>
                        ))}
                      </select>
                    </label>
                    <span className="sw-filter-count">
                      {crmCargando
                        ? "Leyendo CRM…"
                        : `Mostrando ${visibles.length} de ${envios.length}`}
                    </span>
                  </div>
                  {crmAviso && (
                    <div className="sw-crm-aviso" role="status">
                      <Info size={15} />
                      {crmAviso}
                    </div>
                  )}
                  <div className="sw-table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Cliente / moto</th>
                          <th>Paso</th>
                          <th>Programado</th>
                          <th>Estado del envío</th>
                          <th>Etapa del cliente</th>
                          <th>Historial</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibles.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <b>{item.cliente || "Sin nombre"}</b>
                              <small>
                                {item.telefono} ·{" "}
                                {item.productoInteres || "Moto sin especificar"}
                              </small>
                            </td>
                            <td>
                              <span className="sw-step-pill">
                                #{item.numeroSeguimiento}
                              </span>
                            </td>
                            <td>{fechaPantalla(item.programadoPara)}</td>
                            <td>
                              <span
                                className={`sw-status sw-status-${item.estado.toLowerCase()}`}
                              >
                                {item.estado}
                              </span>
                            </td>
                            <td>
                              <span
                                className={claseEtapa(
                                  etapaCliente(crm[item.idInteresado]),
                                )}
                              >
                                {etiquetaEtapa(
                                  etapaCliente(crm[item.idInteresado]),
                                )}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="sw-link"
                                onClick={() => void abrirDetalle(item)}
                              >
                                Ver conversación
                              </button>
                            </td>
                          </tr>
                        ))}
                        {visibles.length === 0 && (
                          <tr>
                            <td colSpan={6} className="sw-empty">
                              No hay registros con estos filtros.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {pestana === "prueba" && (
                <section className="sw-panel sw-test-panel">
                  <div className="sw-section-header">
                    <div className="sw-section-heading">
                      <span className="sw-icon-block sw-icon-violet">
                        <FlaskConical size={21} />
                      </span>
                      <div>
                        <h3>Prueba controlada</h3>
                        <p>
                          Seleccioná una conversación real como origen. Los
                          mensajes se envían únicamente al número autorizado de
                          prueba.
                        </p>
                      </div>
                    </div>
                    <span className="sw-lab-tag">ENTORNO DE PRUEBAS</span>
                  </div>
                  <div
                    className={`sw-context-note ${pruebaPermitida ? "sw-note-success" : "sw-note-warning"}`}
                  >
                    {pruebaPermitida ? (
                      <ShieldCheck size={19} />
                    ) : (
                      <AlertTriangle size={19} />
                    )}
                    <span>
                      {pruebaPermitida
                        ? "Listo para pruebas: motor apagado y modo Simulación. La prueba no cambia los datos comerciales del cliente de origen."
                        : "Para iniciar una prueba controlada, apagá el motor y guardá el modo Simulación en la pestaña Configuración."}
                    </span>
                  </div>
                  <div className="sw-test-fields">
                    <label className="sw-field">
                      Número destinatario (595… sin +)
                      <input
                        inputMode="tel"
                        value={telefonoPrueba}
                        onChange={(e) =>
                          setTelefonoPrueba(e.target.value.trim())
                        }
                        placeholder="5959XXXXXXXX"
                      />
                    </label>
                    <label className="sw-field">
                      Conversación real de origen
                      <select
                        value={idEnvioPrueba ?? ""}
                        onChange={(e) =>
                          setIdEnvioPrueba(
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                      >
                        <option value="">
                          Seleccionar seguimiento PENDIENTE…
                        </option>
                        {disponiblesPrueba.map((e) => (
                          <option key={e.id} value={e.id}>
                            #{e.id} · {e.cliente} · {e.productoInteres} · paso{" "}
                            {e.numeroSeguimiento}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="sw-field">
                      Intervalo entre mensajes
                      <select
                        value={intervaloPrueba}
                        onChange={(e) =>
                          setIntervaloPrueba(Number(e.target.value))
                        }
                      >
                        <option value={1}>1 minuto</option>
                        <option value={5}>5 minutos</option>
                        <option value={10}>10 minutos</option>
                      </select>
                    </label>
                  </div>
                  <label className="sw-confirm">
                    <input
                      type="checkbox"
                      checked={consentimientoPrueba}
                      onChange={(e) =>
                        setConsentimientoPrueba(e.target.checked)
                      }
                    />
                    Confirmo que controlo este número o que su titular autorizó
                    recibir los mensajes de prueba.
                  </label>
                  <div className="sw-test-summary">
                    <div>
                      <span>CONVERSACIÓN DE ORIGEN</span>
                      <strong>
                        {origenPrueba
                          ? `${origenPrueba.cliente} · ${origenPrueba.productoInteres}`
                          : "Sin seleccionar"}
                      </strong>
                    </div>
                    <div>
                      <span>ESTADO DE LA PRUEBA</span>
                      <strong>
                        {estadoPrueba?.estado ?? "Sin consultar"} ·{" "}
                        {estadoPrueba?.enviados ?? 0}/{estadoPrueba?.total ?? 0}
                      </strong>
                      <small>
                        {estadoPrueba?.detalle || ""}{" "}
                        {estadoPrueba?.proximo
                          ? `· Próximo: ${fechaPantalla(estadoPrueba.proximo)}`
                          : ""}
                      </small>
                    </div>
                  </div>
                  <div className="sw-test-actions">
                    <div className="sw-test-footnote">
                      <Info size={15} /> El estado de la prueba es temporal
                      (memoria del backend).
                    </div>
                    <div className="sw-action-buttons">
                      <button
                        type="button"
                        className="sw-btn sw-outline"
                        onClick={() => void consultarPrueba()}
                      >
                        <RefreshCw size={15} /> Ver estado
                      </button>
                      <button
                        type="button"
                        className="sw-btn sw-danger-outline"
                        onClick={() => void cancelarPrueba()}
                      >
                        <X size={15} /> Cancelar prueba
                      </button>
                      <button
                        type="button"
                        className="sw-btn sw-test-send"
                        disabled={
                          trabajandoPrueba ||
                          !/^5959\d{8}$/.test(telefonoPrueba) ||
                          !origenPrueba ||
                          !consentimientoPrueba ||
                          !pruebaPermitida
                        }
                        onClick={() => void iniciarPrueba()}
                      >
                        <Send size={16} />
                        {trabajandoPrueba
                          ? "Iniciando…"
                          : "Enviar secuencia de prueba"}
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {vistaPrevia && (
              <div className="sw-modal-backdrop" onClick={cerrarDetalle}>
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Conversación y seguimiento del cliente"
                  className="sw-modal sw-modal-wide"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sw-modal-header">
                    <div>
                      <span className="sw-modal-kicker">
                        Auditoría de Panambí
                      </span>
                      <strong>
                        Seguimiento #{vistaPrevia.numeroSeguimiento} ·{" "}
                        {vistaPrevia.cliente}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={cerrarDetalle}
                      aria-label="Cerrar"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="sw-modal-meta">
                    <span>
                      {vistaPrevia.productoInteres || "Moto sin especificar"}
                    </span>
                    <span
                      className={`sw-status sw-status-${vistaPrevia.estado.toLowerCase()}`}
                    >
                      {vistaPrevia.estado}
                    </span>
                    <span>
                      Programado: {fechaPantalla(vistaPrevia.programadoPara)}
                    </span>
                    {vistaPrevia.fechaEnvio && (
                      <span>
                        Enviado: {fechaPantalla(vistaPrevia.fechaEnvio)}
                      </span>
                    )}
                  </div>
                  <div className="sw-detail-section">
                    <h4>Mensaje del seguimiento</h4>
                    <div className="sw-message-preview">
                      {vistaPrevia.mensaje}
                    </div>
                  </div>
                  {vistaPrevia.ultimoError && (
                    <div className="sw-modal-note">
                      <strong>Error técnico:</strong> {vistaPrevia.ultimoError}
                    </div>
                  )}
                  {vistaPrevia.motivoCancelacion && (
                    <div className="sw-modal-note">
                      <strong>Motivo de cancelación:</strong>{" "}
                      {vistaPrevia.motivoCancelacion}
                    </div>
                  )}
                  <div className="sw-detail-section">
                    <h4>Estado comercial y conversación registrada</h4>
                    {cargandoDetalle ? (
                      <div className="sw-detail-loading">
                        <RefreshCw size={16} className="sw-rotate" />{" "}
                        Consultando historial del cliente…
                      </div>
                    ) : errorDetalle ? (
                      <div className="sw-modal-note">
                        No se pudo cargar el historial: {errorDetalle}
                      </div>
                    ) : detalleCliente ? (
                      <>
                        <div className="sw-detail-grid">
                          <div>
                            <span>Etapa comercial</span>
                            <strong>
                              <span
                                className={claseEtapa(
                                  etapaCliente(detalleCliente.interesado),
                                )}
                              >
                                {etiquetaEtapa(
                                  etapaCliente(detalleCliente.interesado),
                                )}
                              </span>
                            </strong>
                          </div>
                          <div>
                            <span>Seguimiento CRM</span>
                            <strong>
                              {detalleCliente.interesado.requiereSeguimiento
                                ? "Habilitado"
                                : "Sin seguimiento activo"}
                            </strong>
                          </div>
                          <div>
                            <span>Próximo contacto</span>
                            <strong>
                              {fechaPantalla(
                                detalleCliente.interesado.fechaProximoContacto,
                              )}
                            </strong>
                          </div>
                          <div>
                            <span>Motivo registrado</span>
                            <strong>
                              {detalleCliente.interesado.motivoSeguimiento ||
                                "No especificado"}
                            </strong>
                          </div>
                        </div>
                        <div className="sw-conversation-head">
                          Últimos mensajes guardados en el CRM
                        </div>
                        <div className="sw-conversation-list">
                          {(detalleCliente.ultimosMensajes || []).length ? (
                            detalleCliente.ultimosMensajes.map(
                              (mensaje, indice) => (
                                <div
                                  key={`${mensaje.fecha}-${indice}`}
                                  className={`sw-conversation-message ${mensaje.emisor?.toUpperCase() === "CLIENTE" ? "from-client" : "from-panambi"}`}
                                >
                                  <div>
                                    <strong>
                                      {mensaje.emisor?.toUpperCase() ===
                                      "CLIENTE"
                                        ? "Cliente"
                                        : "Panambí / Sistema"}
                                    </strong>
                                    <time>{fechaPantalla(mensaje.fecha)}</time>
                                  </div>
                                  <div className="sw-conversation-text">
                                    {mensaje.mensaje}
                                  </div>
                                </div>
                              ),
                            )
                          ) : (
                            <div className="sw-detail-empty">
                              Este contacto no tiene mensajes disponibles en el
                              detalle del CRM.
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="sw-detail-empty">
                        No se recibió el detalle del CRM.
                      </div>
                    )}
                  </div>
                  <div className="sw-detail-footer">
                    <span>
                      Vista de solo lectura. No modifica el estado ni envía
                      WhatsApp.
                    </span>
                    <button
                      type="button"
                      className="sw-btn sw-primary"
                      onClick={cerrarDetalle}
                    >
                      Cerrar detalle
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SeguimientoWhatsapp;

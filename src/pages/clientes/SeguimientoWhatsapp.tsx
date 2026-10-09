import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { ArrowLeft, RefreshCw, Settings2, ClipboardList } from "lucide-react";
import {
  ConfiguracionSeguimiento, EnvioSeguimiento, ReglaSeguimiento, UnidadDemora,
  guardarConfiguracionSeguimiento, obtenerConfiguracionSeguimiento,
  obtenerEnviosSeguimiento, procesarSeguimientosAhora,
} from "../../api/seguimientoWhatsappService";
import "./SeguimientoWhatsapp.css";

const fechaLocal = (valor: string | null) => valor ? valor.slice(0, 10) : "";
const hora = (valor: string) => (valor || "08:00").slice(0, 5);
const fechaPantalla = (valor: string) => {
  if (!valor) return "—";
  const d = new Date(valor);
  return isNaN(d.getTime()) ? valor : d.toLocaleString("es-PY", { dateStyle: "short", timeStyle: "short" });
};
const nuevoPaso = (orden: number): ReglaSeguimiento => ({
  orden, demoraValor: 1, demoraUnidad: "DIA", activo: true,
  mensaje: "Hola{saludo} 😊 ¿Seguís interesado en la {moto}? Si querés, vemos esta opción u otras motos que te puedan gustar.",
});
const mensajeError = (e: unknown) => {
  if (e instanceof AxiosError) return (e.response?.data as { message?: string } | undefined)?.message || e.message;
  return e instanceof Error ? e.message : "Ocurrió un error inesperado.";
};

const SeguimientoWhatsapp: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<ConfiguracionSeguimiento | null>(null);
  const [envios, setEnvios] = useState<EnvioSeguimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [trabajando, setTrabajando] = useState(false);
  const [editado, setEditado] = useState(false);
  const [pestana, setPestana] = useState<"config" | "cola">("config");
  const [filtro, setFiltro] = useState("TODOS");
  const [buscar, setBuscar] = useState("");
  const [aviso, setAviso] = useState<{ tipo: "error" | "success"; texto: string } | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<EnvioSeguimiento | null>(null);

  const cargar = useCallback(async (inicial = false) => {
    if (inicial) setCargando(true);
    try {
      const [conf, cola] = await Promise.all([obtenerConfiguracionSeguimiento(), obtenerEnviosSeguimiento()]);
      if (inicial || !editado) setConfig(conf);
      setEnvios(cola);
    } catch (e) { setAviso({ tipo: "error", texto: mensajeError(e) }); }
    finally { setCargando(false); }
  }, [editado]);
  useEffect(() => { void cargar(true); /* carga inicial */ }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cambiar = <K extends keyof ConfiguracionSeguimiento>(clave: K, valor: ConfiguracionSeguimiento[K]) => {
    setConfig(c => c ? { ...c, [clave]: valor } : c);
    setEditado(true);
  };
  const cambiarPaso = <K extends keyof ReglaSeguimiento>(indice: number, clave: K, valor: ReglaSeguimiento[K]) => {
    if (!config) return;
    cambiar("reglas", config.reglas.map((paso, n) => n === indice ? { ...paso, [clave]: valor } : paso));
  };
  const guardar = async () => {
    if (!config || trabajando) return;
    const reglas = config.reglas.map((paso, i) => ({ ...paso, orden: i + 1, demoraValor: Number(paso.demoraValor) }));
    if (Number(config.separacionEnviosMinutos) < 1 || reglas.some(r => r.demoraValor < 1 || !r.mensaje.trim())) {
      setAviso({ tipo: "error", texto: "Revisá la separación, los tiempos y el texto de todos los mensajes." }); return;
    }
    if (config.activo && config.modoEnvio === "REAL" && !window.confirm("ATENCIÓN: vas a activar envíos reales por WhatsApp. ¿Confirmás?")) return;
    setTrabajando(true);
    try {
      const guardada = await guardarConfiguracionSeguimiento({ ...config,
        horaInicio: `${hora(config.horaInicio)}:00`, horaFin: `${hora(config.horaFin)}:00`,
        fechaDesdeElegibilidad: config.fechaDesdeElegibilidad ? `${fechaLocal(config.fechaDesdeElegibilidad)}T00:00:00` : null,
        separacionEnviosMinutos: Number(config.separacionEnviosMinutos),
        minutosReintentoTecnico: Number(config.minutosReintentoTecnico),
        maximoReintentosTecnicos: Number(config.maximoReintentosTecnicos), reglas,
      });
      setConfig(guardada); setEditado(false);
      setAviso({ tipo: "success", texto: "Configuración guardada correctamente." });
    } catch (e) { setAviso({ tipo: "error", texto: mensajeError(e) }); }
    finally { setTrabajando(false); }
  };
  const procesar = async () => {
    if (trabajando || !config) return;
    if (editado) { setAviso({ tipo: "error", texto: "Guardá primero los cambios pendientes." }); return; }
    if (!config.activo) { setAviso({ tipo: "error", texto: "Activá el motor y guardá los cambios para procesar." }); return; }
    if (config.modoEnvio === "REAL" && !window.confirm("MODO REAL: se pueden enviar WhatsApp a clientes. ¿Ejecutar ahora?")) return;
    setTrabajando(true);
    try {
      const cola = await procesarSeguimientosAhora();setEnvios(cola);setPestana("cola");
      setAviso({ tipo: "success", texto: config.modoEnvio === "SIMULACION" ? "Ciclo procesado en simulación. No se enviaron mensajes." : "Ciclo ejecutado. Revisá la cola." });
    } catch (e) { setAviso({ tipo: "error", texto: mensajeError(e) }); }
    finally { setTrabajando(false); }
  };
  const resumen = useMemo(() => ({ total: envios.length, pendientes: envios.filter(x => x.estado === "PENDIENTE").length,
    enviados: envios.filter(x => x.estado === "ENVIADO").length, errores: envios.filter(x => x.estado === "ERROR").length }), [envios]);
  const visibles = useMemo(() => envios.filter(x => (filtro === "TODOS" || x.estado === filtro) &&
    `${x.cliente} ${x.telefono} ${x.productoInteres || ""}`.toLowerCase().includes(buscar.toLowerCase())), [envios, filtro, buscar]);

  return <div className="min-h-screen bg-gray-950 text-white">
    <header className="border-b border-gray-800 bg-gray-950 px-4 py-4">
      <div className="mx-auto max-w-[1700px] flex items-center gap-3">
        <button title="Volver a interesados" onClick={() => navigate("/clientes/cargar")} className="rounded-lg border border-gray-700 p-2 hover:border-yellow-400"><ArrowLeft size={18}/></button>
        <div><div className="text-xs font-bold tracking-widest text-yellow-400">GESTIÓN DE CLIENTES · PANAMBÍ</div>
          <h1 className="text-xl font-bold">Seguimientos automáticos de WhatsApp</h1></div>
      </div>
    </header>
    <div className="sw-shell">
      {aviso && <div className={`sw-alert sw-${aviso.tipo}`} role="status">{aviso.texto}<button onClick={() => setAviso(null)} aria-label="Cerrar">×</button></div>}
      {cargando && !config ? <div className="sw-panel">Cargando configuración…</div> : !config ?
        <div className="sw-panel">No se pudo cargar la configuración. <button className="sw-btn sw-outline" onClick={() => void cargar(true)}>Reintentar</button></div> : <>
        <div className="sw-head"><div><div className="sw-eyebrow">TU VENDEDOR</div><h1>Panel de seguimientos</h1>
          <p>Contactá con respeto a quienes consultaron por una moto y no continuaron.</p></div>
          <div className="sw-head-actions"><span className={`sw-chip ${config.modoEnvio === "SIMULACION" ? "sw-test" : "sw-live"}`}>
            {config.modoEnvio === "SIMULACION" ? "Simulación · sin envíos" : "Modo REAL"}</span>
            <button className="sw-btn sw-outline" disabled={trabajando || editado} onClick={() => void cargar()}><RefreshCw size={14} className="inline"/> Actualizar</button></div></div>
        <div className="sw-stats"><div><span>Registros en cola (hasta 200)</span><strong>{resumen.total}</strong></div><div><span>Pendientes</span><strong>{resumen.pendientes}</strong></div>
          <div><span>Enviados</span><strong>{resumen.enviados}</strong></div><div><span>Errores</span><strong>{resumen.errores}</strong></div></div>
        <nav className="sw-tabs"><button className={pestana === "config" ? "active" : ""} onClick={() => setPestana("config")}><Settings2 size={15} className="inline"/> Configuración</button>
          <button className={pestana === "cola" ? "active" : ""} onClick={() => setPestana("cola")}><ClipboardList size={15} className="inline"/> Cola y auditoría ({resumen.total})</button></nav>
        {pestana === "config" ? <>
          <section className="sw-panel"><div className="sw-section-header"><div><h2>Control general</h2><p>Probá con simulación antes de activar mensajes reales.</p></div>
            <label className="sw-toggle"><input type="checkbox" checked={config.activo} onChange={e => cambiar("activo", e.target.checked)}/>{config.activo ? "Motor activo" : "Motor apagado"}</label></div>
            <div className="sw-form-grid">
              <label>Modo de envío<select value={config.modoEnvio} onChange={e => cambiar("modoEnvio", e.target.value as "SIMULACION" | "REAL")}><option value="SIMULACION">Simulación (sin enviar)</option><option value="REAL">Real (envía WhatsApp)</option></select></label>
              <label>Separación entre clientes (minutos)<input type="number" min="1" value={config.separacionEnviosMinutos} onChange={e => cambiar("separacionEnviosMinutos", Number(e.target.value))}/></label>
              <label>Horario desde<input type="time" value={hora(config.horaInicio)} onChange={e => cambiar("horaInicio", e.target.value)}/></label>
              <label>Horario hasta<input type="time" value={hora(config.horaFin)} onChange={e => cambiar("horaFin", e.target.value)}/></label>
              <label>Considerar conversaciones desde<input type="date" value={fechaLocal(config.fechaDesdeElegibilidad)} onChange={e => cambiar("fechaDesdeElegibilidad", e.target.value ? `${e.target.value}T00:00:00` : null)}/></label>
              <label>Reintento técnico (minutos)<input type="number" min="1" value={config.minutosReintentoTecnico} onChange={e => cambiar("minutosReintentoTecnico", Number(e.target.value))}/></label>
              <label>Máximo de reintentos<input type="number" min="1" value={config.maximoReintentosTecnicos} onChange={e => cambiar("maximoReintentosTecnicos", Number(e.target.value))}/></label>
            </div><p className="sw-hint">La separación entre clientes NO es la frecuencia para insistirle a una misma persona. Mantené SIMULACIÓN durante las pruebas.</p></section>
          <section className="sw-panel"><div className="sw-section-header"><div><h2>Mensajes y tiempos</h2><p>Variables disponibles: <code>{"{saludo}"}</code> y <code>{"{moto}"}</code>.</p></div>
            <button className="sw-btn sw-outline" onClick={() => cambiar("reglas", [...config.reglas, nuevoPaso(config.reglas.length + 1)])}>+ Agregar paso</button></div>
            <div className="sw-rules">{config.reglas.map((paso, indice) => <div className="sw-rule" key={paso.id || indice}>
              <div className="sw-rule-top"><strong>Seguimiento {indice + 1}</strong><label className="sw-toggle"><input type="checkbox" checked={paso.activo} onChange={e => cambiarPaso(indice, "activo", e.target.checked)}/> Activo</label></div>
              <div className="sw-rule-fields"><label>Esperar<input type="number" min="1" value={paso.demoraValor} onChange={e => cambiarPaso(indice, "demoraValor", Number(e.target.value))}/></label>
                <label>Unidad<select value={paso.demoraUnidad} onChange={e => cambiarPaso(indice, "demoraUnidad", e.target.value as UnidadDemora)}><option value="MINUTO">Minutos</option><option value="HORA">Horas</option><option value="DIA">Días</option></select></label></div>
              <label className="sw-message-label">Mensaje<textarea rows={4} value={paso.mensaje} onChange={e => cambiarPaso(indice, "mensaje", e.target.value)}/></label>
              <div className="sw-rule-footer"><small>Se aplicará a los clientes elegibles.</small><button className="sw-link sw-danger-text" disabled={config.reglas.length < 2} onClick={() => cambiar("reglas", config.reglas.filter((_, i) => i !== indice))}>Eliminar paso</button></div>
            </div>)}</div></section>
          <div className="sw-bottom"><span>{editado ? "Tenés cambios sin guardar." : "Configuración sincronizada con el backend."}</span><div>
            <button className="sw-btn sw-outline" disabled={trabajando || editado || !config.activo} onClick={() => void procesar()}>Procesar ahora</button>
            <button className="sw-btn sw-primary" disabled={trabajando || !editado} onClick={() => void guardar()}>{trabajando ? "Procesando…" : "Guardar configuración"}</button>
          </div></div>
        </> : <section className="sw-panel"><div className="sw-section-header"><div><h2>Cola de mensajes</h2><p>Historial de mensajes programados y sus resultados.</p></div>
          <button className="sw-btn sw-primary" disabled={trabajando || editado || !config.activo} onClick={() => void procesar()}>Procesar ahora</button></div>
          <div className="sw-filters"><input placeholder="Buscar cliente, teléfono o moto" value={buscar} onChange={e => setBuscar(e.target.value)}/>
            <select value={filtro} onChange={e => setFiltro(e.target.value)}>{["TODOS","PENDIENTE","PROCESANDO","ENVIADO","ERROR","CANCELADO"].map(x => <option key={x} value={x}>{x}</option>)}</select></div>
          <div className="sw-table-scroll"><table><thead><tr><th>Cliente / moto</th><th>Paso</th><th>Programado</th><th>Estado</th><th>Detalle</th></tr></thead><tbody>
            {visibles.map(item => <tr key={item.id}><td><b>{item.cliente || "Sin nombre"}</b><small>{item.telefono} · {item.productoInteres || "Moto sin especificar"}</small></td><td>#{item.numeroSeguimiento}</td><td>{fechaPantalla(item.programadoPara)}</td><td><span className={`sw-status sw-status-${item.estado.toLowerCase()}`}>{item.estado}</span></td>
              <td><button className="sw-link" onClick={() => setVistaPrevia(item)}>Ver mensaje</button></td></tr>)}
            {visibles.length === 0 && <tr><td colSpan={5} className="sw-empty">No hay registros para mostrar.</td></tr>}
          </tbody></table></div></section>}
        {vistaPrevia && <div className="sw-modal-backdrop" onClick={() => setVistaPrevia(null)}><div role="dialog" aria-modal="true" aria-label="Detalle del mensaje" className="sw-modal" onClick={e => e.stopPropagation()}>
          <div><strong>Detalle del mensaje</strong><button onClick={() => setVistaPrevia(null)} aria-label="Cerrar">×</button></div><p>{vistaPrevia.mensaje}

Estado: {vistaPrevia.estado}{vistaPrevia.ultimoError ? `\nError: ${vistaPrevia.ultimoError}` : ""}{vistaPrevia.motivoCancelacion ? `\nCancelación: ${vistaPrevia.motivoCancelacion}` : ""}</p>
          <button className="sw-btn sw-primary" onClick={() => setVistaPrevia(null)}>Cerrar</button></div></div>}
      </>}
    </div>
  </div>;
};
export default SeguimientoWhatsapp;

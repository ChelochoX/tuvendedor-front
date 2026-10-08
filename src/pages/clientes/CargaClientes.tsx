// src/pages/clientes/CargaClientes.tsx

import React, { useCallback, useEffect, useState } from "react";

import {
  ArrowLeft,
  CloudDownload,
  ClockAlert,
  MessageSquareOff,
  RefreshCw,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import ListarInteresados from "./ListarInteresados";
import FormularioInteresado from "./FormularioInteresado";

import {
  obtenerMensajeErrorClientes,
  obtenerResumenInteresados,
  sincronizarWhatsAppDia,
} from "../../api/clientesService";

import {
  Interesado,
  InteresadosResumen,
  Seguimiento,
} from "../../types/clientes";

const resumenVacio: InteresadosResumen = {
  totalActivos: 0,
  nuevosDelDia: 0,
  interaccionesDelDia: 0,
  pendientesSeguimiento: 0,
  seguimientosVencidos: 0,
  sinRespuesta: 0,
  consultando: 0,
  cotizados: 0,
  creditoEnProceso: 0,
  contadoEnProceso: 0,
  derivadosHumano: 0,
};

const fechaApiHoy = () => {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
};

const CargaClientes: React.FC = () => {
  const navigate = useNavigate();

  const [seleccionado, setSeleccionado] = useState<Interesado | null>(null);

  const [recargarLista, setRecargarLista] = useState(false);

  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);

  const [resumen, setResumen] = useState<InteresadosResumen>(resumenVacio);

  const [cargandoResumen, setCargandoResumen] = useState(false);

  const [sincronizandoWhatsApp, setSincronizandoWhatsApp] = useState(false);

  const [fechaSincronizacion, setFechaSincronizacion] = useState(fechaApiHoy());

  const cargarResumen = useCallback(async () => {
    setCargandoResumen(true);

    try {
      const data = await obtenerResumenInteresados(fechaApiHoy());

      setResumen(data);
    } catch (error) {
      console.warn(
        obtenerMensajeErrorClientes(
          error,
          "No se pudo cargar el resumen de interesados.",
        ),
      );
    } finally {
      setCargandoResumen(false);
    }
  }, []);

  useEffect(() => {
    void cargarResumen();

    const timer = window.setInterval(() => {
      void cargarResumen();
    }, 30_000);

    return () => window.clearInterval(timer);
  }, [cargarResumen]);

  useEffect(() => {
    if (!recargarLista) {
      return;
    }

    void cargarResumen();
  }, [recargarLista, cargarResumen]);

  const sincronizarWhatsApp = async () => {
    if (sincronizandoWhatsApp) {
      return;
    }

    setSincronizandoWhatsApp(true);

    Swal.fire({
      title: "Sincronizando WhatsApp",
      text: "Estamos leyendo los chats de hoy y actualizando el CRM sin duplicar clientes.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const resultado = await sincronizarWhatsAppDia(fechaSincronizacion);

      setSeleccionado(null);
      setRecargarLista(true);

      await cargarResumen();

      await Swal.fire({
        icon: resultado.errores > 0 ? "warning" : "success",
        title: "WhatsApp sincronizado",
        html: `
          <div style="text-align:left;line-height:1.7">
            <b>Chats encontrados:</b> ${resultado.chatsEncontrados}<br/>
            <b>Nuevos:</b> ${resultado.nuevos}<br/>
            <b>Actualizados:</b> ${resultado.actualizados}<br/>
            <b>Con teléfono real:</b> ${resultado.conTelefonoReal}<br/>
            <b>Sin teléfono resuelto:</b> ${resultado.sinTelefonoReal}<br/>
            <b>Errores:</b> ${resultado.errores}
          </div>
        `,
      });
    } catch (error) {
      await Swal.fire(
        "No se pudo sincronizar",
        obtenerMensajeErrorClientes(error, "No se pudo sincronizar WhatsApp."),
        "error",
      );
    } finally {
      setSincronizandoWhatsApp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-950/95 sticky top-0 z-30 backdrop-blur">
        <div className="max-w-[1700px] mx-auto px-4 py-4">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => navigate("/clientes/dashboard")}
                className="mt-1 h-9 w-9 rounded-lg border border-gray-700 grid place-items-center text-yellow-300 hover:border-yellow-400"
                title="Volver a solicitudes"
              >
                <ArrowLeft size={17} />
              </button>

              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-yellow-400/80">
                  Gestión de clientes
                </div>

                <h1 className="text-xl md:text-2xl font-bold mt-0.5">
                  Interesados y seguimiento comercial
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Clientes cargados manualmente y contactos registrados
                  automáticamente desde Panambí/WhatsApp.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fechaSincronizacion}
                  max={fechaApiHoy()}
                  onChange={(event) =>
                    setFechaSincronizacion(event.target.value)
                  }
                  className="h-10 rounded-lg border border-gray-700 bg-gray-900 px-3 text-sm text-gray-200 focus:outline-none focus:border-emerald-400"
                  title="Fecha de chats a sincronizar"
                />

                <button
                  type="button"
                  onClick={() => void sincronizarWhatsApp()}
                  disabled={sincronizandoWhatsApp || !fechaSincronizacion}
                  className="px-3 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-sm inline-flex items-center justify-center gap-2 hover:border-emerald-400 disabled:opacity-50"
                  title="Trae los chats de la fecha seleccionada y actualiza los interesados sin duplicarlos"
                >
                  <CloudDownload
                    size={16}
                    className={sincronizandoWhatsApp ? "animate-pulse" : ""}
                  />
                  {sincronizandoWhatsApp
                    ? "Sincronizando..."
                    : "Sincronizar WhatsApp"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRecargarLista(true);
                  void cargarResumen();
                }}
                disabled={cargandoResumen}
                className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-sm inline-flex items-center justify-center gap-2 hover:border-yellow-400 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={cargandoResumen ? "animate-spin" : ""}
                />
                Actualizar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mt-4">
            <MiniResumen
              label="Activos"
              value={resumen.totalActivos}
              icon={<UsersRound size={17} />}
              className="text-sky-300"
            />

            <MiniResumen
              label="Consultas hoy"
              value={resumen.interaccionesDelDia}
              icon={<UserRoundCheck size={17} />}
              className="text-emerald-300"
            />

            <MiniResumen
              label="Seguimientos"
              value={resumen.pendientesSeguimiento}
              icon={<ClockAlert size={17} />}
              className="text-yellow-300"
            />

            <MiniResumen
              label="Vencidos"
              value={resumen.seguimientosVencidos}
              icon={<ClockAlert size={17} />}
              className="text-orange-300"
            />

            <MiniResumen
              label="Sin respuesta"
              value={resumen.sinRespuesta}
              icon={<MessageSquareOff size={17} />}
              className="text-red-300 col-span-2 lg:col-span-1"
            />
          </div>
        </div>
      </header>

      <div className="max-w-[1700px] mx-auto min-h-[calc(100vh-190px)] flex flex-col xl:flex-row">
        <ListarInteresados
          seleccionado={seleccionado}
          setSeleccionado={setSeleccionado}
          recargarLista={recargarLista}
          setRecargarLista={setRecargarLista}
        />

        <FormularioInteresado
          seleccionado={seleccionado}
          setSeleccionado={setSeleccionado}
          setRecargarLista={setRecargarLista}
          seguimientos={seguimientos}
          setSeguimientos={setSeguimientos}
        />
      </div>
    </div>
  );
};

const MiniResumen: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
}> = ({ label, value, icon, className = "" }) => (
  <div className="rounded-xl border border-gray-800 bg-gray-900 px-3 py-2.5">
    <div className={`flex items-center gap-2 ${className}`}>
      {icon}
      <span className="text-xs font-semibold">{label}</span>
    </div>

    <div className="text-xl font-black mt-1">{value}</div>
  </div>
);

export default CargaClientes;

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Swal from "sweetalert2";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import DescriptionIcon from "@mui/icons-material/Description";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import HistoryIcon from "@mui/icons-material/History";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import Panel from "./Panel";

import {
  cambiarEstadoSolicitudCreditoMoto,
  listarSolicitudesCreditoMoto,
  obtenerDocumentoCreditoMoto,
  obtenerMensajeError,
  obtenerSolicitudCreditoMoto,
} from "../../api/creditoMotoGestionService";

import {
  cambiarEstadoSolicitudContadoMoto,
  contactarSolicitudContadoMoto,
  listarSolicitudesContadoMoto,
  obtenerDocumentoContadoMoto,
  obtenerMensajeErrorContado,
  obtenerSolicitudContadoMoto,
} from "../../api/contadoMotoGestionService";

import {
  CreditoMotoGestionDetalle,
  CreditoMotoGestionLista,
} from "../../types/creditoMotoGestion";

import {
  ContadoMotoGestionDetalle,
  ContadoMotoGestionLista,
} from "../../types/contadoMotoGestion";

type TipoFiltro = "TODAS" | "CONTADO" | "CREDITO";

type VentaFila =
  | {
      tipo: "CONTADO";
      data: ContadoMotoGestionLista;
    }
  | {
      tipo: "CREDITO";
      data: CreditoMotoGestionLista;
    };

type DetalleSeleccionado =
  | {
      tipo: "CONTADO";
      data: ContadoMotoGestionDetalle;
    }
  | {
      tipo: "CREDITO";
      data: CreditoMotoGestionDetalle;
    }
  | null;

const obtenerInicioHoy = () => {
  const fecha = new Date();
  fecha.setHours(0, 0, 0, 0);
  return fecha;
};

const formatearFechaApi = (fecha: Date) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const esHoy = (fecha: Date) => {
  const hoy = obtenerInicioHoy();

  return (
    fecha.getFullYear() === hoy.getFullYear() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getDate() === hoy.getDate()
  );
};

const formatearFechaSelector = (fecha: Date) => {
  const corta = fecha.toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (esHoy(fecha)) {
    return `HOY · ${corta}`;
  }

  const dia = fecha
    .toLocaleDateString("es-PY", { weekday: "long" })
    .toUpperCase();

  return `${dia} · ${corta}`;
};

const formatearFecha = (fecha?: string | null) => {
  if (!fecha) {
    return "—";
  }

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "—";
  }

  return valor.toLocaleString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const campo = (valor?: string | number | null) =>
  valor === null || valor === undefined || valor === "" ? "—" : String(valor);

const estadoCreditoLabel = (estado?: string | null) => {
  switch (estado) {
    case "PENDIENTE_ENVIO":
      return "Pendiente de envío";
    case "ENVIADA_EMPRESA":
      return "Enviada a la empresa";
    default:
      return estado || "Sin estado";
  }
};

const estadoContadoLabel = (estado?: string | null) => {
  switch (estado) {
    case "PENDIENTE_CONTACTO":
      return "Contactar ahora";
    case "CONTACTADO":
      return "Contactado";
    case "CONCRETADA":
      return "Concretada";
    case "NO_CONCRETADA":
      return "No concretada";
    default:
      return estado || "Sin estado";
  }
};

const estadoClass = (tipo: "CONTADO" | "CREDITO", estado?: string | null) => {
  if (tipo === "CONTADO") {
    switch (estado) {
      case "PENDIENTE_CONTACTO":
        return "border-orange-400/40 bg-orange-400/10 text-orange-300";
      case "CONTACTADO":
        return "border-sky-400/40 bg-sky-400/10 text-sky-300";
      case "CONCRETADA":
        return "border-emerald-400/40 bg-emerald-400/10 text-emerald-300";
      case "NO_CONCRETADA":
        return "border-red-400/40 bg-red-400/10 text-red-300";
      default:
        return "border-gray-500/40 bg-gray-500/10 text-gray-300";
    }
  }

  switch (estado) {
    case "PENDIENTE_ENVIO":
      return "border-yellow-400/40 bg-yellow-400/10 text-yellow-300";
    case "ENVIADA_EMPRESA":
      return "border-emerald-400/40 bg-emerald-400/10 text-emerald-300";
    default:
      return "border-gray-500/40 bg-gray-500/10 text-gray-300";
  }
};

const sonarAlerta = () => {
  try {
    const AudioContextCtor =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextCtor) {
      return;
    }

    const ctx = new AudioContextCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = 880;
    gain.gain.value = 0.08;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.18);

    window.setTimeout(() => {
      void ctx.close();
    }, 400);
  } catch {
    // Algunos navegadores bloquean audio automático.
  }
};

const Dashboard: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>("TODAS");
  const [buscar, setBuscar] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(() =>
    obtenerInicioHoy(),
  );

  const [creditos, setCreditos] = useState<CreditoMotoGestionLista[]>([]);
  const [contados, setContados] = useState<ContadoMotoGestionLista[]>([]);

  const [cargando, setCargando] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [procesandoAccion, setProcesandoAccion] = useState(false);

  const [detalle, setDetalle] = useState<DetalleSeleccionado>(null);
  const [nuevaUrgente, setNuevaUrgente] = useState(false);

  const pendientesContadoAnterior = useRef<number | null>(null);

  const cargarSolicitudes = useCallback(
    async (silencioso = false) => {
      if (!silencioso) {
        setCargando(true);
      }

      try {
        const fecha = formatearFechaApi(fechaSeleccionada);

        const [dataCredito, dataContado] = await Promise.all([
          listarSolicitudesCreditoMoto(
            "TODOS",
            busquedaAplicada || undefined,
            fecha,
          ),
          listarSolicitudesContadoMoto(
            "TODOS",
            busquedaAplicada || undefined,
            fecha,
          ),
        ]);

        setCreditos(dataCredito);
        setContados(dataContado);

        const pendientesActuales = dataContado.filter(
          (item) => item.estadoControl === "PENDIENTE_CONTACTO",
        ).length;

        if (
          esHoy(fechaSeleccionada) &&
          pendientesContadoAnterior.current !== null &&
          pendientesActuales > pendientesContadoAnterior.current
        ) {
          setNuevaUrgente(true);
          sonarAlerta();
          document.title = `🔥 Nueva venta al contado · TuVendedor`;
        }

        pendientesContadoAnterior.current = pendientesActuales;
      } catch (error) {
        if (!silencioso) {
          const mensajeCredito = obtenerMensajeError(error);
          const mensajeContado = obtenerMensajeErrorContado(error);

          Swal.fire("Error", mensajeCredito || mensajeContado, "error");
        }
      } finally {
        if (!silencioso) {
          setCargando(false);
        }
      }
    },
    [busquedaAplicada, fechaSeleccionada],
  );

  useEffect(() => {
    pendientesContadoAnterior.current = null;
    void cargarSolicitudes();
  }, [cargarSolicitudes]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void cargarSolicitudes(true);
    }, 10_000);

    return () => window.clearInterval(timer);
  }, [cargarSolicitudes]);

  useEffect(() => {
    return () => {
      document.title = "TuVendedor Marketplace";
    };
  }, []);

  const filas = useMemo<VentaFila[]>(() => {
    const resultado: VentaFila[] = [];

    contados.forEach((item) => {
      resultado.push({ tipo: "CONTADO", data: item });
    });

    creditos.forEach((item) => {
      resultado.push({ tipo: "CREDITO", data: item });
    });

    const prioridad = (fila: VentaFila) => {
      if (
        fila.tipo === "CONTADO" &&
        fila.data.estadoControl === "PENDIENTE_CONTACTO"
      ) {
        return 0;
      }

      if (fila.tipo === "CONTADO" && fila.data.estadoControl === "CONTACTADO") {
        return 1;
      }

      if (
        fila.tipo === "CREDITO" &&
        fila.data.estadoControl === "PENDIENTE_ENVIO"
      ) {
        return 2;
      }

      return 3;
    };

    resultado.sort((a, b) => {
      const orden = prioridad(a) - prioridad(b);

      if (orden !== 0) {
        return orden;
      }

      return (
        new Date(b.data.fechaRecepcion).getTime() -
        new Date(a.data.fechaRecepcion).getTime()
      );
    });

    return resultado;
  }, [contados, creditos]);

  const filasFiltradas = useMemo(() => {
    if (tipoFiltro === "TODAS") {
      return filas;
    }

    return filas.filter((item) => item.tipo === tipoFiltro);
  }, [filas, tipoFiltro]);

  const resumen = useMemo(
    () => ({
      contadoPendiente: contados.filter(
        (x) => x.estadoControl === "PENDIENTE_CONTACTO",
      ).length,
      contadoContactado: contados.filter(
        (x) => x.estadoControl === "CONTACTADO",
      ).length,
      creditoPendiente: creditos.filter(
        (x) => x.estadoControl === "PENDIENTE_ENVIO",
      ).length,
      creditoEnviado: creditos.filter(
        (x) => x.estadoControl === "ENVIADA_EMPRESA",
      ).length,
    }),
    [contados, creditos],
  );

  const moverFecha = (dias: number) => {
    setFechaSeleccionada((actual) => {
      const nueva = new Date(actual);
      nueva.setDate(nueva.getDate() + dias);
      nueva.setHours(0, 0, 0, 0);

      if (nueva > obtenerInicioHoy()) {
        return actual;
      }

      return nueva;
    });

    setNuevaUrgente(false);
    document.title = "TuVendedor Marketplace";
  };

  const abrirDetalle = async (fila: VentaFila) => {
    setCargandoDetalle(true);
    setDetalle(null);

    try {
      if (fila.tipo === "CONTADO") {
        const data = await obtenerSolicitudContadoMoto(
          fila.data.idSolicitudContado,
        );
        setDetalle({ tipo: "CONTADO", data });
      } else {
        const data = await obtenerSolicitudCreditoMoto(
          fila.data.idSolicitudCredito,
        );
        setDetalle({ tipo: "CREDITO", data });
      }
    } catch (error) {
      Swal.fire("Error", obtenerMensajeError(error), "error");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const ejecutarBusqueda = (event?: React.FormEvent) => {
    event?.preventDefault();
    setBusquedaAplicada(buscar.trim());
  };

  const contactarContado = async () => {
    if (!detalle || detalle.tipo !== "CONTADO") {
      return;
    }

    const confirmacion = await Swal.fire({
      icon: "question",
      title: "¿Tomar esta oportunidad?",
      text: "La conversación ya está en modo humano. Esta acción dejará registrada la gestión como CONTACTADA.",
      showCancelButton: true,
      confirmButtonText: "Sí, contactar ahora",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f97316",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    setProcesandoAccion(true);

    try {
      const actualizada = await contactarSolicitudContadoMoto(
        detalle.data.idSolicitudContado,
      );

      setDetalle({ tipo: "CONTADO", data: actualizada });
      setNuevaUrgente(false);
      document.title = "TuVendedor Marketplace";
      await cargarSolicitudes(true);

      Swal.fire({
        icon: "success",
        title: "Oportunidad tomada",
        text: "La venta quedó como CONTACTADA y Panambí permanece en pausa.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire(
        "No se pudo actualizar",
        obtenerMensajeErrorContado(error),
        "error",
      );
    } finally {
      setProcesandoAccion(false);
    }
  };

  const concretarContado = async () => {
    if (!detalle || detalle.tipo !== "CONTADO") {
      return;
    }

    const resultado = await Swal.fire({
      icon: "question",
      title: "Marcar compra como concretada",
      input: "textarea",
      inputLabel: "Observación (opcional)",
      inputPlaceholder: "Ej.: Cliente confirmó la compra y coordina entrega.",
      showCancelButton: true,
      confirmButtonText: "Sí, concretada",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#16a34a",
    });

    if (!resultado.isConfirmed) {
      return;
    }

    setProcesandoAccion(true);

    try {
      const actualizada = await cambiarEstadoSolicitudContadoMoto(
        detalle.data.idSolicitudContado,
        {
          estado: "CONCRETADA",
          observacion:
            resultado.value?.trim() || "Cliente contactado. Compra confirmada.",
        },
      );

      setDetalle({ tipo: "CONTADO", data: actualizada });
      await cargarSolicitudes(true);

      Swal.fire({
        icon: "success",
        title: "Venta concretada",
        text: "La gestión quedó cerrada y la conversación vuelve a Panambí.",
        timer: 1900,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire(
        "No se pudo actualizar",
        obtenerMensajeErrorContado(error),
        "error",
      );
    } finally {
      setProcesandoAccion(false);
    }
  };

  const noConcretarContado = async () => {
    if (!detalle || detalle.tipo !== "CONTADO") {
      return;
    }

    const resultado = await Swal.fire({
      icon: "warning",
      title: "Cerrar como no concretada",
      input: "textarea",
      inputLabel: "Motivo obligatorio",
      inputPlaceholder:
        "Ej.: Cliente decidió esperar, no respondió, cambió de modelo...",
      inputAttributes: { maxlength: "500" },
      showCancelButton: true,
      confirmButtonText: "Cerrar gestión",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      preConfirm: (value) => {
        if (!value?.trim()) {
          Swal.showValidationMessage("Ingresá el motivo.");
          return false;
        }

        return value.trim();
      },
    });

    if (!resultado.isConfirmed || !resultado.value) {
      return;
    }

    setProcesandoAccion(true);

    try {
      const actualizada = await cambiarEstadoSolicitudContadoMoto(
        detalle.data.idSolicitudContado,
        {
          estado: "NO_CONCRETADA",
          observacion: String(resultado.value),
        },
      );

      setDetalle({ tipo: "CONTADO", data: actualizada });
      await cargarSolicitudes(true);

      Swal.fire({
        icon: "success",
        title: "Gestión cerrada",
        text: "La conversación vuelve a quedar disponible para Panambí.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire(
        "No se pudo actualizar",
        obtenerMensajeErrorContado(error),
        "error",
      );
    } finally {
      setProcesandoAccion(false);
    }
  };

  const marcarCreditoEnviado = async () => {
    if (!detalle || detalle.tipo !== "CREDITO") {
      return;
    }

    const resultado = await Swal.fire({
      icon: "question",
      title: "¿Marcar como enviada?",
      text: "Confirmá cuando la solicitud y sus documentos fueron enviados a la empresa para evaluación real del crédito.",
      input: "textarea",
      inputLabel: "Observación (opcional)",
      inputPlaceholder:
        "Ej.: Documentación enviada por WhatsApp al Departamento de Créditos.",
      showCancelButton: true,
      confirmButtonText: "Sí, marcar como enviada",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#16a34a",
    });

    if (!resultado.isConfirmed) {
      return;
    }

    setProcesandoAccion(true);

    try {
      const actualizada = await cambiarEstadoSolicitudCreditoMoto(
        detalle.data.idSolicitudCredito,
        {
          estado: "ENVIADA_EMPRESA",
          observacion:
            resultado.value?.trim() ||
            "Solicitud enviada a la empresa para evaluación de crédito.",
        },
      );

      setDetalle({ tipo: "CREDITO", data: actualizada });
      await cargarSolicitudes(true);

      Swal.fire({
        icon: "success",
        title: "Solicitud enviada",
        text: "La solicitud quedó registrada como enviada a la empresa.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("No se pudo actualizar", obtenerMensajeError(error), "error");
    } finally {
      setProcesandoAccion(false);
    }
  };

  const abrirDocumento = async (idDocumento: number) => {
    if (!detalle) {
      return;
    }

    try {
      const blob =
        detalle.tipo === "CONTADO"
          ? await obtenerDocumentoContadoMoto(
              detalle.data.idSolicitudContado,
              idDocumento,
            )
          : await obtenerDocumentoCreditoMoto(
              detalle.data.idSolicitudCredito,
              idDocumento,
            );

      const url = URL.createObjectURL(blob);
      const ventana = window.open(url, "_blank", "noopener,noreferrer");

      if (!ventana) {
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        enlace.click();
      }

      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      Swal.fire("Error", obtenerMensajeError(error), "error");
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white relative">
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-gray-900 border-r border-yellow-400 p-4 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 z-40`}
      >
        <div className="flex items-center justify-between md:hidden mb-4">
          <h2 className="text-yellow-400 font-bold text-lg">Menú</h2>
          <button
            onClick={() => setMenuOpen(false)}
            className="bg-yellow-400 text-black rounded p-1"
          >
            <CloseIcon />
          </button>
        </div>
        <Panel />
      </aside>

      {!menuOpen && (
        <button
          className="absolute top-4 left-4 md:hidden z-30 bg-yellow-400 text-black rounded p-1 shadow-md"
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon />
        </button>
      )}

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 md:hidden z-30"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0 overflow-auto p-4 md:p-6 mt-14 md:mt-0">
        <div className="max-w-[1500px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400/80 mb-1">
                Gestión de clientes
              </p>
              <h1 className="text-2xl md:text-3xl font-bold">
                Solicitudes de venta
              </h1>
              <p className="text-gray-400 mt-2 max-w-3xl">
                Visualizá las compras al contado y solicitudes de crédito
                recibidas por Panambí. Las ventas al contado pendientes aparecen
                primero para que el vendedor pueda actuar de inmediato.
              </p>
            </div>

            <button
              onClick={() => void cargarSolicitudes()}
              disabled={cargando}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 bg-gray-900 hover:border-yellow-400 hover:text-yellow-300 transition disabled:opacity-50"
            >
              <RefreshIcon fontSize="small" />
              Actualizar
            </button>
          </div>

          <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => moverFecha(-1)}
              className="h-10 w-10 rounded-lg border border-gray-700 bg-gray-900 text-yellow-300 grid place-items-center hover:border-yellow-400 transition"
            >
              <ChevronLeftIcon />
            </button>

            <div className="min-w-[220px] h-10 px-4 rounded-lg border border-yellow-400/40 bg-gray-900 flex items-center justify-center font-bold text-yellow-300">
              {formatearFechaSelector(fechaSeleccionada)}
            </div>

            <button
              type="button"
              onClick={() => moverFecha(1)}
              disabled={esHoy(fechaSeleccionada)}
              className="h-10 w-10 rounded-lg border border-gray-700 bg-gray-900 text-yellow-300 grid place-items-center hover:border-yellow-400 transition disabled:opacity-30"
            >
              <ChevronRightIcon />
            </button>
          </div>

          {nuevaUrgente && (
            <div className="mb-5 rounded-xl border border-orange-400/40 bg-orange-400/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="font-bold text-orange-300 flex items-center gap-2">
                  <LocalFireDepartmentIcon fontSize="small" />
                  Nueva compra al contado pendiente
                </div>
                <p className="text-sm text-gray-300 mt-1">
                  Hay una oportunidad nueva esperando contacto del vendedor.
                </p>
              </div>
              <button
                onClick={() => {
                  setTipoFiltro("CONTADO");
                  setNuevaUrgente(false);
                  document.title = "TuVendedor Marketplace";
                }}
                className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-bold"
              >
                Ver ahora
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-5">
            <ResumenCard
              label="Contado urgente"
              value={resumen.contadoPendiente}
              icon={<LocalFireDepartmentIcon />}
              className="text-orange-300"
            />
            <ResumenCard
              label="Contado contactado"
              value={resumen.contadoContactado}
              icon={<PhoneInTalkIcon />}
              className="text-sky-300"
            />
            <ResumenCard
              label="Crédito pendiente"
              value={resumen.creditoPendiente}
              icon={<CreditCardIcon />}
              className="text-yellow-300"
            />
            <ResumenCard
              label="Crédito enviado"
              value={resumen.creditoEnviado}
              icon={<SendIcon />}
              className="text-emerald-300"
            />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-3 border-b border-gray-800 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {(["TODAS", "CONTADO", "CREDITO"] as TipoFiltro[]).map(
                  (tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setTipoFiltro(tipo)}
                      className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${
                        tipoFiltro === tipo
                          ? "bg-yellow-400 border-yellow-400 text-black"
                          : "border-gray-700 text-gray-300 hover:border-yellow-400"
                      }`}
                    >
                      {tipo === "TODAS"
                        ? "Todas"
                        : tipo === "CONTADO"
                          ? "🔥 Contado"
                          : "Crédito"}
                    </button>
                  ),
                )}
              </div>

              <form
                onSubmit={ejecutarBusqueda}
                className="flex w-full xl:w-auto"
              >
                <div className="relative flex-1 xl:w-80">
                  <SearchIcon
                    fontSize="small"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                    placeholder="Nombre, CI, teléfono, marca o modelo..."
                    className="w-full bg-gray-950 border border-gray-700 rounded-l-lg py-2.5 pl-10 pr-3 outline-none text-sm focus:border-yellow-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 rounded-r-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300"
                >
                  Buscar
                </button>
              </form>
            </div>

            {cargando ? (
              <div className="py-20 text-center text-gray-500">
                Cargando solicitudes...
              </div>
            ) : filasFiltradas.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                No encontramos solicitudes para esta fecha.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gray-950/70 text-xs text-gray-400">
                    <tr>
                      <th className="text-left px-4 py-3">Tipo</th>
                      <th className="text-left px-4 py-3">Cliente</th>
                      <th className="text-left px-4 py-3">Moto</th>
                      <th className="text-left px-4 py-3">Contacto</th>
                      <th className="text-left px-4 py-3">Gestión</th>
                      <th className="text-left px-4 py-3">Recepción</th>
                      <th className="text-right px-4 py-3">Acción</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-800">
                    {filasFiltradas.map((fila) => {
                      const data = fila.data;
                      const estado = data.estadoControl;
                      const esUrgente =
                        fila.tipo === "CONTADO" &&
                        estado === "PENDIENTE_CONTACTO";

                      return (
                        <tr
                          key={`${fila.tipo}-${
                            fila.tipo === "CONTADO"
                              ? fila.data.idSolicitudContado
                              : fila.data.idSolicitudCredito
                          }`}
                          className={`transition ${
                            esUrgente
                              ? "bg-orange-500/5 hover:bg-orange-500/10"
                              : "hover:bg-gray-800/40"
                          }`}
                        >
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
                                fila.tipo === "CONTADO"
                                  ? "border-orange-400/40 bg-orange-400/10 text-orange-300"
                                  : "border-sky-400/40 bg-sky-400/10 text-sky-300"
                              }`}
                            >
                              {fila.tipo === "CONTADO" && (
                                <LocalFireDepartmentIcon
                                  sx={{ fontSize: 15 }}
                                />
                              )}
                              {fila.tipo}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="font-semibold">
                              {campo(data.nombreCompleto)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              CI {campo(data.cedula)}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="font-semibold">
                              {campo(data.marca)} {campo(data.modelo)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {campo(data.codigoReferencia)}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm">
                            {campo(data.telefono)}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${estadoClass(
                                fila.tipo,
                                estado,
                              )}`}
                            >
                              {fila.tipo === "CONTADO"
                                ? estadoContadoLabel(estado)
                                : estadoCreditoLabel(estado)}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-300">
                            {formatearFecha(data.fechaRecepcion)}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => void abrirDetalle(fila)}
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition ${
                                esUrgente
                                  ? "border-orange-400/50 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20"
                                  : "border-gray-700 hover:border-yellow-400 hover:text-yellow-300"
                              }`}
                            >
                              <VisibilityIcon fontSize="small" />
                              {esUrgente ? "Contactar" : "Revisar"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {(detalle || cargandoDetalle) && (
        <div className="fixed inset-0 z-[80] bg-black/70 flex justify-end">
          <div className="w-full max-w-2xl h-full bg-gray-950 border-l border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-yellow-400/80">
                  {detalle?.tipo === "CONTADO"
                    ? "Venta al contado"
                    : detalle?.tipo === "CREDITO"
                      ? "Solicitud de crédito"
                      : "Solicitud"}
                </p>
                <h2 className="text-xl font-bold mt-1">
                  {detalle ? campo(detalle.data.nombreCompleto) : "Cargando..."}
                </h2>
              </div>

              <button
                onClick={() => setDetalle(null)}
                disabled={cargandoDetalle}
                className="h-10 w-10 rounded-lg border border-gray-700 grid place-items-center hover:border-gray-500"
              >
                <CloseIcon />
              </button>
            </div>

            {cargandoDetalle || !detalle ? (
              <div className="flex-1 grid place-items-center text-gray-500">
                Cargando detalle...
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${
                        detalle.tipo === "CONTADO"
                          ? "border-orange-400/40 bg-orange-400/10 text-orange-300"
                          : "border-sky-400/40 bg-sky-400/10 text-sky-300"
                      }`}
                    >
                      {detalle.tipo}
                    </span>

                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${estadoClass(
                        detalle.tipo,
                        detalle.data.estadoControl,
                      )}`}
                    >
                      {detalle.tipo === "CONTADO"
                        ? estadoContadoLabel(detalle.data.estadoControl)
                        : estadoCreditoLabel(detalle.data.estadoControl)}
                    </span>
                  </div>

                  <Seccion
                    titulo="Cliente"
                    icon={<BadgeIcon fontSize="small" />}
                  >
                    <GridDatos
                      items={[
                        ["Nombre", detalle.data.nombreCompleto],
                        ["Cédula", detalle.data.cedula],
                        ["Teléfono", detalle.data.telefono],
                        [
                          "Nacimiento",
                          detalle.tipo === "CREDITO"
                            ? detalle.data.fechaNacimiento
                              ? new Date(
                                  detalle.data.fechaNacimiento,
                                ).toLocaleDateString("es-PY")
                              : null
                            : null,
                        ],
                      ]}
                    />
                  </Seccion>

                  <Seccion
                    titulo="Moto solicitada"
                    icon={<TwoWheelerIcon fontSize="small" />}
                  >
                    <GridDatos
                      items={[
                        ["Marca", detalle.data.marca],
                        ["Modelo", detalle.data.modelo],
                        ["Código", detalle.data.codigoReferencia],
                        [
                          "Cilindrada",
                          detalle.tipo === "CREDITO"
                            ? detalle.data.cilindrada
                              ? `${detalle.data.cilindrada} cc`
                              : null
                            : null,
                        ],
                      ]}
                    />
                  </Seccion>

                  <Seccion
                    titulo="Domicilio"
                    icon={<HomeIcon fontSize="small" />}
                  >
                    <GridDatos
                      items={[
                        ["Ciudad", detalle.data.ciudad],
                        ["Barrio", detalle.data.barrio],
                        ["Dirección", detalle.data.direccion],
                      ]}
                    />
                  </Seccion>

                  {detalle.tipo === "CREDITO" && detalle.data.laboral && (
                    <Seccion
                      titulo="Datos laborales"
                      icon={<WorkIcon fontSize="small" />}
                    >
                      <GridDatos
                        items={[
                          ["Empresa", detalle.data.laboral.empresa],
                          [
                            "Antigüedad",
                            `${detalle.data.laboral.antiguedadMeses} meses`,
                          ],
                          [
                            "Aporta IPS",
                            detalle.data.laboral.aportaIPS ? "Sí" : "No",
                          ],
                          [
                            "Aportes IPS",
                            detalle.data.laboral.cantidadAportesIPS,
                          ],
                          [
                            "Teléfono empresa",
                            detalle.data.laboral.telefonoEmpresa,
                          ],
                          [
                            "Dirección empresa",
                            detalle.data.laboral.direccionEmpresa,
                          ],
                        ]}
                      />
                    </Seccion>
                  )}

                  {detalle.tipo === "CREDITO" &&
                    detalle.data.referencias.length > 0 && (
                      <Seccion
                        titulo="Referencias"
                        icon={<PhoneIcon fontSize="small" />}
                      >
                        <div className="space-y-2">
                          {detalle.data.referencias.map((ref) => (
                            <div
                              key={ref.id}
                              className="rounded-lg bg-gray-950 border border-gray-800 p-3"
                            >
                              <div className="font-semibold">{ref.nombre}</div>
                              <div className="text-sm text-gray-400 mt-1">
                                {ref.telefono} · {ref.tipo}
                                {ref.parentesco ? ` · ${ref.parentesco}` : ""}
                              </div>
                            </div>
                          ))}
                        </div>
                      </Seccion>
                    )}

                  <Seccion
                    titulo="Documentos"
                    icon={<DescriptionIcon fontSize="small" />}
                  >
                    {detalle.data.documentos.length === 0 ? (
                      <div className="text-sm text-gray-500">
                        No hay documentos registrados.
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-2">
                        {detalle.data.documentos.map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => void abrirDocumento(doc.id)}
                            className="text-left rounded-lg bg-gray-950 border border-gray-800 p-3 hover:border-yellow-400/60 transition"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <div className="font-semibold text-sm">
                                  {doc.tipoDocumento}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {doc.nombreArchivo}
                                </div>
                              </div>
                              <OpenInNewIcon
                                fontSize="small"
                                className="text-yellow-300"
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </Seccion>

                  {detalle.tipo === "CREDITO" && detalle.data.autorizacion && (
                    <Seccion
                      titulo="Autorización"
                      icon={<VerifiedUserIcon fontSize="small" />}
                    >
                      <GridDatos
                        items={[
                          ["Titular", detalle.data.autorizacion.nombreCompleto],
                          ["Cédula", detalle.data.autorizacion.numeroCedula],
                          ["Canal", detalle.data.autorizacion.canal],
                          [
                            "Fecha",
                            formatearFecha(
                              detalle.data.autorizacion.fechaAutorizacion,
                            ),
                          ],
                        ]}
                      />
                    </Seccion>
                  )}

                  <Seccion
                    titulo="Seguimiento"
                    icon={<HistoryIcon fontSize="small" />}
                  >
                    <div className="space-y-3">
                      {detalle.data.historial.length === 0 ? (
                        <div className="text-sm text-gray-500">
                          Sin movimientos registrados.
                        </div>
                      ) : (
                        detalle.data.historial.map((item) => (
                          <div
                            key={item.id}
                            className="border-l-2 border-yellow-400 pl-3"
                          >
                            <div className="text-sm font-semibold">
                              {item.accion}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatearFecha(item.fecha)}
                            </div>
                            {item.observacion && (
                              <div className="text-sm text-gray-300 mt-1">
                                {item.observacion}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </Seccion>
                </div>

                <div className="p-4 border-t border-gray-800 bg-gray-900">
                  {detalle.tipo === "CONTADO" &&
                    detalle.data.estadoControl === "PENDIENTE_CONTACTO" && (
                      <button
                        onClick={() => void contactarContado()}
                        disabled={procesandoAccion}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-bold disabled:opacity-50"
                      >
                        <PhoneInTalkIcon fontSize="small" />
                        {procesandoAccion
                          ? "Actualizando..."
                          : "Tomar y contactar ahora"}
                      </button>
                    )}

                  {detalle.tipo === "CONTADO" &&
                    detalle.data.estadoControl === "CONTACTADO" && (
                      <div className="grid sm:grid-cols-2 gap-3">
                        <button
                          onClick={() => void concretarContado()}
                          disabled={procesandoAccion}
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50"
                        >
                          <CheckCircleIcon fontSize="small" />
                          Concretada
                        </button>

                        <button
                          onClick={() => void noConcretarContado()}
                          disabled={procesandoAccion}
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold disabled:opacity-50"
                        >
                          <CancelIcon fontSize="small" />
                          No concretada
                        </button>
                      </div>
                    )}

                  {detalle.tipo === "CREDITO" &&
                    detalle.data.estadoControl === "PENDIENTE_ENVIO" && (
                      <button
                        onClick={() => void marcarCreditoEnviado()}
                        disabled={procesandoAccion}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50"
                      >
                        <SendIcon fontSize="small" />
                        {procesandoAccion
                          ? "Actualizando..."
                          : "Marcar como enviada a la empresa"}
                      </button>
                    )}

                  {((detalle.tipo === "CONTADO" &&
                    ["CONCRETADA", "NO_CONCRETADA"].includes(
                      detalle.data.estadoControl,
                    )) ||
                    (detalle.tipo === "CREDITO" &&
                      detalle.data.estadoControl === "ENVIADA_EMPRESA")) && (
                    <div className="text-center text-sm text-gray-400 py-1">
                      Esta gestión ya no tiene acciones pendientes.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface ResumenCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}

const ResumenCard: React.FC<ResumenCardProps> = ({
  label,
  value,
  icon,
  className,
}) => (
  <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
    <div
      className={`flex items-center gap-2 text-sm font-semibold ${className}`}
    >
      {icon}
      {label}
    </div>
    <div className="text-3xl font-bold mt-3">{value}</div>
  </div>
);

interface SeccionProps {
  titulo: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Seccion: React.FC<SeccionProps> = ({ titulo, icon, children }) => (
  <section className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
    <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2 text-yellow-300 font-bold">
      {icon}
      {titulo}
    </div>
    <div className="p-4">{children}</div>
  </section>
);

interface GridDatosProps {
  items: Array<[string, string | number | boolean | null | undefined]>;
}

const GridDatos: React.FC<GridDatosProps> = ({ items }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
    {items
      .filter(
        ([, valor]) => valor !== null && valor !== undefined && valor !== "",
      )
      .map(([label, valor]) => (
        <div key={label}>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="text-sm text-gray-200 mt-1">
            {campo(valor as any)}
          </div>
        </div>
      ))}
  </div>
);

export default Dashboard;

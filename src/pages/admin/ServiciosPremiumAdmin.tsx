import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  BadgeDollarSign,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crown,
  Eraser,
  RefreshCcw,
  Search,
  ShieldAlert,
  Store,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import flatpickr from "flatpickr";
import { Spanish } from "flatpickr/dist/l10n/es.js";

import "flatpickr/dist/flatpickr.min.css";
import "./ServiciosPremiumAdmin.css";

import { useUsuario } from "../../context/UsuarioContext";
import { obtenerTemporadas } from "../../api/publicacionesService";
import {
  activarServicioPremiumAdmin,
  cancelarServicioPremiumAdmin,
  obtenerResumenServiciosPremiumAdmin,
  obtenerServiciosPremiumAdmin,
} from "../../api/serviciosPremiumService";

import {
  Datos,
  ESTADOS_SERVICIO_PREMIUM,
  FiltrosServiciosPremium,
  ResumenServiciosPremium,
  ServicioPremium,
  TIPOS_SERVICIO_PREMIUM,
} from "../../types/servicioPremium.types";

const resumenInicial: ResumenServiciosPremium = {
  solicitudesPendientes: 0,
  serviciosActivos: 0,
  proximosAVencer: 0,
  montoCobrado: 0,
};

const resultadoInicial: Datos<ServicioPremium[]> = {
  items: [],
  totalRegistros: 0,
};

const filtrosIniciales: FiltrosServiciosPremium = {
  estado: "",
  tipoServicio: "",
  cliente: "",
  fechaDesde: "",
  fechaHasta: "",
  pagina: 1,
  tamanioPagina: 10,
};

const obtenerRolesGuardados = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem("roles") || "[]");
  } catch {
    return [];
  }
};

const formatearFecha = (fecha?: string | null) => {
  if (!fecha) return "—";

  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(fecha));
};

const formatearMonto = (monto?: number | null) => {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0,
  }).format(monto || 0);
};

const fechaParaInput = (fecha: Date) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const sumarDias = (fecha: Date, dias: number) => {
  const copia = new Date(fecha);
  copia.setDate(copia.getDate() + dias);
  return copia;
};

const escaparHtml = (valor: string) => {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const obtenerValorInput = (id: string) => {
  const elemento = document.getElementById(id) as
    | HTMLInputElement
    | HTMLSelectElement
    | null;

  return elemento?.value?.trim() || "";
};

/**
 * Formatea el monto mientras el administrador escribe.
 *
 * Ejemplos:
 * 1000    -> 1.000
 * 100000  -> 100.000
 */
const formatearMontoInput = (valor: string) => {
  const soloNumeros = valor.replace(/\D/g, "");

  if (!soloNumeros) {
    return "";
  }

  return Number(soloNumeros).toLocaleString("es-PY");
};

/**
 * Convierte nuevamente el texto visual a número
 * antes de enviarlo al backend.
 *
 * Ejemplo:
 * 1.500.000 -> 1500000
 */
const obtenerMontoNumerico = (valor: string) => {
  const soloNumeros = valor.replace(/\D/g, "");

  if (!soloNumeros) {
    return Number.NaN;
  }

  return Number(soloNumeros);
};

/**
 * Agrega la máscara al input que SweetAlert
 * inserta dinámicamente dentro del modal.
 */
const configurarMascaraMonto = () => {
  const input = document.getElementById(
    "premium-monto",
  ) as HTMLInputElement | null;

  if (!input) {
    return;
  }

  const aplicarFormato = () => {
    input.value = formatearMontoInput(input.value);
  };

  input.addEventListener("input", aplicarFormato);
  input.addEventListener("blur", aplicarFormato);
};

const configurarCalendarioVigencia = () => {
  const inputRango = document.getElementById(
    "premium-rango",
  ) as HTMLInputElement | null;

  const inputInicio = document.getElementById(
    "premium-inicio",
  ) as HTMLInputElement | null;

  const inputFin = document.getElementById(
    "premium-fin",
  ) as HTMLInputElement | null;

  const popup = document.querySelector(".swal2-popup") as HTMLElement | null;

  if (!inputRango || !inputInicio || !inputFin || !popup) {
    return;
  }

  flatpickr(inputRango, {
    mode: "range",

    locale: {
      ...Spanish,
      rangeSeparator: "  →  ",
    },

    dateFormat: "Y-m-d",

    altInput: true,

    altFormat: "d/m/Y",

    /*
     * Esta clase se aplica al segundo input que flatpickr
     * genera visualmente. Es la parte clave para evitar
     * el fondo blanco.
     */
    altInputClass: "premium-date-input premium-date-alt-input",

    defaultDate: [inputInicio.value, inputFin.value],

    allowInput: false,

    clickOpens: true,

    disableMobile: true,

    monthSelectorType: "static",

    position: "below center",

    appendTo: popup,

    onReady: (_fechasSeleccionadas, _textoSeleccionado, calendario) => {
      calendario.calendarContainer.classList.add("premium-flatpickr");

      if (calendario.altInput) {
        calendario.altInput.classList.add(
          "premium-date-input",
          "premium-date-alt-input",
        );

        calendario.altInput.setAttribute("readonly", "readonly");

        calendario.altInput.setAttribute("autocomplete", "off");

        calendario.altInput.placeholder = "Seleccioná inicio y vencimiento";
      }
    },

    onChange: (fechasSeleccionadas, _textoSeleccionado, calendario) => {
      inputInicio.value = fechasSeleccionadas[0]
        ? calendario.formatDate(fechasSeleccionadas[0], "Y-m-d")
        : "";

      inputFin.value = fechasSeleccionadas[1]
        ? calendario.formatDate(fechasSeleccionadas[1], "Y-m-d")
        : "";

      if (fechasSeleccionadas.length === 2) {
        window.setTimeout(() => {
          calendario.close();
        }, 0);
      }
    },

    onClose: (_fechasSeleccionadas, _textoSeleccionado, calendario) => {
      /*
       * Quitamos el foco y la selección visual al cerrar
       * el calendario para evitar el resaltado blanco.
       */
      window.setTimeout(() => {
        inputRango.blur();

        if (calendario.altInput) {
          calendario.altInput.blur();

          calendario.altInput.setSelectionRange(0, 0);
        }
      }, 0);
    },
  });
};

const SWAL_DARK_CLASSES = {
  popup:
    "!rounded-[24px] !bg-[#16181f] !text-white !shadow-[0_25px_80px_rgba(0,0,0,0.45)] !border !border-white/10 !px-0 !pb-0 !pt-0",
  title:
    "!text-[26px] md:!text-[28px] !font-extrabold !leading-tight !text-white",
  htmlContainer: "!m-0 !px-0 !pb-0 !pt-0 !text-left",
  confirmButton:
    "!rounded-xl !bg-yellow-400 !px-4 !py-2.5 !text-sm !font-extrabold !text-black hover:!bg-yellow-300",
  cancelButton:
    "!rounded-xl !bg-[#6b7280] !px-4 !py-2.5 !text-sm !font-bold !text-white hover:!bg-[#7c8595]",
};

const baseModalWrapperStyle =
  "padding: 22px 22px 18px; color: #e5e7eb; text-align: left;";

const renderInfoRow = (label: string, value: string) => `
  <div style="
    display:flex;
    flex-direction:column;
    gap:4px;
    margin-bottom:12px;
  ">
    <span style="
      font-size:12px;
      color:#9ca3af;
      font-weight:700;
      text-transform:uppercase;
      letter-spacing:0.04em;
    ">
      ${escaparHtml(label)}
    </span>

    <div style="
      font-size:14px;
      color:#f9fafb;
      font-weight:600;
      line-height:1.45;
      background:rgba(255,255,255,0.03);
      border:1px solid rgba(255,255,255,0.08);
      border-radius:12px;
      padding:10px 12px;
    ">
      ${escaparHtml(value)}
    </div>
  </div>
`;

const renderFieldLabel = (texto: string) => `
  <label style="
    display:block;
    margin:12px 0 6px;
    font-size:12px;
    color:#cbd5e1;
    font-weight:700;
    letter-spacing:0.02em;
  ">
    ${escaparHtml(texto)}
  </label>
`;

const inputStyle = `
  width:100%;
  margin:0;
  height:42px;
  border-radius:12px;
  border:1px solid rgba(255,255,255,0.12);
  background:#0f1117;
  color:#f9fafb;
  padding:0 12px;
  font-size:14px;
  outline:none;
  box-sizing:border-box;
`;

const textareaStyle = `
  width:100%;
  margin:0;
  min-height:74px;
  border-radius:12px;
  border:1px solid rgba(255,255,255,0.12);
  background:#0f1117;
  color:#f9fafb;
  padding:10px 12px;
  font-size:14px;
  outline:none;
  resize:vertical;
  box-sizing:border-box;
`;

const camposPagoHtml = `
 ${renderFieldLabel("Monto cobrado (Gs.)")}
    <input
      id="premium-monto"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      placeholder="Ej.: 100.000"
      style="${inputStyle}"
    />

    <div style="
      margin-top:5px;
      font-size:11px;
      color:#6b7280;
    ">
      El separador de miles se agrega automáticamente.
    </div>

  ${renderFieldLabel("Medio de pago")}
  <select
    id="premium-medio"
    style="${inputStyle}"
  >
    <option value="TRANSFERENCIA">Transferencia</option>
    <option value="EFECTIVO">Efectivo</option>
    <option value="CORTESIA">Cortesía</option>
  </select>

  ${renderFieldLabel("Referencia del pago")}
  <input
    id="premium-referencia"
    placeholder="Número de operación o comprobante"
    style="${inputStyle}"
  />

  ${renderFieldLabel("Observación")}
  <textarea
    id="premium-observacion"
    placeholder="Opcional, salvo para cortesías"
    style="${textareaStyle}"
  ></textarea>
`;

const obtenerDatosPago = () => {
  const montoTexto = obtenerValorInput("premium-monto");
  const medioPago = obtenerValorInput("premium-medio");
  const referenciaPago = obtenerValorInput("premium-referencia");
  const observacion = obtenerValorInput("premium-observacion");

  if (!montoTexto) {
    Swal.showValidationMessage(
      "Ingresá el monto cobrado. Para una cortesía utilizá 0.",
    );
    return null;
  }

  const monto = obtenerMontoNumerico(montoTexto);

  if (Number.isNaN(monto) || monto < 0) {
    Swal.showValidationMessage("El monto ingresado no es válido.");
    return null;
  }

  if (!medioPago) {
    Swal.showValidationMessage(
      "Indicá el medio de pago. Para una promoción gratuita utilizá CORTESIA.",
    );
    return null;
  }

  const medioPagoNormalizado = medioPago.toUpperCase();

  if (monto === 0 && medioPagoNormalizado !== "CORTESIA") {
    Swal.showValidationMessage(
      "Cuando el monto es 0, el medio de pago debe ser CORTESIA.",
    );
    return null;
  }

  if (monto === 0 && !observacion) {
    Swal.showValidationMessage(
      "Agregá una observación para justificar la cortesía.",
    );
    return null;
  }

  return {
    monto,
    medioPago: medioPagoNormalizado,
    referenciaPago: referenciaPago || undefined,
    observacion: observacion || undefined,
  };
};

const ServiciosPremiumAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { esAdmin } = useUsuario();

  const tieneAccesoAdmin =
    esAdmin || obtenerRolesGuardados().includes("Administrador");

  const [resumen, setResumen] =
    useState<ResumenServiciosPremium>(resumenInicial);

  const [resultado, setResultado] =
    useState<Datos<ServicioPremium[]>>(resultadoInicial);

  const [filtrosFormulario, setFiltrosFormulario] =
    useState<FiltrosServiciosPremium>(filtrosIniciales);

  const [filtrosAplicados, setFiltrosAplicados] =
    useState<FiltrosServiciosPremium>(filtrosIniciales);

  const [cargando, setCargando] = useState(false);

  const tamanioPagina = filtrosAplicados.tamanioPagina || 10;
  const paginaActual = filtrosAplicados.pagina || 1;

  const totalPaginas = Math.max(
    1,
    Math.ceil(resultado.totalRegistros / tamanioPagina),
  );

  const cargarDatos = useCallback(async () => {
    if (!tieneAccesoAdmin) return;

    try {
      setCargando(true);

      const [serviciosResponse, resumenResponse] = await Promise.all([
        obtenerServiciosPremiumAdmin(filtrosAplicados),
        obtenerResumenServiciosPremiumAdmin(),
      ]);

      setResultado(serviciosResponse);
      setResumen(resumenResponse);
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo cargar el dashboard",
        text:
          error?.message ||
          "Ocurrió un error al consultar los servicios Premium.",
        background: "#16181f",
        color: "#fff",
        confirmButtonColor: "#facc15",
        customClass: SWAL_DARK_CLASSES,
      });
    } finally {
      setCargando(false);
    }
  }, [filtrosAplicados, tieneAccesoAdmin]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const tarjetas = useMemo(
    () => [
      {
        titulo: "Solicitudes pendientes",
        valor: resumen.solicitudesPendientes,
        icono: <Clock3 size={18} />,
      },
      {
        titulo: "Servicios activos",
        valor: resumen.serviciosActivos,
        icono: <CheckCircle2 size={18} />,
      },
      {
        titulo: "Próximos a vencer",
        valor: resumen.proximosAVencer,
        icono: <CalendarClock size={18} />,
      },
      {
        titulo: "Total histórico cobrado",
        valor: formatearMonto(resumen.montoCobrado),
        icono: <BadgeDollarSign size={18} />,
      },
    ],
    [resumen],
  );

  const obtenerTextoPublicacion = (servicio: ServicioPremium) => {
    const titulo = servicio.tituloPublicacion || "Sin publicación";

    if (!servicio.idPublicacion) {
      return titulo;
    }

    return `${titulo} · ID #${servicio.idPublicacion}`;
  };

  const obtenerNombreTipo = (tipoServicio: string) => {
    switch (tipoServicio) {
      case TIPOS_SERVICIO_PREMIUM.VITRINA_PROFESIONAL:
        return "Vitrina profesional";
      case TIPOS_SERVICIO_PREMIUM.PUBLICACION_DESTACADA:
        return "Publicación destacada";
      case TIPOS_SERVICIO_PREMIUM.PUBLICACION_ESPECIAL:
        return "Publicación especial";
      case TIPOS_SERVICIO_PREMIUM.BANNER_MARKETPLACE:
        return "Banner publicitario";
      default:
        return tipoServicio;
    }
  };

  const obtenerClaseEstado = (estado: string) => {
    switch (estado) {
      case ESTADOS_SERVICIO_PREMIUM.ACTIVO:
        return "border-green-400/30 bg-green-400/10 text-green-300";
      case ESTADOS_SERVICIO_PREMIUM.CANCELADO:
        return "border-red-400/30 bg-red-400/10 text-red-300";
      case ESTADOS_SERVICIO_PREMIUM.VENCIDO:
        return "border-gray-400/30 bg-gray-400/10 text-gray-300";
      case ESTADOS_SERVICIO_PREMIUM.PENDIENTE_PAGO:
        return "border-orange-400/30 bg-orange-400/10 text-orange-300";
      default:
        return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
    }
  };

  const aplicarFiltros = (event?: FormEvent) => {
    event?.preventDefault();

    setFiltrosAplicados({
      ...filtrosFormulario,
      pagina: 1,
    });
  };

  const limpiarFiltros = () => {
    setFiltrosFormulario(filtrosIniciales);
    setFiltrosAplicados(filtrosIniciales);
  };

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;

    setFiltrosAplicados((actual) => ({
      ...actual,
      pagina: nuevaPagina,
    }));
  };

  const cambiarTamanioPagina = (nuevoTamanio: number) => {
    setFiltrosFormulario((actual) => ({
      ...actual,
      tamanioPagina: nuevoTamanio,
    }));

    setFiltrosAplicados((actual) => ({
      ...actual,
      tamanioPagina: nuevoTamanio,
      pagina: 1,
    }));
  };

  const activarServicio = async (servicio: ServicioPremium) => {
    try {
      if (
        servicio.tipoServicio === TIPOS_SERVICIO_PREMIUM.PUBLICACION_ESPECIAL
      ) {
        const temporadasResponse: any = await obtenerTemporadas();

        const temporadasData = Array.isArray(temporadasResponse)
          ? temporadasResponse
          : (temporadasResponse?.data ?? temporadasResponse?.Data ?? []);

        const temporadas = temporadasData.map((temporada: any) => ({
          id: Number(temporada.id ?? temporada.Id),
          nombre: String(temporada.nombre ?? temporada.Nombre ?? "Temporada"),
        }));

        if (temporadas.length === 0) {
          await Swal.fire({
            icon: "info",
            title: "No hay temporadas disponibles",
            text: "Creá o habilitá una temporada antes de activar este servicio.",
            background: "#16181f",
            color: "#fff",
            confirmButtonColor: "#facc15",
            customClass: SWAL_DARK_CLASSES,
          });
          return;
        }

        const opciones = temporadas
          .map(
            (temporada: any) => `
              <option value="${temporada.id}">
                ${escaparHtml(temporada.nombre)}
              </option>
            `,
          )
          .join("");

        const resultadoModal = await Swal.fire({
          title: "🎉 Confirmar pago y activar especial",
          width: 560,
          html: `
            <div style="${baseModalWrapperStyle}">
              ${renderInfoRow("Negocio", servicio.nombreNegocio)}
          ${renderInfoRow("Publicación", obtenerTextoPublicacion(servicio))}

              ${renderFieldLabel("Temporada")}
              <select
                id="premium-temporada"
                style="${inputStyle}"
              >
                ${opciones}
              </select>

              ${camposPagoHtml}
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: "Confirmar pago y activar",
          cancelButtonText: "Cancelar",
          background: "#16181f",
          color: "#fff",
          confirmButtonColor: "#facc15",
          cancelButtonColor: "#6b7280",
          customClass: SWAL_DARK_CLASSES,
          didOpen: () => {
            configurarMascaraMonto();
          },
          focusConfirm: false,
          preConfirm: () => {
            const idTemporada = Number(obtenerValorInput("premium-temporada"));

            if (!idTemporada) {
              Swal.showValidationMessage("Seleccioná una temporada.");
              return false;
            }

            const datosPago = obtenerDatosPago();

            if (!datosPago) return false;

            return {
              idTemporada,
              ...datosPago,
            };
          },
        });

        if (!resultadoModal.isConfirmed || !resultadoModal.value) return;

        await activarServicioPremiumAdmin(servicio.id, resultadoModal.value);
      } else {
        const hoy = new Date();

        const diasDefault =
          servicio.tipoServicio === TIPOS_SERVICIO_PREMIUM.PUBLICACION_DESTACADA
            ? 7
            : 30;

        const resultadoModal = await Swal.fire({
          title: "👑 Confirmar pago y activar servicio",
          width: 560,

          html: `
    <div style="${baseModalWrapperStyle}">
      ${renderInfoRow("Negocio", servicio.nombreNegocio)}

      ${renderInfoRow("Servicio", obtenerNombreTipo(servicio.tipoServicio))}

      ${
        servicio.idPublicacion
          ? renderInfoRow("Publicación", obtenerTextoPublicacion(servicio))
          : ""
      }

      <label class="premium-date-label">
        Vigencia del servicio
      </label>

      <input
        id="premium-inicio"
        type="hidden"
        value="${fechaParaInput(hoy)}"
      />

      <input
        id="premium-fin"
        type="hidden"
        value="${fechaParaInput(sumarDias(hoy, diasDefault))}"
      />

      <input
        id="premium-rango"
        class="premium-date-input"
        type="text"
        autocomplete="off"
        readonly
        placeholder="Seleccioná inicio y vencimiento"
      />

      <div class="premium-date-help">
        <span class="premium-date-help-icon">
          💡
        </span>

        <span>
          Elegí primero la fecha de inicio y luego la fecha de vencimiento.
        </span>
      </div>

      ${camposPagoHtml}
    </div>
  `,

          showCancelButton: true,

          confirmButtonText: "Confirmar pago y activar",

          cancelButtonText: "Cancelar",

          background: "#16181f",

          color: "#fff",

          confirmButtonColor: "#facc15",

          cancelButtonColor: "#6b7280",

          customClass: SWAL_DARK_CLASSES,

          didOpen: () => {
            configurarMascaraMonto();
            configurarCalendarioVigencia();
          },

          focusConfirm: false,

          preConfirm: () => {
            const fechaInicio = obtenerValorInput("premium-inicio");

            const fechaFin = obtenerValorInput("premium-fin");

            if (!fechaInicio || !fechaFin) {
              Swal.showValidationMessage(
                "Indicá la fecha de inicio y finalización.",
              );

              return false;
            }

            if (fechaFin <= fechaInicio) {
              Swal.showValidationMessage(
                "La fecha final debe ser posterior a la inicial.",
              );

              return false;
            }

            const datosPago = obtenerDatosPago();

            if (!datosPago) {
              return false;
            }

            return {
              fechaInicio: `${fechaInicio}T00:00:00`,

              fechaFin: `${fechaFin}T23:59:59`,

              ...datosPago,
            };
          },
        });

        if (!resultadoModal.isConfirmed || !resultadoModal.value) return;

        await activarServicioPremiumAdmin(servicio.id, resultadoModal.value);
      }

      await Swal.fire({
        icon: "success",
        title: "Servicio activado",
        text: "El pago fue registrado y el beneficio Premium ya está habilitado.",
        background: "#16181f",
        color: "#fff",
        confirmButtonColor: "#facc15",
        customClass: SWAL_DARK_CLASSES,
      });

      await cargarDatos();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo activar",
        text: error?.message || "Ocurrió un error al activar el servicio.",
        background: "#16181f",
        color: "#fff",
        confirmButtonColor: "#facc15",
        customClass: SWAL_DARK_CLASSES,
      });
    }
  };

  const cancelarServicio = async (servicio: ServicioPremium) => {
    const resultadoModal = await Swal.fire({
      icon: "warning",
      title: "¿Cancelar servicio Premium?",
      text: "Si el servicio está activo, el beneficio será retirado inmediatamente.",
      input: "textarea",
      inputLabel: "Observación",
      inputPlaceholder: "Motivo de cancelación o comentario interno...",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Volver",
      background: "#16181f",
      color: "#fff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      customClass: SWAL_DARK_CLASSES,
    });

    if (!resultadoModal.isConfirmed) return;

    try {
      await cancelarServicioPremiumAdmin(servicio.id, {
        observacion: resultadoModal.value?.trim() || undefined,
      });

      await Swal.fire({
        icon: "success",
        title: "Servicio cancelado",
        background: "#16181f",
        color: "#fff",
        confirmButtonColor: "#facc15",
        customClass: SWAL_DARK_CLASSES,
      });

      await cargarDatos();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo cancelar",
        text: error?.message || "Ocurrió un error al cancelar el servicio.",
        background: "#16181f",
        color: "#fff",
        confirmButtonColor: "#facc15",
        customClass: SWAL_DARK_CLASSES,
      });
    }
  };

  if (!tieneAccesoAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050914] px-4 text-white">
        <div className="max-w-lg rounded-3xl border border-red-400/20 bg-[#111827] p-7 text-center shadow-2xl">
          <ShieldAlert className="mx-auto text-red-300" size={40} />
          <h1 className="mt-4 text-xl font-black sm:text-2xl">
            Acceso restringido
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-300">
            Esta pantalla está disponible únicamente para administradores.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-5 rounded-full bg-yellow-400 px-5 py-2 text-sm font-black text-black hover:bg-yellow-300"
          >
            Volver al marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050914] px-3 py-4 text-white sm:px-5 lg:px-7">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] font-bold transition hover:bg-yellow-400 hover:text-black"
            >
              <ArrowLeft size={14} />
              Volver al marketplace
            </button>

            <div className="flex items-start gap-3">
              <div className="mt-1 text-yellow-300">
                <Crown size={24} />
              </div>

              <div>
                <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[30px]">
                  Servicios Premium
                </h1>

                <p className="mt-1 max-w-2xl text-[13px] leading-5 text-gray-400 sm:text-sm">
                  Gestioná solicitudes, pagos, activaciones y vencimientos.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => cargarDatos()}
            disabled={cargando}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-[12px] font-extrabold text-yellow-200 transition hover:bg-yellow-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw className={cargando ? "animate-spin" : ""} size={15} />
            Actualizar
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {tarjetas.map((tarjeta) => (
            <div
              key={tarjeta.titulo}
              className="rounded-2xl border border-yellow-400/20 bg-[#111827] p-4 shadow-xl"
            >
              <div className="flex items-center justify-between text-yellow-300">
                <span className="text-[12px] font-bold leading-4">
                  {tarjeta.titulo}
                </span>
                {tarjeta.icono}
              </div>

              <p className="mt-3 text-[28px] font-extrabold leading-none sm:text-[30px]">
                {tarjeta.valor}
              </p>
            </div>
          ))}
        </div>

        <form
          onSubmit={aplicarFiltros}
          className="mt-6 rounded-3xl border border-white/10 bg-[#111827] p-4 shadow-2xl"
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <input
              value={filtrosFormulario.cliente || ""}
              onChange={(event) =>
                setFiltrosFormulario((actual) => ({
                  ...actual,
                  cliente: event.target.value,
                }))
              }
              placeholder="Buscar vendedor o negocio..."
              className="rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-gray-500 focus:border-yellow-400 xl:col-span-2"
            />

            <select
              value={filtrosFormulario.tipoServicio || ""}
              onChange={(event) =>
                setFiltrosFormulario((actual) => ({
                  ...actual,
                  tipoServicio: event.target.value,
                }))
              }
              className="rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2.5 text-[13px] text-white outline-none focus:border-yellow-400"
            >
              <option value="">Todos los servicios</option>
              <option value="VITRINA_PROFESIONAL">Vitrina profesional</option>
              <option value="PUBLICACION_DESTACADA">
                Publicación destacada
              </option>
              <option value="PUBLICACION_ESPECIAL">Publicación especial</option>
            </select>

            <select
              value={filtrosFormulario.estado || ""}
              onChange={(event) =>
                setFiltrosFormulario((actual) => ({
                  ...actual,
                  estado: event.target.value,
                }))
              }
              className="rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2.5 text-[13px] text-white outline-none focus:border-yellow-400"
            >
              <option value="">Todos los estados</option>
              <option value="SOLICITADO">Solicitados</option>
              <option value="PENDIENTE_PAGO">Pendientes de pago</option>
              <option value="ACTIVO">Activos</option>
              <option value="VENCIDO">Vencidos</option>
              <option value="CANCELADO">Cancelados</option>
            </select>

            <input
              type="date"
              value={filtrosFormulario.fechaDesde || ""}
              onChange={(event) =>
                setFiltrosFormulario((actual) => ({
                  ...actual,
                  fechaDesde: event.target.value,
                }))
              }
              className="rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2.5 text-[13px] text-white outline-none focus:border-yellow-400"
            />

            <input
              type="date"
              value={filtrosFormulario.fechaHasta || ""}
              onChange={(event) =>
                setFiltrosFormulario((actual) => ({
                  ...actual,
                  fechaHasta: event.target.value,
                }))
              }
              className="rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2.5 text-[13px] text-white outline-none focus:border-yellow-400"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-[13px] font-extrabold text-black transition hover:bg-yellow-300"
            >
              <Search size={15} />
              Buscar
            </button>

            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-bold text-white transition hover:bg-white/10"
            >
              <Eraser size={15} />
              Limpiar
            </button>
          </div>
        </form>

        <section className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">
          <div className="border-b border-white/10 p-4">
            <h2 className="text-[17px] font-extrabold leading-tight">
              Solicitudes y servicios
            </h2>
            <p className="mt-1 text-[12px] leading-4 text-gray-400">
              Confirmá el pago y activá cada beneficio desde esta tabla.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-bold">Fecha</th>
                  <th className="px-4 py-3 font-bold">Vendedor</th>
                  <th className="px-4 py-3 font-bold">Servicio</th>
                  <th className="px-4 py-3 font-bold">Publicación</th>
                  <th className="px-4 py-3 font-bold">Estado</th>
                  <th className="px-4 py-3 font-bold">Vigencia</th>
                  <th className="px-4 py-3 font-bold">Pago</th>
                  <th className="px-4 py-3 text-right font-bold">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10 text-[13px]">
                {resultado.items.map((servicio) => (
                  <tr
                    key={servicio.id}
                    className="transition hover:bg-white/[0.03]"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 text-gray-300">
                      {formatearFecha(servicio.fechaSolicitud)}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-start gap-2">
                        <Store
                          className="mt-0.5 shrink-0 text-yellow-300"
                          size={15}
                        />

                        <div>
                          <p className="font-semibold leading-5 text-white">
                            {servicio.nombreNegocio}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            #{servicio.idVendedor}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-medium text-gray-200">
                      {obtenerNombreTipo(servicio.tipoServicio)}
                    </td>

                    <td className="max-w-[270px] px-4 py-3.5 text-gray-300">
                      {servicio.idPublicacion ? (
                        <div>
                          <p className="line-clamp-2 font-medium leading-5 text-gray-200">
                            {servicio.tituloPublicacion || "Sin título"}
                          </p>

                          <div className="mt-1">
                            <span className="inline-flex rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold text-gray-400">
                              ID publicación: #{servicio.idPublicacion}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${obtenerClaseEstado(
                          servicio.estado,
                        )}`}
                      >
                        {servicio.estado}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-[12px] leading-5 text-gray-300">
                      <div>{formatearFecha(servicio.fechaInicio)}</div>
                      <div className="text-gray-500">
                        hasta {formatearFecha(servicio.fechaFin)}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      {servicio.fechaPago ? (
                        <>
                          <p className="text-[13px] font-extrabold text-green-300">
                            {formatearMonto(servicio.monto)}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {servicio.medioPago || "—"}
                          </p>
                        </>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {servicio.estado !== ESTADOS_SERVICIO_PREMIUM.ACTIVO &&
                          servicio.estado !==
                            ESTADOS_SERVICIO_PREMIUM.CANCELADO && (
                            <button
                              type="button"
                              onClick={() => activarServicio(servicio)}
                              className="rounded-lg bg-yellow-400 px-3 py-2 text-[11px] font-extrabold text-black transition hover:bg-yellow-300"
                            >
                              Confirmar pago y activar
                            </button>
                          )}

                        {servicio.estado !==
                          ESTADOS_SERVICIO_PREMIUM.CANCELADO && (
                          <button
                            type="button"
                            onClick={() => cancelarServicio(servicio)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 px-3 py-2 text-[11px] font-extrabold text-red-300 transition hover:bg-red-500 hover:text-white"
                          >
                            <XCircle size={13} />
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {!cargando && resultado.items.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-[13px] text-gray-400"
                    >
                      No hay servicios Premium para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {cargando && (
            <div className="border-t border-white/10 px-4 py-5 text-center text-[13px] text-yellow-300">
              Cargando servicios Premium...
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[12px] text-gray-400">
              Total de registros:{" "}
              <b className="text-white">{resultado.totalRegistros}</b>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={tamanioPagina}
                onChange={(event) =>
                  cambiarTamanioPagina(Number(event.target.value))
                }
                className="rounded-lg border border-white/10 bg-[#0b1220] px-2.5 py-1.5 text-[12px] text-white"
              >
                <option value="10">10 por página</option>
                <option value="20">20 por página</option>
                <option value="50">50 por página</option>
              </select>

              <button
                type="button"
                disabled={paginaActual <= 1}
                onClick={() => cambiarPagina(paginaActual - 1)}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>

              <span className="text-[12px] text-gray-300">
                Página <b className="text-white">{paginaActual}</b> de{" "}
                <b className="text-white">{totalPaginas}</b>
              </span>

              <button
                type="button"
                disabled={
                  paginaActual >= totalPaginas || resultado.totalRegistros === 0
                }
                onClick={() => cambiarPagina(paginaActual + 1)}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServiciosPremiumAdmin;

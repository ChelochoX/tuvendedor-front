import React, { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  MessageCircle,
  Phone,
  User,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

import { crearSolicitudVisita } from "../../api/solicitudesVisitaService";
import { PublicacionPerfilVendedor } from "../../types/perfilVendedor.types";

interface Props {
  abierto: boolean;
  publicacion: PublicacionPerfilVendedor | null;
  onClose: () => void;
}

interface FormVisita {
  nombreInteresado: string;
  telefonoInteresado: string;
  fechaVisita: string;
  horaVisita: string;
  mensaje: string;
}

type FormErrors = Partial<Record<keyof FormVisita, string>>;

const estadoInicial: FormVisita = {
  nombreInteresado: "",
  telefonoInteresado: "",
  fechaVisita: "",
  horaVisita: "",
  mensaje: "",
};

const obtenerFechaHoyInput = () => {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

const generarHorariosDisponibles = () => {
  const horarios: string[] = [];

  const horaInicio = 8;
  const horaFin = 18;

  for (let hora = horaInicio; hora <= horaFin; hora++) {
    horarios.push(`${String(hora).padStart(2, "0")}:00`);

    if (hora < horaFin) {
      horarios.push(`${String(hora).padStart(2, "0")}:30`);
    }
  }

  return horarios;
};

const esFechaHoy = (fecha: string) => {
  return fecha === obtenerFechaHoyInput();
};

const horarioYaPaso = (hora: string) => {
  const ahora = new Date();
  const [hh, mm] = hora.split(":").map(Number);

  const fechaHora = new Date();
  fechaHora.setHours(hh, mm, 0, 0);

  return fechaHora <= ahora;
};

const obtenerClaseCampo = (tieneError?: boolean) => {
  const base =
    "premium-input w-full rounded-2xl border bg-[#020817] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition";

  if (tieneError) {
    return `${base} border-red-400/80 focus:border-red-400 focus:ring-2 focus:ring-red-500/10`;
  }

  return `${base} border-white/10 focus:border-yellow-400/60`;
};

const obtenerClaseSelect = (tieneError?: boolean) => {
  const base =
    "premium-select w-full cursor-pointer appearance-none rounded-2xl border bg-[#020817] px-4 py-3 pr-11 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-60";

  if (tieneError) {
    return `${base} border-red-400/80 focus:border-red-400 focus:ring-2 focus:ring-red-500/10`;
  }

  return `${base} border-white/10 focus:border-yellow-400/60`;
};

const FieldError = ({ mensaje }: { mensaje?: string }) => {
  if (!mensaje) return null;

  return (
    <p className="mt-1 flex items-start gap-1.5 text-xs font-medium leading-5 text-red-300">
      <AlertCircle size={14} className="mt-[2px] shrink-0" />
      {mensaje}
    </p>
  );
};

const SolicitarVisitaModal: React.FC<Props> = ({
  abierto,
  publicacion,
  onClose,
}) => {
  const [form, setForm] = useState<FormVisita>(estadoInicial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const fechaMinima = useMemo(() => obtenerFechaHoyInput(), []);

  const horarios = useMemo(() => {
    const todos = generarHorariosDisponibles();

    if (!form.fechaVisita || !esFechaHoy(form.fechaVisita)) {
      return todos;
    }

    return todos.filter((hora) => !horarioYaPaso(hora));
  }, [form.fechaVisita]);

  if (!abierto || !publicacion) return null;

  const validarFormulario = (valores: FormVisita): FormErrors => {
    const nuevosErrores: FormErrors = {};

    if (!valores.nombreInteresado.trim()) {
      nuevosErrores.nombreInteresado =
        "Ingresá tu nombre para que el vendedor pueda identificarte.";
    }

    if (!valores.telefonoInteresado.trim()) {
      nuevosErrores.telefonoInteresado =
        "Ingresá tu WhatsApp o teléfono de contacto.";
    }

    if (!valores.fechaVisita) {
      nuevosErrores.fechaVisita =
        "Seleccioná la fecha en la que querés visitar.";
    }

    if (!valores.horaVisita) {
      nuevosErrores.horaVisita =
        "Seleccioná una hora disponible para la visita.";
    }

    return nuevosErrores;
  };

  const actualizarCampo = (campo: keyof FormVisita, valor: string) => {
    setForm((actual) => {
      const actualizado = {
        ...actual,
        [campo]: valor,
      };

      if (campo === "fechaVisita") {
        actualizado.horaVisita = "";
      }

      if (intentoEnviar) {
        setErrors(validarFormulario(actualizado));
      } else {
        setErrors((actualErrors) => ({
          ...actualErrors,
          [campo]: undefined,
          ...(campo === "fechaVisita" ? { horaVisita: undefined } : {}),
        }));
      }

      return actualizado;
    });
  };

  const limpiarFormulario = () => {
    setForm(estadoInicial);
    setErrors({});
    setIntentoEnviar(false);
  };

  const cerrar = () => {
    if (guardando) return;

    limpiarFormulario();
    onClose();
  };

  const abrirSelectorFecha = (event: React.MouseEvent<HTMLInputElement>) => {
    const input = event.currentTarget;

    if (typeof input.showPicker === "function") {
      input.showPicker();
    }
  };

  const mostrarModalGuardando = () => {
    Swal.fire({
      title: "Enviando solicitud",
      html: `
        <div style="padding-top: 6px;">
          <p style="margin: 0; color: #cbd5e1; font-size: 14px;">
            Estamos registrando tu solicitud de visita.
          </p>
          <p style="margin: 10px 0 0; color: #facc15; font-size: 13px; font-weight: 600;">
            Aguardá un momento...
          </p>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background: "#111827",
      color: "#ffffff",
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIntentoEnviar(true);

    const errores = validarFormulario(form);
    setErrors(errores);

    const tieneErrores = Object.values(errores).some(Boolean);

    if (tieneErrores) {
      Swal.fire({
        title: "Faltan datos",
        text: "Completá los campos marcados para solicitar la visita.",
        icon: "warning",
        confirmButtonColor: "#facc15",
        background: "#111827",
        color: "#fff",
      });

      return;
    }

    try {
      setGuardando(true);
      mostrarModalGuardando();

      await crearSolicitudVisita({
        idPublicacion: publicacion.id,
        nombreInteresado: form.nombreInteresado.trim(),
        telefonoInteresado: form.telefonoInteresado.trim(),
        fechaVisita: form.fechaVisita,
        horaVisita: `${form.horaVisita}:00`,
        mensaje: form.mensaje.trim(),
      });

      Swal.fire({
        title: "Solicitud enviada",
        html: `
          <div style="text-align:center;">
            <p style="margin:0;color:#cbd5e1;font-size:14px;">
              El vendedor recibió tu solicitud de visita.
            </p>
            <p style="margin:8px 0 0;color:#cbd5e1;font-size:14px;">
              Te contactará para confirmar la disponibilidad.
            </p>
          </div>
        `,
        icon: "success",
        confirmButtonColor: "#facc15",
        background: "#111827",
        color: "#fff",
      });

      limpiarFormulario();
      onClose();
    } catch (error: any) {
      console.error("Error al solicitar visita:", error);

      const mensaje =
        error?.response?.data?.Errors?.[0] ||
        error?.response?.data?.Message ||
        error?.message ||
        "No se pudo enviar la solicitud de visita.";

      Swal.fire({
        title: "No se pudo enviar",
        text: mensaje,
        icon: "error",
        confirmButtonColor: "#facc15",
        background: "#111827",
        color: "#fff",
      });
    } finally {
      setGuardando(false);
    }
  };

  const hayErrores = Object.values(errors).some(Boolean);

  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/80 px-4 py-5 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b111c] text-white shadow-2xl">
        <div className="border-b border-white/10 bg-gradient-to-r from-yellow-400/10 via-white/[0.03] to-emerald-500/10 px-5 py-5 sm:px-6">
          <button
            type="button"
            onClick={cerrar}
            disabled={guardando}
            className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/10 p-2 text-gray-300 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Cerrar"
          >
            <X size={19} />
          </button>

          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-yellow-300">
            <CalendarDays size={13} />
            Solicitud de visita
          </div>

          <h2 className="mt-3 pr-10 text-2xl font-semibold tracking-tight text-white">
            Agendar visita
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Completá tus datos y proponé una fecha para visitar esta
            publicación. El vendedor te contactará para confirmar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="premium-scroll max-h-[75vh] overflow-y-auto p-5 sm:p-6"
          noValidate
        >
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow-300">
              Publicación
            </p>

            <h3 className="mt-2 text-lg font-semibold leading-snug text-white">
              {publicacion.titulo}
            </h3>

            {publicacion.ubicacion && (
              <p className="mt-2 text-sm leading-5 text-slate-400">
                {publicacion.ubicacion}
              </p>
            )}
          </div>

          {hayErrores && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100">
              <div className="flex gap-2">
                <AlertCircle
                  size={18}
                  className="mt-[2px] shrink-0 text-red-300"
                />
                <div>
                  <p className="font-semibold text-red-100">
                    Faltan datos para solicitar la visita.
                  </p>
                  <p className="mt-1 text-red-100/80">
                    Revisá los campos marcados en rojo y completalos para
                    continuar.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <User size={16} className="text-yellow-300" />
                Tu nombre
              </span>

              <input
                type="text"
                value={form.nombreInteresado}
                onChange={(event) =>
                  actualizarCampo("nombreInteresado", event.target.value)
                }
                placeholder="Ej: Juan Pérez"
                aria-invalid={Boolean(errors.nombreInteresado)}
                className={obtenerClaseCampo(Boolean(errors.nombreInteresado))}
              />

              <FieldError mensaje={errors.nombreInteresado} />
            </label>

            <label className="grid gap-2">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Phone size={16} className="text-yellow-300" />
                Tu WhatsApp / teléfono
              </span>

              <input
                type="tel"
                value={form.telefonoInteresado}
                onChange={(event) =>
                  actualizarCampo("telefonoInteresado", event.target.value)
                }
                placeholder="Ej: 0981 123 456"
                aria-invalid={Boolean(errors.telefonoInteresado)}
                className={obtenerClaseCampo(
                  Boolean(errors.telefonoInteresado),
                )}
              />

              <FieldError mensaje={errors.telefonoInteresado} />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <CalendarDays size={16} className="text-yellow-300" />
                  Fecha deseada
                </span>

                <div className="relative">
                  <input
                    type="date"
                    min={fechaMinima}
                    value={form.fechaVisita}
                    onClick={abrirSelectorFecha}
                    onKeyDown={(event) => event.preventDefault()}
                    onPaste={(event) => event.preventDefault()}
                    onChange={(event) =>
                      actualizarCampo("fechaVisita", event.target.value)
                    }
                    aria-invalid={Boolean(errors.fechaVisita)}
                    className={`${obtenerClaseCampo(
                      Boolean(errors.fechaVisita),
                    )} cursor-pointer pr-11`}
                  />

                  <CalendarDays
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-yellow-300/80"
                  />
                </div>

                <FieldError mensaje={errors.fechaVisita} />
              </label>

              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <Clock size={16} className="text-yellow-300" />
                  Hora deseada
                </span>

                <div className="relative">
                  <select
                    value={form.horaVisita}
                    onChange={(event) =>
                      actualizarCampo("horaVisita", event.target.value)
                    }
                    disabled={!form.fechaVisita}
                    aria-invalid={Boolean(errors.horaVisita)}
                    className={obtenerClaseSelect(Boolean(errors.horaVisita))}
                  >
                    <option value="">
                      {form.fechaVisita
                        ? "Seleccioná una hora"
                        : "Primero elegí fecha"}
                    </option>

                    {horarios.map((hora) => (
                      <option key={hora} value={hora}>
                        {hora}
                      </option>
                    ))}
                  </select>

                  <Clock
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-yellow-300/80"
                  />
                </div>

                <FieldError mensaje={errors.horaVisita} />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <MessageCircle size={16} className="text-yellow-300" />
                Mensaje adicional
              </span>

              <textarea
                value={form.mensaje}
                onChange={(event) =>
                  actualizarCampo("mensaje", event.target.value)
                }
                rows={4}
                placeholder="Ej: Me gustaría visitar la propiedad este sábado, si hay disponibilidad."
                className="premium-scroll premium-textarea w-full resize-none rounded-2xl border border-white/10 bg-[#020817] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-yellow-400/60"
              />
            </label>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.07] px-4 py-3.5 text-[13px] leading-6 text-emerald-100/85">
            El vendedor recibirá tu solicitud y te contactará para confirmar si
            la fecha y hora están disponibles.
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={cerrar}
              disabled={guardando}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-yellow-300/30 bg-yellow-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 size={18} />
              {guardando ? "Enviando..." : "Solicitar visita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SolicitarVisitaModal;

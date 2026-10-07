// src/pages/clientes/FormularioInteresado.tsx

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Swal from "sweetalert2";

import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Edit3,
  ExternalLink,
  MessageCircleMore,
  Phone,
  RefreshCw,
  Save,
  UserRoundPlus,
} from "lucide-react";

import {
  actualizarInteresado,
  actualizarSeguimientoInteresado,
  obtenerDetalleInteresado,
  obtenerMensajeErrorClientes,
  registrarInteresado,
} from "../../api/clientesService";

import {
  Interesado,
  InteresadoDetalle,
  InteresadoRequest,
  Seguimiento,
} from "../../types/clientes";

interface Props {
  seleccionado: Interesado | null;
  setSeleccionado: (i: Interesado | null) => void;
  setRecargarLista: (v: boolean) => void;
  seguimientos: Seguimiento[];
  setSeguimientos: (v: Seguimiento[]) => void;
}

const estadoLabel = (estado?: string | null) => {
  switch (estado) {
    case "CONSULTANDO":
      return "Consultando";
    case "ESPERANDO_MODELO":
      return "Esperando modelo";
    case "CONSULTA_PROMO":
      return "Consultó promoción";
    case "COTIZADO":
      return "Cotizado";
    case "PENDIENTE_ASESOR":
      return "Pendiente de asesor";
    case "CREDITO_EN_PROCESO":
      return "Crédito en proceso";
    case "CONTADO_EN_PROCESO":
      return "Contado en proceso";
    case "DERIVADO_HUMANO":
      return "Atención humana";
    case "CERRADO":
      return "Cerrado";
    case "SIN_RESPUESTA":
      return "Sin respuesta";
    case "REGISTRADO":
      return "Registrado";
    default:
      return estado?.replaceAll("_", " ") || "Sin etapa";
  }
};

const fechaHora = (fecha?: string | null) => {
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

const aInputFechaHora = (fecha?: string | null) => {
  if (!fecha) {
    return "";
  }

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "";
  }

  const local = new Date(
    valor.getTime() - valor.getTimezoneOffset() * 60_000,
  );

  return local.toISOString().slice(0, 16);
};

const aFechaSimple = (fecha?: string | null) => {
  if (!fecha) {
    return "";
  }

  return fecha.slice(0, 10);
};

const formularioVacio = (): InteresadoRequest => ({
  nombre: "",
  telefono: "",
  email: "",
  ciudad: "",
  productoInteres: "",
  fechaProximoContacto: "",
  descripcion: "",
  aportaIPS: false,
  cantidadAportes: 0,
  archivoConversacion: null,
  estado: "Activo",
});

const FormularioInteresado: React.FC<Props> = ({
  seleccionado,
  setSeleccionado,
  setRecargarLista,
  seguimientos,
  setSeguimientos,
}) => {
  const [detalle, setDetalle] =
    useState<InteresadoDetalle | null>(null);

  const [cargandoDetalle, setCargandoDetalle] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  const [formInteresado, setFormInteresado] =
    useState<Partial<Interesado>>(
      formularioVacio(),
    );

  const [fechaSeguimiento, setFechaSeguimiento] =
    useState("");

  const [motivoSeguimiento, setMotivoSeguimiento] =
    useState("");

  const [comentarioSeguimiento, setComentarioSeguimiento] =
    useState("");

  const [requiereSeguimiento, setRequiereSeguimiento] =
    useState(true);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const cargarDetalle = async (
    idInteresado: number,
  ) => {
    setCargandoDetalle(true);

    try {
      const data =
        await obtenerDetalleInteresado(
          idInteresado,
        );

      setDetalle(data);
      setSeguimientos(data.seguimientos || []);

      setFormInteresado({
        ...data.interesado,

        estado:
          data.interesado.estado ||
          "Activo",

        fechaProximoContacto:
          aFechaSimple(
            data.interesado.fechaProximoContacto,
          ),
      });

      setFechaSeguimiento(
        aInputFechaHora(
          data.interesado.fechaProximoContacto,
        ),
      );

      setMotivoSeguimiento(
        data.interesado.motivoSeguimiento ||
          "",
      );

      setRequiereSeguimiento(
        data.interesado.requiereSeguimiento ??
          true,
      );
    } catch (error) {
      Swal.fire(
        "No se pudo cargar",
        obtenerMensajeErrorClientes(
          error,
          "No se pudo obtener el detalle del cliente.",
        ),
        "error",
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  useEffect(() => {
    if (seleccionado) {
      void cargarDetalle(seleccionado.id);
      return;
    }

    setDetalle(null);
    setSeguimientos([]);
    setFormInteresado(formularioVacio());
    setFechaSeguimiento("");
    setMotivoSeguimiento("");
    setComentarioSeguimiento("");
    setRequiereSeguimiento(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [seleccionado]);

  const limpiarFormulario = () => {
    setSeleccionado(null);
  };

  const nombreModeloActual = useMemo(() => {
    const interesado =
      detalle?.interesado ||
      seleccionado;

    if (!interesado) {
      return "—";
    }

    const modelo = [
      interesado.marcaInteres,
      interesado.modeloInteres,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return (
      modelo ||
      interesado.productoInteres ||
      "Sin modelo definido"
    );
  }, [detalle, seleccionado]);

  const guardarInteresado = async () => {
    if (!formInteresado.nombre?.trim()) {
      Swal.fire(
        "Atención",
        "Indicá el nombre del interesado.",
        "warning",
      );
      return;
    }

    if (
      formInteresado.aportaIPS &&
      !formInteresado.cantidadAportes
    ) {
      Swal.fire(
        "Atención",
        "Indicá la cantidad de aportes de IPS.",
        "warning",
      );
      return;
    }

    setGuardando(true);

    try {
      if (seleccionado) {
        await actualizarInteresado({
          ...seleccionado,
          ...formInteresado,
          id: seleccionado.id,
          nombre: formInteresado.nombre.trim(),
          aportaIPS:
            Boolean(formInteresado.aportaIPS),
          cantidadAportes:
            Number(
              formInteresado.cantidadAportes ||
                0,
            ),
          estado:
            formInteresado.estado ||
            "Activo",
          requiereSeguimiento:
            seleccionado.requiereSeguimiento,
          cantidadInteracciones:
            seleccionado.cantidadInteracciones ||
            0,
          sinRespuesta:
            seleccionado.sinRespuesta,
          seguimientoVencido:
            seleccionado.seguimientoVencido,
        } as Interesado);

        await cargarDetalle(seleccionado.id);

        Swal.fire({
          icon: "success",
          title: "Datos actualizados",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await registrarInteresado({
          ...formularioVacio(),
          ...formInteresado,
          nombre:
            formInteresado.nombre.trim(),
          aportaIPS:
            Boolean(formInteresado.aportaIPS),
          cantidadAportes:
            Number(
              formInteresado.cantidadAportes ||
                0,
            ),
          estado:
            formInteresado.estado ||
            "Activo",
        } as InteresadoRequest);

        Swal.fire({
          icon: "success",
          title: "Interesado registrado",
          timer: 1500,
          showConfirmButton: false,
        });

        limpiarFormulario();
      }

      setRecargarLista(true);
    } catch (error) {
      Swal.fire(
        "No se pudo guardar",
        obtenerMensajeErrorClientes(error),
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  const guardarSeguimiento = async () => {
    if (!seleccionado) {
      return;
    }

    setGuardando(true);

    try {
      await actualizarSeguimientoInteresado(
        seleccionado.id,
        {
          fechaProximoContacto:
            fechaSeguimiento ||
            null,

          requiereSeguimiento,

          motivoSeguimiento:
            motivoSeguimiento.trim() ||
            null,

          estadoConsulta:
            detalle?.interesado.estadoConsulta ||
            seleccionado.estadoConsulta ||
            null,

          comentario:
            comentarioSeguimiento.trim() ||
            null,
        },
      );

      await cargarDetalle(
        seleccionado.id,
      );

      setComentarioSeguimiento("");
      setRecargarLista(true);

      Swal.fire({
        icon: "success",
        title: "Seguimiento guardado",
        text: requiereSeguimiento
          ? "La oportunidad quedó programada para seguimiento."
          : "El cliente quedó sin seguimiento pendiente.",
        timer: 1700,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire(
        "No se pudo actualizar",
        obtenerMensajeErrorClientes(error),
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  if (
    seleccionado &&
    cargandoDetalle &&
    !detalle
  ) {
    return (
      <main className="flex-1 min-w-0 p-6 grid place-items-center bg-gray-950">
        <div className="text-gray-400 flex items-center gap-2">
          <RefreshCw
            size={18}
            className="animate-spin"
          />
          Cargando información del cliente...
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-gray-950">
      <div className="p-4 md:p-5 space-y-4">
        {!seleccionado ? (
          <>
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-yellow-400/10 text-yellow-300 grid place-items-center">
                  <UserRoundPlus size={20} />
                </div>

                <div>
                  <h3 className="font-bold text-lg">
                    Registrar nuevo interesado
                  </h3>
                  <p className="text-sm text-gray-500">
                    Esta carga manual convive con los clientes que Panambí registra automáticamente desde WhatsApp.
                  </p>
                </div>
              </div>

              <FormularioDatos
                form={formInteresado}
                setForm={setFormInteresado}
                fileInputRef={fileInputRef}
              />

              <button
                type="button"
                onClick={guardarInteresado}
                disabled={guardando}
                className="mt-4 w-full h-11 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <Save size={17} />
                Registrar interesado
              </button>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 text-sm text-gray-400">
              <strong className="text-white">
                Los clientes de WhatsApp aparecen solos.
              </strong>{" "}
              Seleccioná uno desde la lista de la izquierda para ver qué moto consultó, el último mensaje, el historial de conversación y programar el próximo seguimiento.
            </div>
          </>
        ) : (
          <>
            <section className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
              <div className="p-4 md:p-5 border-b border-gray-800 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-bold truncate">
                      {detalle?.interesado.nombre ||
                        seleccionado.nombre}
                    </h2>

                    <EstadoBadge
                      interesado={
                        detalle?.interesado ||
                        seleccionado
                      }
                    />
                  </div>

                  <div className="text-yellow-300 font-semibold mt-1">
                    {nombreModeloActual}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                    <span>
                      Origen:{" "}
                      {detalle?.interesado.origen ||
                        seleccionado.origen ||
                        "—"}
                    </span>

                    <span>
                      Última interacción:{" "}
                      {fechaHora(
                        detalle?.interesado.fechaUltimaInteraccion ||
                          seleccionado.fechaUltimaInteraccion,
                      )}
                    </span>

                    {(detalle?.interesado.codigoReferencia ||
                      seleccionado.codigoReferencia) && (
                      <span>
                        Ref.{" "}
                        {detalle?.interesado.codigoReferencia ||
                          seleccionado.codigoReferencia}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(detalle?.interesado.telefono ||
                    seleccionado.telefono) && (
                    <a
                      href={`https://wa.me/${String(
                        detalle?.interesado.telefono ||
                          seleccionado.telefono,
                      ).replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-sm font-semibold inline-flex items-center gap-2"
                    >
                      <Phone size={16} />
                      WhatsApp
                      <ExternalLink size={13} />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={limpiarFormulario}
                    className="px-3 py-2 rounded-lg border border-gray-700 text-gray-300 text-sm"
                  >
                    Nuevo cliente
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-px bg-gray-800">
                <InfoMini
                  label="Teléfono / ID"
                  value={
                    detalle?.interesado.telefono ||
                    seleccionado.telefono ||
                    detalle?.interesado.identificadorExterno ||
                    seleccionado.identificadorExterno ||
                    "—"
                  }
                />

                <InfoMini
                  label="Etapa"
                  value={estadoLabel(
                    detalle?.interesado.estadoGestion ||
                      detalle?.interesado.estadoConsulta ||
                      seleccionado.estadoGestion ||
                      seleccionado.estadoConsulta,
                  )}
                />

                <InfoMini
                  label="Próximo contacto"
                  value={fechaHora(
                    detalle?.interesado.fechaProximoContacto ||
                      seleccionado.fechaProximoContacto,
                  )}
                />

                <InfoMini
                  label="Interacciones"
                  value={String(
                    detalle?.interesado.cantidadInteracciones ??
                      seleccionado.cantidadInteracciones ??
                      0,
                  )}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-yellow-400/25 bg-yellow-400/[0.04] p-4 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <CalendarClock
                  size={18}
                  className="text-yellow-300"
                />

                <div>
                  <h3 className="font-bold">
                    Próximo seguimiento
                  </h3>
                  <p className="text-xs text-gray-500">
                    Programá cuándo volver a contactar al cliente y dejá una nota para el vendedor.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs text-gray-400">
                    Fecha y hora
                  </span>

                  <input
                    type="datetime-local"
                    value={fechaSeguimiento}
                    onChange={(event) =>
                      setFechaSeguimiento(
                        event.target.value,
                      )
                    }
                    className="w-full h-10 rounded-lg bg-gray-950 border border-gray-700 px-3 text-sm focus:outline-none focus:border-yellow-400"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs text-gray-400">
                    Motivo
                  </span>

                  <input
                    value={motivoSeguimiento}
                    onChange={(event) =>
                      setMotivoSeguimiento(
                        event.target.value,
                      )
                    }
                    placeholder="Ej.: Volver a consultar si consiguió garante"
                    className="w-full h-10 rounded-lg bg-gray-950 border border-gray-700 px-3 text-sm focus:outline-none focus:border-yellow-400"
                  />
                </label>

                <label className="md:col-span-2 space-y-1">
                  <span className="text-xs text-gray-400">
                    Nota de seguimiento
                  </span>

                  <textarea
                    rows={3}
                    value={comentarioSeguimiento}
                    onChange={(event) =>
                      setComentarioSeguimiento(
                        event.target.value,
                      )
                    }
                    placeholder="Ej.: Hablé con el cliente. Me pidió que lo contacte el jueves por la tarde."
                    className="w-full rounded-lg bg-gray-950 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
                  />
                </label>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={requiereSeguimiento}
                    onChange={(event) =>
                      setRequiereSeguimiento(
                        event.target.checked,
                      )
                    }
                    className="accent-yellow-400"
                  />
                  Mantener pendiente de seguimiento
                </label>

                <button
                  type="button"
                  onClick={guardarSeguimiento}
                  disabled={guardando}
                  className="px-4 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={17} />
                  Guardar seguimiento
                </button>
              </div>
            </section>

            <div className="grid 2xl:grid-cols-2 gap-4">
              <section className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList
                    size={18}
                    className="text-sky-300"
                  />
                  <h3 className="font-bold">
                    Modelos consultados
                  </h3>
                </div>

                {detalle?.consultasMoto?.length ? (
                  <div className="space-y-3">
                    {detalle.consultasMoto.map(
                      (consulta) => (
                        <div
                          key={consulta.id}
                          className="rounded-xl border border-gray-800 bg-gray-950/70 p-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-yellow-300">
                                {[
                                  consulta.marca,
                                  consulta.modelo,
                                ]
                                  .filter(Boolean)
                                  .join(" ") ||
                                  "Modelo no definido"}
                              </div>

                              {consulta.codigoReferencia && (
                                <div className="text-[11px] text-gray-500 mt-0.5">
                                  Ref.{" "}
                                  {
                                    consulta.codigoReferencia
                                  }
                                </div>
                              )}
                            </div>

                            <span className="text-[10px] px-2 py-1 rounded-full border border-gray-700 text-gray-400">
                              {estadoLabel(
                                consulta.estadoConsulta,
                              )}
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 mt-2">
                            {consulta.tipoConsulta?.replaceAll(
                              "_",
                              " ",
                            ) || "Consulta"}{" "}
                            ·{" "}
                            {fechaHora(
                              consulta.fechaUltimaConsulta,
                            )}
                          </div>

                          {consulta.ultimoMensajeCliente && (
                            <div className="mt-2 text-sm text-gray-300">
                              <span className="text-gray-500">
                                Cliente:
                              </span>{" "}
                              {
                                consulta.ultimoMensajeCliente
                              }
                            </div>
                          )}

                          {consulta.ultimaRespuesta && (
                            <div className="mt-1 text-sm text-gray-500">
                              <span>Panambí:</span>{" "}
                              {consulta.ultimaRespuesta}
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <Vacio texto="Todavía no hay modelos vinculados a este interesado." />
                )}
              </section>

              <section className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircleMore
                    size={18}
                    className="text-emerald-300"
                  />
                  <h3 className="font-bold">
                    Última conversación
                  </h3>
                </div>

                {detalle?.ultimosMensajes?.length ? (
                  <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                    {detalle.ultimosMensajes.map(
                      (mensaje, indice) => {
                        const esCliente =
                          mensaje.emisor?.toUpperCase() ===
                          "CLIENTE";

                        return (
                          <div
                            key={`${mensaje.fecha}-${indice}`}
                            className={`flex ${
                              esCliente
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                                esCliente
                                  ? "bg-emerald-900/60 border border-emerald-700/40 text-gray-100"
                                  : "bg-gray-950 border border-gray-800 text-gray-300"
                              }`}
                            >
                              <div className="text-[10px] uppercase tracking-wide opacity-60 mb-1">
                                {esCliente
                                  ? "Cliente"
                                  : "Panambí"}
                              </div>

                              <div className="whitespace-pre-wrap break-words">
                                {mensaje.mensaje}
                              </div>

                              <div className="text-[10px] opacity-50 mt-1 text-right">
                                {fechaHora(
                                  mensaje.fecha,
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <Vacio texto="No hay conversación disponible para este registro." />
                )}
              </section>
            </div>

            <section className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock3
                  size={18}
                  className="text-yellow-300"
                />
                <h3 className="font-bold">
                  Historial de seguimiento
                </h3>
              </div>

              {seguimientos.length ? (
                <div className="space-y-3">
                  {seguimientos.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3"
                    >
                      <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-yellow-400 shrink-0" />

                      <div>
                        <p className="text-sm text-gray-300">
                          {item.comentario}
                        </p>

                        <div className="text-xs text-gray-500 mt-1">
                          {fechaHora(item.fecha)}
                          {item.usuario
                            ? ` · ${item.usuario}`
                            : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Vacio texto="Todavía no hay seguimientos manuales registrados." />
              )}
            </section>

            <section className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
              <details>
                <summary className="cursor-pointer list-none flex items-center gap-2 font-bold">
                  <Edit3
                    size={17}
                    className="text-gray-400"
                  />
                  Editar datos del cliente
                  <span className="text-xs font-normal text-gray-500">
                    (opcional)
                  </span>
                </summary>

                <div className="mt-4">
                  <FormularioDatos
                    form={formInteresado}
                    setForm={setFormInteresado}
                    fileInputRef={fileInputRef}
                  />

                  <button
                    type="button"
                    onClick={guardarInteresado}
                    disabled={guardando}
                    className="mt-4 w-full h-11 rounded-lg border border-yellow-400/40 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    <Save size={17} />
                    Actualizar datos
                  </button>
                </div>
              </details>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

interface FormularioDatosProps {
  form: Partial<Interesado>;
  setForm: React.Dispatch<
    React.SetStateAction<
      Partial<Interesado>
    >
  >;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const FormularioDatos: React.FC<FormularioDatosProps> = ({
  form,
  setForm,
  fileInputRef,
}) => (
  <div className="grid sm:grid-cols-2 gap-3">
    <Campo
      label="Nombre"
      value={form.nombre || ""}
      onChange={(value) =>
        setForm((actual) => ({
          ...actual,
          nombre: value,
        }))
      }
    />

    <Campo
      label="Teléfono"
      value={form.telefono || ""}
      onChange={(value) =>
        setForm((actual) => ({
          ...actual,
          telefono: value,
        }))
      }
    />

    <Campo
      label="Email"
      type="email"
      value={form.email || ""}
      onChange={(value) =>
        setForm((actual) => ({
          ...actual,
          email: value,
        }))
      }
    />

    <Campo
      label="Ciudad"
      value={form.ciudad || ""}
      onChange={(value) =>
        setForm((actual) => ({
          ...actual,
          ciudad: value,
        }))
      }
    />

    <Campo
      label="Producto de interés"
      value={form.productoInteres || ""}
      onChange={(value) =>
        setForm((actual) => ({
          ...actual,
          productoInteres: value,
        }))
      }
    />

    <Campo
      label="Fecha próximo contacto"
      type="date"
      value={form.fechaProximoContacto || ""}
      onChange={(value) =>
        setForm((actual) => ({
          ...actual,
          fechaProximoContacto: value,
        }))
      }
    />

    <div className="sm:col-span-2 flex flex-wrap items-center gap-4 rounded-xl border border-gray-800 bg-gray-950/50 p-3">
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(form.aportaIPS)}
          onChange={(event) =>
            setForm((actual) => ({
              ...actual,
              aportaIPS: event.target.checked,
              cantidadAportes:
                event.target.checked
                  ? actual.cantidadAportes || 0
                  : 0,
            }))
          }
          className="accent-yellow-400"
        />
        Aporta IPS
      </label>

      {form.aportaIPS && (
        <label className="inline-flex items-center gap-2 text-sm">
          <span className="text-gray-400">
            Aportes:
          </span>

          <input
            type="number"
            min={0}
            value={form.cantidadAportes ?? 0}
            onChange={(event) =>
              setForm((actual) => ({
                ...actual,
                cantidadAportes:
                  Number(event.target.value) ||
                  0,
              }))
            }
            className="w-24 h-9 rounded bg-gray-900 border border-gray-700 px-2"
          />
        </label>
      )}

      <label className="inline-flex items-center gap-2 text-sm ml-auto">
        <span className="text-gray-400">
          Registro activo
        </span>

        <input
          type="checkbox"
          checked={form.estado !== "Inactivo"}
          onChange={(event) =>
            setForm((actual) => ({
              ...actual,
              estado: event.target.checked
                ? "Activo"
                : "Inactivo",
            }))
          }
          className="accent-yellow-400"
        />
      </label>
    </div>

    <div className="sm:col-span-2">
      <label className="text-xs text-gray-400">
        Archivo de conversación
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/*"
        onChange={(event) =>
          setForm((actual) => ({
            ...actual,
            archivoConversacion:
              event.target.files?.[0] ||
              null,
          }))
        }
        className="mt-1 block w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-yellow-50 file:text-yellow-800 file:font-semibold"
      />

      {form.archivoUrl && (
        <a
          href={form.archivoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm text-yellow-300"
        >
          Ver archivo existente
          <ExternalLink size={13} />
        </a>
      )}
    </div>

    <label className="sm:col-span-2 space-y-1">
      <span className="text-xs text-gray-400">
        Descripción
      </span>

      <textarea
        rows={3}
        value={form.descripcion || ""}
        onChange={(event) =>
          setForm((actual) => ({
            ...actual,
            descripcion: event.target.value,
          }))
        }
        className="w-full rounded-lg bg-gray-950 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
      />
    </label>
  </div>
);

interface CampoProps {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}

const Campo: React.FC<CampoProps> = ({
  label,
  value,
  type = "text",
  onChange,
}) => (
  <label className="space-y-1">
    <span className="text-xs text-gray-400">
      {label}
    </span>

    <input
      type={type}
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="w-full h-10 rounded-lg bg-gray-950 border border-gray-700 px-3 text-sm focus:outline-none focus:border-yellow-400"
    />
  </label>
);

const InfoMini: React.FC<{
  label: string;
  value: string;
}> = ({
  label,
  value,
}) => (
  <div className="bg-gray-900 p-3">
    <div className="text-[10px] uppercase tracking-wide text-gray-500">
      {label}
    </div>
    <div className="text-sm font-semibold mt-1 break-words">
      {value}
    </div>
  </div>
);

const EstadoBadge: React.FC<{
  interesado: Interesado;
}> = ({
  interesado,
}) => {
  const esSinRespuesta =
    interesado.sinRespuesta;

  const texto =
    esSinRespuesta
      ? "Sin respuesta"
      : estadoLabel(
          interesado.estadoGestion ||
            interesado.estadoConsulta,
        );

  const clase =
    esSinRespuesta
      ? "border-red-400/40 bg-red-400/10 text-red-300"
      : interesado.seguimientoVencido
        ? "border-orange-400/40 bg-orange-400/10 text-orange-300"
        : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";

  return (
    <span
      className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${clase}`}
    >
      {texto}
    </span>
  );
};

const Vacio: React.FC<{
  texto: string;
}> = ({
  texto,
}) => (
  <div className="py-8 text-center text-sm text-gray-500">
    {texto}
  </div>
);

export default FormularioInteresado;

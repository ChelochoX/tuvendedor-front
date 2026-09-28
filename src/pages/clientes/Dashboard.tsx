import React, { useCallback, useEffect, useMemo, useState } from "react";



import MenuIcon from "@mui/icons-material/Menu";



import CloseIcon from "@mui/icons-material/Close";



import SearchIcon from "@mui/icons-material/Search";



import RefreshIcon from "@mui/icons-material/Refresh";



import VisibilityIcon from "@mui/icons-material/Visibility";



import CheckCircleIcon from "@mui/icons-material/CheckCircle";



import PendingActionsIcon from "@mui/icons-material/PendingActions";



import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";



import BadgeIcon from "@mui/icons-material/Badge";



import PhoneIcon from "@mui/icons-material/Phone";



import HomeIcon from "@mui/icons-material/Home";



import WorkIcon from "@mui/icons-material/Work";



import DescriptionIcon from "@mui/icons-material/Description";



import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";



import HistoryIcon from "@mui/icons-material/History";



import OpenInNewIcon from "@mui/icons-material/OpenInNew";



import Swal from "sweetalert2";



import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";



import ChevronRightIcon from "@mui/icons-material/ChevronRight";



import Panel from "./Panel";



import {

  cambiarEstadoSolicitudCreditoMoto,

  listarSolicitudesCreditoMoto,

  obtenerDocumentoCreditoMoto,

  obtenerMensajeError,

  obtenerSolicitudCreditoMoto,


} from "../../api/creditoMotoGestionService";



import {

  CreditoMotoGestionDetalle,

  CreditoMotoGestionLista,

  EstadoControlCredito,

} from "../../types/creditoMotoGestion";



const filtrosEstado: Array<{
  value: EstadoControlCredito | "TODOS";
  label: string;
}> = [
  {
    value: "TODOS",
    label: "Todas",
  },
  {
    value: "PENDIENTE_ENVIO",
    label: "Pendientes de envío",
  },
  {
    value: "ENVIADA_EMPRESA",
    label: "Enviadas",
  },
];


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



const formatearFechaCorta = (fecha?: string | null) => {

  if (!fecha) {

    return "—";

  }



  const valor = new Date(fecha);



  if (Number.isNaN(valor.getTime())) {

    return "—";

  }



  return valor.toLocaleDateString("es-PY");

};



const estadoLabel = (estado?: string | null) => {
  switch (estado) {
    case "PENDIENTE_ENVIO":
      return "Pendiente de envío";

    case "ENVIADA_EMPRESA":
      return "Enviada a la empresa";

    default:
      return estado || "Sin estado";
  }
};


const estadoClasses = (estado?: string | null) => {
  switch (estado) {
    case "PENDIENTE_ENVIO":
      return "border-yellow-400/40 bg-yellow-400/10 text-yellow-300";

    case "ENVIADA_EMPRESA":
      return "border-emerald-400/40 bg-emerald-400/10 text-emerald-300";

    default:
      return "border-gray-500/40 bg-gray-500/10 text-gray-300";
  }
};


const campo = (valor?: string | number | null) =>

  valor === null || valor === undefined || valor === "" ? "—" : String(valor);



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

  const fechaCorta = fecha.toLocaleDateString("es-PY", {

    day: "2-digit",

    month: "2-digit",

    year: "numeric",

  });



  if (esHoy(fecha)) {

    return `HOY · ${fechaCorta}`;

  }



  const diaSemana = fecha

    .toLocaleDateString("es-PY", {

      weekday: "long",

    })

    .toUpperCase();



  return `${diaSemana} · ${fechaCorta}`;

};



const Dashboard: React.FC = () => {

  const [menuOpen, setMenuOpen] = useState(false);



  const [solicitudes, setSolicitudes] = useState<CreditoMotoGestionLista[]>([]);



  const [estado, setEstado] = useState<EstadoControlCredito | "TODOS">("TODOS");



  const [buscar, setBuscar] = useState("");



  const [busquedaAplicada, setBusquedaAplicada] = useState("");



  const [cargando, setCargando] = useState(true);



  const [detalle, setDetalle] = useState<CreditoMotoGestionDetalle | null>(

    null,

  );



  const [cargandoDetalle, setCargandoDetalle] = useState(false);



  const [procesandoAccion, setProcesandoAccion] = useState(false);



  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(() =>

    obtenerInicioHoy(),

  );



  // =========================================================

  // CARGAR BANDEJA

  // =========================================================



  const cargarSolicitudes = useCallback(async () => {

    setCargando(true);



    try {

      const data = await listarSolicitudesCreditoMoto(

        "TODOS",

        busquedaAplicada || undefined,



        formatearFechaApi(fechaSeleccionada),

      );



      setSolicitudes(data);

    } catch (error) {

      Swal.fire("Error", obtenerMensajeError(error), "error");

    } finally {

      setCargando(false);

    }

  }, [busquedaAplicada, fechaSeleccionada]);



  useEffect(() => {

    cargarSolicitudes();

  }, [cargarSolicitudes]);



  // =========================================================

  // FILTRO LOCAL

  // =========================================================



  const solicitudesFiltradas = useMemo(() => {

    if (estado === "TODOS") {

      return solicitudes;

    }



    return solicitudes.filter((item) => item.estadoControl === estado);

  }, [solicitudes, estado]);



  // =========================================================
// CONTADORES
// =========================================================

  const resumen = useMemo(() => {
    return solicitudes.reduce(
      (acc, item) => {
        if (item.estadoControl === "PENDIENTE_ENVIO") {
          acc.pendientes += 1;
        }

        if (item.estadoControl === "ENVIADA_EMPRESA") {
          acc.enviadas += 1;
        }

        return acc;
      },
      {
        pendientes: 0,
        enviadas: 0,
      },
    );
  }, [solicitudes]);


  // =========================================================

  // DETALLE

  // =========================================================



  const abrirDetalle = async (idSolicitudCredito: number) => {

    setCargandoDetalle(true);



    setDetalle(null);



    try {

      const data = await obtenerSolicitudCreditoMoto(idSolicitudCredito);



      setDetalle(data);

    } catch (error) {

      Swal.fire("Error", obtenerMensajeError(error), "error");

    } finally {

      setCargandoDetalle(false);

    }

  };



  // =========================================================

  // CAMBIO DE ESTADO

  // =========================================================



  const cambiarEstado = async (

    nuevoEstado: EstadoControlCredito,



    observacion: string,



    mensajeOk: string,

  ) => {

    if (!detalle) {

      return;

    }



    setProcesandoAccion(true);



    try {

      const actualizada = await cambiarEstadoSolicitudCreditoMoto(

        detalle.idSolicitudCredito,

        {

          estado: nuevoEstado,



          observacion,

        },

      );



      setDetalle(actualizada);



      await cargarSolicitudes();



      Swal.fire({

        icon: "success",



        title: "Listo",



        text: mensajeOk,



        timer: 1600,



        showConfirmButton: false,

      });

    } catch (error) {

      Swal.fire("No se pudo actualizar", obtenerMensajeError(error), "error");

    } finally {

      setProcesandoAccion(false);

    }

  };



    // =========================================================
  // MARCAR COMO ENVIADA A LA EMPRESA
  // =========================================================

  const marcarEnviadaEmpresa = async () => {
    if (!detalle) {
      return;
    }

    const resultado = await Swal.fire({
      icon: "question",
      title: "¿Marcar como enviada?",
      text:
        "Confirmá esta acción una vez que la solicitud y sus documentos fueron enviados a la empresa para la evaluación real del crédito.",
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

    await cambiarEstado(
      "ENVIADA_EMPRESA",
      resultado.value?.trim() ||
        "Solicitud enviada a la empresa para evaluación de crédito.",
      "Solicitud marcada como enviada a la empresa.",
    );
  };


// =========================================================

  // DOCUMENTO

  // =========================================================



  const abrirDocumento = async (idDocumento: number) => {

    if (!detalle) {

      return;

    }



    try {

      const blob = await obtenerDocumentoCreditoMoto(

        detalle.idSolicitudCredito,

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



  // =========================================================

  // BUSCAR

  // =========================================================



  const ejecutarBusqueda = (event?: React.FormEvent) => {

    event?.preventDefault();



    setBusquedaAplicada(buscar.trim());

  };



  // =========================================================
  // NAVEGACION POR FECHA
  // =========================================================

  const moverFecha = (cantidadDias: number) => {
    setFechaSeleccionada((fechaActual) => {
      const nuevaFecha = new Date(fechaActual);

      nuevaFecha.setDate(
        nuevaFecha.getDate() + cantidadDias,
      );

      nuevaFecha.setHours(
        0,
        0,
        0,
        0,
      );

      const hoy = obtenerInicioHoy();

      // No permitimos navegar al futuro.
      if (nuevaFecha > hoy) {
        return fechaActual;
      }

      return nuevaFecha;
    });
  };

  const irAHoy = () => {
    setFechaSeleccionada(
      obtenerInicioHoy(),
    );
  };

  return (

    <div className="flex h-screen bg-gray-950 text-white relative">

      {/* =====================================================

          MENU LATERAL

         ===================================================== */}



      <aside

        className={`

          fixed md:static

          top-0 left-0

          h-full

          w-64

          bg-gray-900

          border-r

          border-yellow-400

          p-4

          transform

          ${menuOpen ? "translate-x-0" : "-translate-x-full"}

          md:translate-x-0

          transition-transform

          duration-300

          z-40

        `}

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

          className="

            absolute

            top-4

            left-4

            md:hidden

            z-30

            bg-yellow-400

            text-black

            rounded

            p-1

            shadow-md

          "

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



      {/* =====================================================

          CONTENIDO

         ===================================================== */}



      <main

        className="

          flex-1

          min-w-0

          overflow-auto

          p-4

          md:p-6

          mt-14

          md:mt-0

        "

      >

        <div className="max-w-[1500px] mx-auto">

          {/* TITULO */}



          <div

            className="

              flex

              flex-col

              lg:flex-row

              lg:items-end

              lg:justify-between

              gap-4

              mb-6

            "

          >

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400/80 mb-1">

                Gestión de clientes

              </p>



              <h1 className="text-2xl md:text-3xl font-bold text-white">

                Solicitudes de crédito

              </h1>



              <p className="text-gray-400 mt-2 max-w-3xl">

                Revisá las solicitudes recibidas por Panambí, consultá los datos

                y documentos del cliente y registrá el seguimiento de la

                evaluación.

              </p>

            </div>



            <button

              onClick={cargarSolicitudes}

              disabled={cargando}

              className="

                inline-flex

                items-center

                justify-center

                gap-2

                px-4

                py-2.5

                rounded-lg

                border

                border-gray-700

                bg-gray-900

                hover:border-yellow-400

                hover:text-yellow-300

                transition

                disabled:opacity-50

              "

            >

              <RefreshIcon fontSize="small" />

              Actualizar

            </button>

          </div>



          {/* =================================================
              NAVEGACION POR FECHA
             ================================================= */}

          <div
            className="
              mb-5
              flex
              flex-wrap
              items-center
              justify-center
              gap-2
            "
          >
            <button
              type="button"
              onClick={() => moverFecha(-1)}
              title="Día anterior"
              className="
                h-10
                w-10
                rounded-lg
                border
                border-gray-700
                bg-gray-900
                text-yellow-300
                grid
                place-items-center
                hover:border-yellow-400
                hover:bg-gray-800
                transition
              "
            >
              <ChevronLeftIcon />
            </button>

            <div
              className="
                min-w-[215px]
                h-10
                px-4
                rounded-lg
                border
                border-yellow-400/40
                bg-gray-900
                flex
                items-center
                justify-center
                text-sm
                font-bold
                tracking-wide
                text-yellow-300
              "
            >
              {formatearFechaSelector(
                fechaSeleccionada,
              )}
            </div>

            <button
              type="button"
              onClick={() => moverFecha(1)}
              disabled={esHoy(
                fechaSeleccionada,
              )}
              title="Día siguiente"
              className="
                h-10
                w-10
                rounded-lg
                border
                border-gray-700
                bg-gray-900
                text-yellow-300
                grid
                place-items-center
                hover:border-yellow-400
                hover:bg-gray-800
                transition
                disabled:opacity-30
                disabled:cursor-not-allowed
                disabled:hover:border-gray-700
                disabled:hover:bg-gray-900
              "
            >
              <ChevronRightIcon />
            </button>

            {!esHoy(
              fechaSeleccionada,
            ) && (
              <button
                type="button"
                onClick={irAHoy}
                className="
                  h-10
                  px-4
                  rounded-lg
                  bg-yellow-400
                  text-black
                  text-sm
                  font-bold
                  hover:bg-yellow-300
                  transition
                "
              >
                Hoy
              </button>
            )}
          </div>

          {/* =================================================
              RESUMEN
             ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6">
            <ResumenCard
              label="Pendientes de envío"
              value={resumen.pendientes}
              icon={<PendingActionsIcon />}
              className="text-yellow-300"
            />

            <ResumenCard
              label="Enviadas a la empresa"
              value={resumen.enviadas}
              icon={<CheckCircleIcon />}
              className="text-emerald-300"
            />
          </div>


          {/* =================================================

              TABLA

             ================================================= */}



          <div

            className="

              bg-gray-900

              border

              border-gray-800

              rounded-2xl

              overflow-hidden

              shadow-xl

            "

          >

            {/* FILTROS */}



            <div

              className="

                p-4

                border-b

                border-gray-800

                flex

                flex-col

                xl:flex-row

                gap-3

                xl:items-center

                xl:justify-between

              "

            >

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 xl:pb-0">

                {filtrosEstado.map((filtro) => (

                  <button

                    key={filtro.value}

                    onClick={() => setEstado(filtro.value)}

                    className={`

                        whitespace-nowrap

                        px-3

                        py-2

                        rounded-lg

                        text-sm

                        font-semibold

                        border

                        transition

                        ${

                          estado === filtro.value

                            ? "bg-yellow-400 border-yellow-400 text-black"

                            : "bg-gray-950 border-gray-700 text-gray-300 hover:border-yellow-400/60"

                        }

                      `}

                  >

                    {filtro.label}

                  </button>

                ))}

              </div>



              <form

                onSubmit={ejecutarBusqueda}

                className="flex w-full xl:w-[430px]"

              >

                <div className="relative flex-1">

                  <SearchIcon

                    fontSize="small"

                    className="

                      absolute

                      left-3

                      top-1/2

                      -translate-y-1/2

                      text-gray-500

                    "

                  />



                  <input

                    value={buscar}

                    onChange={(e) => setBuscar(e.target.value)}

                    placeholder="Nombre, CI, teléfono, marca o modelo..."

                    className="

                      w-full

                      bg-gray-950

                      border

                      border-gray-700

                      rounded-l-lg

                      py-2.5

                      pl-10

                      pr-3

                      text-sm

                      outline-none

                      focus:border-yellow-400

                    "

                  />

                </div>



                <button

                  type="submit"

                  className="

                    px-4

                    rounded-r-lg

                    bg-yellow-400

                    text-black

                    font-bold

                    hover:bg-yellow-300

                    transition

                  "

                >

                  Buscar

                </button>

              </form>

            </div>



            {/* LOADING */}



            {cargando ? (

              <div className="py-20 text-center text-gray-400">

                Cargando solicitudes...

              </div>

            ) : solicitudesFiltradas.length === 0 ? (

              <div className="py-20 px-6 text-center">

                <PendingActionsIcon

                  sx={{

                    fontSize: 48,

                  }}

                  className="text-gray-600"

                />



                <h3 className="text-lg font-semibold mt-3">

                  No encontramos solicitudes

                </h3>



                <p className="text-gray-500 mt-1">

                  Probá cambiando el estado o el criterio de búsqueda.

                </p>

              </div>

            ) : (

              <>

                {/* DESKTOP */}



                <div className="hidden lg:block overflow-x-auto">

                  <table className="w-full min-w-[1050px] text-sm">

                    <thead className="bg-gray-950/70 text-gray-400">

                      <tr>

                        <th className="text-left font-semibold px-4 py-3">

                          Cliente

                        </th>



                        <th className="text-left font-semibold px-4 py-3">

                          Moto

                        </th>



                        <th className="text-left font-semibold px-4 py-3">

                          Contacto

                        </th>



                        <th className="text-left font-semibold px-4 py-3">

                          Pre-evaluación

                        </th>



                        <th className="text-left font-semibold px-4 py-3">

                          Gestión

                        </th>



                        



                        <th className="text-left font-semibold px-4 py-3">

                          Recepción

                        </th>



                        <th className="text-right font-semibold px-4 py-3">

                          Acción

                        </th>

                      </tr>

                    </thead>



                    <tbody className="divide-y divide-gray-800">

                      {solicitudesFiltradas.map((item) => (

                        <tr

                          key={item.idSolicitudCredito}

                          className="hover:bg-gray-800/60 transition"

                        >

                          <td className="px-4 py-4">

                            <div className="font-semibold text-white">

                              {campo(item.nombreCompleto)}

                            </div>



                            <div className="text-xs text-gray-500 mt-1">

                              CI {campo(item.cedula)}

                              {" · "}

                              Solicitud #{item.idSolicitudCredito}

                            </div>

                          </td>



                          <td className="px-4 py-4">

                            <div className="font-medium">

                              {[item.marca, item.modelo]

                                .filter(Boolean)

                                .join(" ") || "—"}

                            </div>



                            <div className="text-xs text-gray-500 mt-1">

                              {campo(item.codigoReferencia)}

                            </div>

                          </td>



                          <td className="px-4 py-4 text-gray-300">

                            {campo(item.telefono)}

                          </td>



                          <td className="px-4 py-4">

                            <span className="text-emerald-300 font-semibold">

                              {campo(item.resultadoPreEvaluacion)}

                            </span>

                          </td>



                          <td className="px-4 py-4">

                            <EstadoBadge estado={item.estadoControl} />

                          </td>



                          



                          <td className="px-4 py-4 text-gray-400">

                            {formatearFecha(item.fechaRecepcion)}

                          </td>



                          <td className="px-4 py-4 text-right">

                            <button

                              onClick={() =>

                                abrirDetalle(item.idSolicitudCredito)

                              }

                              className="

                                  inline-flex

                                  items-center

                                  gap-1.5

                                  px-3

                                  py-2

                                  rounded-lg

                                  bg-gray-800

                                  border

                                  border-gray-700

                                  text-yellow-300

                                  hover:border-yellow-400

                                  transition

                                "

                            >

                              <VisibilityIcon fontSize="small" />

                              Revisar

                            </button>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>



                {/* MOBILE */}



                <div className="lg:hidden divide-y divide-gray-800">

                  {solicitudesFiltradas.map((item) => (

                    <button

                      key={item.idSolicitudCredito}

                      onClick={() => abrirDetalle(item.idSolicitudCredito)}

                      className="

                          w-full

                          p-4

                          text-left

                          hover:bg-gray-800/70

                          transition

                        "

                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <div className="font-semibold truncate">

                            {campo(item.nombreCompleto)}

                          </div>



                          <div className="text-xs text-gray-500 mt-1">

                            CI {campo(item.cedula)}

                            {" · #"}

                            {item.idSolicitudCredito}

                          </div>

                        </div>



                        <EstadoBadge estado={item.estadoControl} />

                      </div>



                      <div className="mt-3 text-sm text-gray-300">

                        {[item.marca, item.modelo].filter(Boolean).join(" ") ||

                          "Moto sin identificar"}

                      </div>



                      <div className="mt-1 text-xs text-gray-500 flex justify-between gap-3">

                        <span>{campo(item.telefono)}</span>



                        <span>{formatearFechaCorta(item.fechaRecepcion)}</span>

                      </div>

                    </button>

                  ))}

                </div>

              </>

            )}

          </div>

        </div>

      </main>



      {/* =====================================================

          DETALLE

         ===================================================== */}



      {(cargandoDetalle || detalle) && (

        <div className="fixed inset-0 z-50 bg-black/75 flex justify-end">

          <div

            className="absolute inset-0"

            onClick={() => {

              if (!procesandoAccion) {

                setDetalle(null);

              }

            }}

          />



          <section

            className="

              relative

              w-full

              md:max-w-3xl

              h-full

              bg-gray-950

              border-l

              border-gray-800

              shadow-2xl

              flex

              flex-col

            "

          >

            {/* CABECERA */}



            <div

              className="

                px-4

                md:px-6

                py-4

                border-b

                border-gray-800

                flex

                items-center

                justify-between

                gap-3

                bg-gray-900

              "

            >

              <div>

                <p className="text-xs text-yellow-400 uppercase tracking-wider font-semibold">

                  Ficha de crédito

                </p>



                <h2 className="text-xl font-bold mt-1">

                  {detalle ? campo(detalle.nombreCompleto) : "Cargando..."}

                </h2>

              </div>



              <button

                onClick={() => setDetalle(null)}

                disabled={procesandoAccion}

                className="

                  p-2

                  rounded-lg

                  bg-gray-800

                  hover:bg-gray-700

                  disabled:opacity-50

                "

              >

                <CloseIcon />

              </button>

            </div>



            {cargandoDetalle || !detalle ? (

              <div className="flex-1 grid place-items-center text-gray-400">

                Cargando detalle...

              </div>

            ) : (

              <>

                <div

                  className="

                    flex-1

                    overflow-y-auto

                    p-4

                    md:p-6

                    space-y-5

                    scroll-elegante

                  "

                >

                  {/* ESTADOS */}



                  <div className="flex flex-wrap items-center gap-2">

                    <EstadoBadge estado={detalle.estadoControl} />



                    <span

                      className="

                        px-2.5

                        py-1

                        rounded-full

                        border

                        border-gray-700

                        bg-gray-900

                        text-xs

                        text-gray-300

                      "

                    >

                      Pre-evaluación: {campo(detalle.resultadoPreEvaluacion)}

                    </span>



                    <span

                      className="

                        px-2.5

                        py-1

                        rounded-full

                        border

                        border-gray-700

                        bg-gray-900

                        text-xs

                        text-gray-300

                      "

                    >

                      Paso: {campo(detalle.pasoActual)}

                    </span>

                  </div>



                  {/* CLIENTE */}



                  <DetalleSection

                    title="Cliente"

                    icon={<BadgeIcon fontSize="small" />}

                  >

                    <InfoGrid

                      items={[

                        ["Nombre", campo(detalle.nombreCompleto)],



                        ["Cédula", campo(detalle.cedula)],



                        ["Teléfono", campo(detalle.telefono)],



                        [

                          "Nacimiento",

                          formatearFechaCorta(detalle.fechaNacimiento),

                        ],

                      ]}

                    />

                  </DetalleSection>



                  {/* MOTO */}



                  <DetalleSection

                    title="Moto solicitada"

                    icon={<TwoWheelerIcon fontSize="small" />}

                  >

                    <InfoGrid

                      items={[

                        ["Marca", campo(detalle.marca)],



                        ["Modelo", campo(detalle.modelo)],



                        ["Código", campo(detalle.codigoReferencia)],



                        [

                          "Cilindrada",



                          detalle.cilindrada ? `${detalle.cilindrada} cc` : "—",

                        ],

                      ]}

                    />

                  </DetalleSection>



                  {/* DOMICILIO */}



                  <DetalleSection

                    title="Domicilio"

                    icon={<HomeIcon fontSize="small" />}

                  >

                    <InfoGrid

                      items={[

                        ["Ciudad", campo(detalle.ciudad)],



                        ["Barrio", campo(detalle.barrio)],



                        ["Dirección", campo(detalle.direccion)],

                      ]}

                    />

                  </DetalleSection>



                  {/* LABORAL */}



                  <DetalleSection

                    title="Datos laborales"

                    icon={<WorkIcon fontSize="small" />}

                  >

                    {detalle.laboral ? (

                      <InfoGrid

                        items={[

                          ["Empresa", campo(detalle.laboral.empresa)],



                          [

                            "Antigüedad",

                            `${detalle.laboral.antiguedadMeses ?? 0} meses`,

                          ],



                          [

                            "Aporta IPS",

                            detalle.laboral.aportaIPS ? "Sí" : "No",

                          ],



                          [

                            "Aportes IPS",

                            campo(detalle.laboral.cantidadAportesIPS),

                          ],



                          [

                            "Teléfono empresa",

                            campo(detalle.laboral.telefonoEmpresa),

                          ],



                          [

                            "Dirección empresa",

                            campo(detalle.laboral.direccionEmpresa),

                          ],



                          [

                            "Jefe / encargado",

                            campo(detalle.laboral.nombreJefeEncargado),

                          ],

                        ]}

                      />

                    ) : (

                      <Vacio texto="Sin datos laborales registrados." />

                    )}

                  </DetalleSection>



                  {/* REFERENCIAS */}



                  <DetalleSection

                    title="Referencias"

                    icon={<PhoneIcon fontSize="small" />}

                  >

                    {detalle.referencias?.length ? (

                      <div className="space-y-2">

                        {detalle.referencias.map((ref) => (

                          <div

                            key={ref.id}

                            className="

                                rounded-xl

                                bg-gray-950

                                border

                                border-gray-800

                                p-3

                              "

                          >

                            <div className="flex items-center justify-between gap-3">

                              <div className="font-semibold">{ref.nombre}</div>



                              <span className="text-xs text-yellow-300">

                                {ref.tipo}

                              </span>

                            </div>



                            <div className="text-sm text-gray-400 mt-1">

                              {ref.telefono}



                              {ref.parentesco ? ` · ${ref.parentesco}` : ""}

                            </div>



                            {ref.observacion && (

                              <div className="text-xs text-gray-500 mt-2">

                                {ref.observacion}

                              </div>

                            )}

                          </div>

                        ))}

                      </div>

                    ) : (

                      <Vacio texto="Sin referencias registradas." />

                    )}

                  </DetalleSection>



                  {/* DOCUMENTOS */}



                  <DetalleSection

                    title="Documentos"

                    icon={<DescriptionIcon fontSize="small" />}

                  >

                    {detalle.documentos?.length ? (

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                        {detalle.documentos.map((doc) => (

                          <button

                            key={doc.id}

                            onClick={() => abrirDocumento(doc.id)}

                            className="

                                text-left

                                rounded-xl

                                bg-gray-950

                                border

                                border-gray-800

                                hover:border-yellow-400/60

                                p-3

                                transition

                              "

                          >

                            <div className="flex items-center justify-between gap-2">

                              <div className="font-semibold text-sm">

                                {doc.tipoDocumento.replaceAll("_", " ")}

                              </div>



                              <OpenInNewIcon

                                fontSize="small"

                                className="text-yellow-300"

                              />

                            </div>



                            <div className="text-xs text-gray-500 mt-1 truncate">

                              {doc.nombreArchivo}

                            </div>



                            <div className="text-xs text-emerald-300 mt-2">

                              {doc.estadoRevision}

                            </div>

                          </button>

                        ))}

                      </div>

                    ) : (

                      <Vacio texto="Sin documentos registrados." />

                    )}

                  </DetalleSection>



                  {/* AUTORIZACION */}



                  <DetalleSection

                    title="Autorización"

                    icon={<VerifiedUserIcon fontSize="small" />}

                  >

                    {detalle.autorizacion ? (

                      <div className="text-sm space-y-2">

                        <div className="text-emerald-300 font-semibold">

                          Autorización registrada

                        </div>



                        <InfoGrid

                          items={[

                            ["Titular", detalle.autorizacion.nombreCompleto],



                            ["Cédula", detalle.autorizacion.numeroCedula],



                            ["Canal", detalle.autorizacion.canal],



                            [

                              "Fecha",

                              formatearFecha(

                                detalle.autorizacion.fechaAutorizacion,

                              ),

                            ],

                          ]}

                        />

                      </div>

                    ) : (

                      <Vacio texto="No existe autorización registrada." />

                    )}

                  </DetalleSection>



                  {/* HISTORIAL */}



                  <DetalleSection

                    title="Seguimiento"

                    icon={<HistoryIcon fontSize="small" />}

                  >

                    {detalle.historial?.length ? (

                      <div className="space-y-3">

                        {detalle.historial.map((item) => (

                          <div key={item.id} className="flex gap-3">

                            <div

                              className="

                                  mt-1.5

                                  h-2.5

                                  w-2.5

                                  rounded-full

                                  bg-yellow-400

                                  shrink-0

                                "

                            />



                            <div className="min-w-0">

                              <div className="text-sm font-semibold">

                                {item.accion.replaceAll("_", " ")}

                              </div>



                              <div className="text-xs text-gray-500 mt-0.5">

                                {formatearFecha(item.fecha)}



                                {item.usuario ? ` · ${item.usuario}` : ""}

                              </div>



                              {(item.estadoAnterior || item.estadoNuevo) && (

                                <div className="text-xs text-gray-400 mt-1">

                                  {item.estadoAnterior

                                    ? estadoLabel(item.estadoAnterior)

                                    : "Inicio"}



                                  {" → "}



                                  {estadoLabel(item.estadoNuevo)}

                                </div>

                              )}



                              {item.observacion && (

                                <div className="text-sm text-gray-300 mt-1">

                                  {item.observacion}

                                </div>

                              )}

                            </div>

                          </div>

                        ))}

                      </div>

                    ) : (

                      <Vacio texto="Todavía no hay movimientos de seguimiento." />

                    )}

                  </DetalleSection>

                </div>



                {/* =============================================

                    BOTONES DE GESTION

                   ============================================= */}



                <div

                  className="

                    p-4

                    border-t

                    border-gray-800

                    bg-gray-900

                    flex

                    flex-wrap

                    gap-2

                    justify-end

                  "

                >

                  {detalle.estadoControl === "PENDIENTE_ENVIO" && (
                    <button
                      onClick={marcarEnviadaEmpresa}
                      disabled={procesandoAccion}
                      className="
                        px-4
                        py-2.5
                        rounded-lg
                        bg-emerald-600
                        hover:bg-emerald-500
                        text-white
                        font-bold
                        disabled:opacity-50
                      "
                    >
                      Marcar como enviada a la empresa
                    </button>
                  )}


                  {detalle.estadoControl === "ENVIADA_EMPRESA" && (
                    <div className="text-sm text-gray-400 py-2">
                      Enviada a la empresa el{" "}
                      {formatearFecha(detalle.fechaCierreControl)}.
                    </div>
                  )}

                </div>

              </>

            )}

          </section>

        </div>

      )}

    </div>

  );

};



// =========================================================

// COMPONENTES INTERNOS

// =========================================================



const ResumenCard: React.FC<{

  label: string;



  value: number;



  icon: React.ReactNode;



  className: string;

}> = ({ label, value, icon, className }) => (

  <div

    className="

        bg-gray-900

        border

        border-gray-800

        rounded-xl

        p-4

        md:p-5

      "

  >

    <div

      className={`

          flex

          items-center

          gap-2

          text-sm

          font-semibold

          ${className}

        `}

    >

      {icon}



      {label}

    </div>



    <div className="text-3xl font-bold mt-3">{value}</div>

  </div>

);



const EstadoBadge: React.FC<{

  estado?: string | null;

}> = ({ estado }) => (

  <span

    className={`

        inline-flex

        items-center

        rounded-full

        border

        px-2.5

        py-1

        text-xs

        font-semibold

        whitespace-nowrap

        ${estadoClasses(estado)}

      `}

  >

    {estadoLabel(estado)}

  </span>

);



const DetalleSection: React.FC<{

  title: string;



  icon: React.ReactNode;



  children: React.ReactNode;

}> = ({ title, icon, children }) => (

  <section

    className="

        bg-gray-900

        border

        border-gray-800

        rounded-2xl

        overflow-hidden

      "

  >

    <div

      className="

          px-4

          py-3

          border-b

          border-gray-800

          flex

          items-center

          gap-2

          text-yellow-300

          font-semibold

        "

    >

      {icon}



      {title}

    </div>



    <div className="p-4">{children}</div>

  </section>

);



const InfoGrid: React.FC<{

  items: Array<[string, string]>;

}> = ({ items }) => (

  <div

    className="

        grid

        grid-cols-1

        sm:grid-cols-2

        gap-x-5

        gap-y-3

      "

  >

    {items.map(([label, value]) => (

      <div key={label}>

        <div className="text-xs text-gray-500">{label}</div>



        <div className="text-sm text-gray-200 mt-0.5 break-words">{value}</div>

      </div>

    ))}

  </div>

);



const Vacio: React.FC<{

  texto: string;

}> = ({ texto }) => <div className="text-sm text-gray-500">{texto}</div>;



export default Dashboard;

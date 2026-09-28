import React, { useEffect, useMemo, useState } from "react";

import Swal from "sweetalert2";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PercentIcon from "@mui/icons-material/Percent";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import Panel from "./Panel";

import {
  crearModeloConExcepcionDescuento,
  guardarConfiguracionDescuentoContado,
  listarMarcasDescuentoContado,
  obtenerConfiguracionDescuentoContado,
  obtenerMensajeErrorDescuento,
} from "../../api/descuentoContadoMotoService";

import {
  DescuentoContadoConfiguracion,
  DescuentoContadoMarca,
  GuardarDescuentoContadoModeloRequest,
} from "../../types/descuentoContadoMoto";

interface ExcepcionLocal {
  activa: boolean;
  porcentaje: string;
}

type ExcepcionesMap = Record<number, ExcepcionLocal>;

interface NuevoModeloForm {
  codigoReferencia: string;
  nombreModelo: string;
  cilindrada: string;
  categoria: string;
  porcentajeDescuento: string;
}

const nombresMeses = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

const nuevoModeloInicial: NuevoModeloForm = {
  codigoReferencia: "",
  nombreModelo: "",
  cilindrada: "",
  categoria: "MOTO",
  porcentajeDescuento: "",
};

const DescuentosContado: React.FC = () => {
  const hoy = new Date();

  const [menuOpen, setMenuOpen] = useState(false);
  const [marcas, setMarcas] = useState<DescuentoContadoMarca[]>([]);
  const [idMarca, setIdMarca] = useState<number | "">("");
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth() + 1);

  const [configuracion, setConfiguracion] =
    useState<DescuentoContadoConfiguracion | null>(null);

  const [porcentajeGeneral, setPorcentajeGeneral] = useState("");
  const [excepciones, setExcepciones] = useState<ExcepcionesMap>({});
  const [buscar, setBuscar] = useState("");

  const [cargandoMarcas, setCargandoMarcas] = useState(true);
  const [cargandoConfiguracion, setCargandoConfiguracion] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [modalModeloOpen, setModalModeloOpen] = useState(false);
  const [creandoModelo, setCreandoModelo] = useState(false);
  const [nuevoModelo, setNuevoModelo] =
    useState<NuevoModeloForm>(nuevoModeloInicial);

  const aplicarConfiguracion = (
    data: DescuentoContadoConfiguracion,
  ) => {
    setConfiguracion(data);

    setPorcentajeGeneral(
      data.porcentajeGeneral !== null &&
        data.porcentajeGeneral !== undefined
        ? String(data.porcentajeGeneral)
        : "",
    );

    const mapa: ExcepcionesMap = {};

    data.modelos.forEach((modelo) => {
      mapa[modelo.idModeloProducto] = {
        activa: modelo.tieneExcepcion,
        porcentaje:
          modelo.porcentajeExcepcion !== null &&
          modelo.porcentajeExcepcion !== undefined
            ? String(modelo.porcentajeExcepcion)
            : "",
      };
    });

    setExcepciones(mapa);
  };

  useEffect(() => {
    const cargar = async () => {
      setCargandoMarcas(true);

      try {
        const data = await listarMarcasDescuentoContado();

        setMarcas(data);

        if (data.length > 0) {
          setIdMarca(data[0].idMarca);
        }
      } catch (error) {
        Swal.fire(
          "Error",
          obtenerMensajeErrorDescuento(error),
          "error",
        );
      } finally {
        setCargandoMarcas(false);
      }
    };

    cargar();
  }, []);

  const cargarConfiguracion = async () => {
    if (!idMarca) {
      return;
    }

    setCargandoConfiguracion(true);

    try {
      const data = await obtenerConfiguracionDescuentoContado(
        Number(idMarca),
        anio,
        mes,
      );

      aplicarConfiguracion(data);
    } catch (error) {
      setConfiguracion(null);
      setPorcentajeGeneral("");
      setExcepciones({});

      Swal.fire(
        "Error",
        obtenerMensajeErrorDescuento(error),
        "error",
      );
    } finally {
      setCargandoConfiguracion(false);
    }
  };

  useEffect(() => {
    if (idMarca) {
      cargarConfiguracion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idMarca, anio, mes]);

  const moverMes = (cantidad: number) => {
    const fecha = new Date(
      anio,
      mes - 1 + cantidad,
      1,
    );

    setAnio(fecha.getFullYear());
    setMes(fecha.getMonth() + 1);
    setBuscar("");
  };

  const irMesActual = () => {
    const actual = new Date();

    setAnio(actual.getFullYear());
    setMes(actual.getMonth() + 1);
  };

  const esMesActual =
    anio === hoy.getFullYear() &&
    mes === hoy.getMonth() + 1;

  const cambiarExcepcionActiva = (
    idModeloProducto: number,
    activa: boolean,
  ) => {
    setExcepciones((actual) => ({
      ...actual,
      [idModeloProducto]: {
        activa,
        porcentaje:
          actual[idModeloProducto]?.porcentaje ?? "",
      },
    }));
  };

  const cambiarPorcentajeExcepcion = (
    idModeloProducto: number,
    valor: string,
  ) => {
    setExcepciones((actual) => ({
      ...actual,
      [idModeloProducto]: {
        activa:
          actual[idModeloProducto]?.activa ?? true,
        porcentaje: valor,
      },
    }));
  };

  const modelosFiltrados = useMemo(() => {
    if (!configuracion) {
      return [];
    }

    const texto = buscar.trim().toLowerCase();

    if (!texto) {
      return configuracion.modelos;
    }

    return configuracion.modelos.filter(
      (modelo) =>
        modelo.nombreModelo
          .toLowerCase()
          .includes(texto) ||
        modelo.codigoReferencia
          ?.toLowerCase()
          .includes(texto),
    );
  }, [configuracion, buscar]);

  const cantidadExcepciones = useMemo(
    () =>
      Object.values(excepciones).filter(
        (item) => item.activa,
      ).length,
    [excepciones],
  );

  const abrirModalModelo = () => {
    if (!idMarca || !configuracion) {
      Swal.fire(
        "Atención",
        "Seleccioná una marca antes de agregar un modelo.",
        "warning",
      );
      return;
    }

    const general = Number(porcentajeGeneral);

    if (
      porcentajeGeneral.trim() === "" ||
      Number.isNaN(general) ||
      general < 0 ||
      general > 100
    ) {
      Swal.fire(
        "Atención",
        "Primero ingresá un descuento general válido entre 0 y 100.",
        "warning",
      );
      return;
    }

    setNuevoModelo(nuevoModeloInicial);
    setModalModeloOpen(true);
  };

  const cerrarModalModelo = () => {
    if (creandoModelo) {
      return;
    }

    setModalModeloOpen(false);
    setNuevoModelo(nuevoModeloInicial);
  };

  const crearModelo = async () => {
    if (!idMarca || !configuracion) {
      return;
    }

    const codigoReferencia =
      nuevoModelo.codigoReferencia.trim().toUpperCase();

    const nombreModelo =
      nuevoModelo.nombreModelo.trim().toUpperCase();

    const categoria =
      nuevoModelo.categoria.trim().toUpperCase();

    const general = Number(porcentajeGeneral);

    const porcentajeDescuento =
      Number(nuevoModelo.porcentajeDescuento);

    let cilindrada: number | null = null;

    if (!codigoReferencia) {
      Swal.fire(
        "Atención",
        "Ingresá el código de referencia.",
        "warning",
      );
      return;
    }

    if (!nombreModelo) {
      Swal.fire(
        "Atención",
        "Ingresá el nombre del modelo.",
        "warning",
      );
      return;
    }

    if (
      nuevoModelo.porcentajeDescuento.trim() === "" ||
      Number.isNaN(porcentajeDescuento) ||
      porcentajeDescuento < 0 ||
      porcentajeDescuento > 100
    ) {
      Swal.fire(
        "Atención",
        "Ingresá un descuento de excepción válido entre 0 y 100.",
        "warning",
      );
      return;
    }

    if (porcentajeDescuento === general) {
      Swal.fire(
        "Atención",
        `La excepción debe ser diferente al descuento general de ${general}%.`,
        "warning",
      );
      return;
    }

    if (nuevoModelo.cilindrada.trim() !== "") {
      cilindrada = Number(nuevoModelo.cilindrada);

      if (
        Number.isNaN(cilindrada) ||
        cilindrada <= 0
      ) {
        Swal.fire(
          "Atención",
          "La cilindrada debe ser mayor a cero.",
          "warning",
        );
        return;
      }
    }

    const confirmacion = await Swal.fire({
      icon: "question",
      title: "Crear modelo con excepción",
      html:
        `Se creará <b>${nombreModelo}</b> para <b>${configuracion.marca}</b> ` +
        `con una excepción de <b>${porcentajeDescuento}%</b> para ` +
        `<b>${nombresMeses[mes - 1]} ${anio}</b>.`,
      showCancelButton: true,
      confirmButtonText: "Sí, crear",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#eab308",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    setCreandoModelo(true);

    try {
      const data =
        await crearModeloConExcepcionDescuento({
          idMarca: Number(idMarca),
          anio,
          mes,
          codigoReferencia,
          nombreModelo,
          cilindrada,
          categoria: categoria || null,
          porcentajeDescuento,
        });

      aplicarConfiguracion(data);
      setBuscar("");
      setModalModeloOpen(false);
      setNuevoModelo(nuevoModeloInicial);

      await Swal.fire({
        icon: "success",
        title: "Modelo creado",
        html:
          `El modelo <b>${nombreModelo}</b> fue creado correctamente ` +
          `con una excepción de <b>${porcentajeDescuento}%</b>.<br/><br/>` +
          `<small>Recordá cargar también el precio del modelo en la sección Precios antes de cotizarlo.</small>`,
        confirmButtonText: "Entendido",
        confirmButtonColor: "#eab308",
      });
    } catch (error) {
      Swal.fire(
        "No se pudo crear",
        obtenerMensajeErrorDescuento(error),
        "error",
      );
    } finally {
      setCreandoModelo(false);
    }
  };

  const guardar = async () => {
    if (!idMarca) {
      Swal.fire(
        "Atención",
        "Seleccioná una marca.",
        "warning",
      );
      return;
    }

    const general = Number(porcentajeGeneral);

    if (
      porcentajeGeneral.trim() === "" ||
      Number.isNaN(general) ||
      general < 0 ||
      general > 100
    ) {
      Swal.fire(
        "Atención",
        "Ingresá un porcentaje general válido entre 0 y 100.",
        "warning",
      );
      return;
    }

    const listaExcepciones:
      GuardarDescuentoContadoModeloRequest[] = [];

    for (const [idModeloTexto, excepcion] of Object.entries(
      excepciones,
    )) {
      if (!excepcion.activa) {
        continue;
      }

      const porcentaje = Number(excepcion.porcentaje);

      if (
        excepcion.porcentaje.trim() === "" ||
        Number.isNaN(porcentaje) ||
        porcentaje < 0 ||
        porcentaje > 100
      ) {
        const modelo = configuracion?.modelos.find(
          (x) =>
            x.idModeloProducto ===
            Number(idModeloTexto),
        );

        Swal.fire(
          "Atención",
          `Revisá el porcentaje de ${
            modelo?.nombreModelo ??
            "la excepción"
          }.`,
          "warning",
        );
        return;
      }

      listaExcepciones.push({
        idModeloProducto: Number(idModeloTexto),
        porcentajeDescuento: porcentaje,
      });
    }

    const marca = marcas.find(
      (item) =>
        item.idMarca === Number(idMarca),
    );

    const confirmacion = await Swal.fire({
      icon: "question",
      title: "Guardar descuentos",
      html:
        `Vas a guardar la configuración de <b>${marca?.marca ?? ""}</b> ` +
        `para <b>${nombresMeses[mes - 1]} ${anio}</b>.<br/><br/>` +
        `Descuento general: <b>${general}%</b><br/>` +
        `Excepciones: <b>${listaExcepciones.length}</b>`,
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#eab308",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    setGuardando(true);

    try {
      const resultado =
        await guardarConfiguracionDescuentoContado({
          idMarca: Number(idMarca),
          anio,
          mes,
          porcentajeGeneral: general,
          excepciones: listaExcepciones,
        });

      aplicarConfiguracion(resultado);

      Swal.fire({
        icon: "success",
        title: "Configuración guardada",
        text:
          "Los descuentos de contado fueron actualizados correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire(
        "No se pudo guardar",
        obtenerMensajeErrorDescuento(error),
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white relative">
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
          <h2 className="text-yellow-400 font-bold text-lg">
            Menú
          </h2>

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
            absolute top-4 left-4 md:hidden z-30
            bg-yellow-400 text-black rounded p-1 shadow-md
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

      <main className="flex-1 min-w-0 overflow-auto p-4 md:p-6 mt-14 md:mt-0">
        <div className="max-w-[1300px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400/80 mb-1">
                Gestión de productos
              </p>

              <h1 className="text-2xl md:text-3xl font-bold">
                Descuentos contado
              </h1>

              <p className="text-gray-400 mt-2 max-w-3xl">
                Definí el descuento general de contado público,
                cargá las excepciones por modelo y, cuando haga
                falta, creá un modelo nuevo directamente desde
                esta pantalla.
              </p>
            </div>

            <button
              onClick={cargarConfiguracion}
              disabled={
                cargandoConfiguracion ||
                !idMarca
              }
              className="
                inline-flex items-center justify-center gap-2
                px-4 py-2.5 rounded-lg border border-gray-700
                bg-gray-900 hover:border-yellow-400
                hover:text-yellow-300 transition
                disabled:opacity-40
              "
            >
              <RefreshIcon fontSize="small" />
              Actualizar
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => moverMes(-1)}
              className="
                h-10 w-10 rounded-lg border border-gray-700
                bg-gray-900 text-yellow-300 grid place-items-center
                hover:border-yellow-400 transition
              "
            >
              <ChevronLeftIcon />
            </button>

            <div
              className="
                min-w-[230px] h-10 px-5 rounded-lg border
                border-yellow-400/40 bg-gray-900 flex
                items-center justify-center font-bold text-yellow-300
              "
            >
              {nombresMeses[mes - 1]} {anio}
            </div>

            <button
              type="button"
              onClick={() => moverMes(1)}
              className="
                h-10 w-10 rounded-lg border border-gray-700
                bg-gray-900 text-yellow-300 grid place-items-center
                hover:border-yellow-400 transition
              "
            >
              <ChevronRightIcon />
            </button>

            {!esMesActual && (
              <button
                type="button"
                onClick={irMesActual}
                className="
                  h-10 px-4 rounded-lg bg-yellow-400 text-black
                  text-sm font-bold hover:bg-yellow-300 transition
                "
              >
                Mes actual
              </button>
            )}
          </div>

          <div
            className="
              bg-gray-900 border border-gray-800
              rounded-2xl p-4 md:p-5 mb-5
            "
          >
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Marca
            </label>

            <select
              value={idMarca}
              disabled={cargandoMarcas}
              onChange={(e) => {
                setIdMarca(
                  e.target.value
                    ? Number(e.target.value)
                    : "",
                );
                setBuscar("");
              }}
              className="
                w-full md:max-w-md bg-gray-950 border border-gray-700
                rounded-lg px-3 py-2.5 outline-none
                focus:border-yellow-400
              "
            >
              <option value="">
                Seleccionar marca
              </option>

              {marcas.map((marca) => (
                <option
                  key={marca.idMarca}
                  value={marca.idMarca}
                >
                  {marca.marca}
                </option>
              ))}
            </select>
          </div>

          {cargandoConfiguracion ? (
            <div
              className="
                bg-gray-900 border border-gray-800
                rounded-2xl py-20 text-center text-gray-400
              "
            >
              Cargando configuración...
            </div>
          ) : configuracion ? (
            <>
              <div
                className="
                  bg-gray-900 border border-yellow-400/30
                  rounded-2xl p-5 mb-5
                "
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-yellow-300 font-bold">
                      <PercentIcon fontSize="small" />
                      Descuento general público
                    </div>

                    <p className="text-sm text-gray-400 mt-2">
                      Todos los modelos que no tengan una excepción
                      utilizan automáticamente este porcentaje.
                    </p>

                    {configuracion.porcentajeGeneral !== null &&
                      configuracion.porcentajeGeneral !== undefined && (
                        <div className="mt-3 inline-flex items-center gap-2 text-xs">
                          {configuracion.reglaGeneralEsDelMes ? (
                            <span
                              className="
                                px-2.5 py-1 rounded-full
                                bg-emerald-500/10 border
                                border-emerald-500/30 text-emerald-300
                              "
                            >
                              Configurado este mes
                            </span>
                          ) : (
                            <span
                              className="
                                px-2.5 py-1 rounded-full
                                bg-sky-500/10 border
                                border-sky-500/30 text-sky-300
                              "
                            >
                              Regla general vigente
                            </span>
                          )}
                        </div>
                      )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={porcentajeGeneral}
                      onChange={(e) =>
                        setPorcentajeGeneral(
                          e.target.value,
                        )
                      }
                      className="
                        w-32 bg-gray-950 border border-gray-700
                        rounded-lg px-4 py-3 text-right text-xl
                        font-bold text-yellow-300 outline-none
                        focus:border-yellow-400
                      "
                    />

                    <span className="text-xl font-bold text-yellow-300">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="
                  bg-gray-900 border border-gray-800
                  rounded-2xl overflow-hidden
                "
              >
                <div
                  className="
                    p-4 border-b border-gray-800 flex flex-col
                    lg:flex-row lg:items-center lg:justify-between gap-3
                  "
                >
                  <div>
                    <h2 className="font-bold">
                      Excepciones por modelo
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Marcá solamente los modelos cuyo descuento
                      sea diferente al general.
                    </p>
                  </div>

                  <div
                    className="
                      flex flex-col sm:flex-row sm:items-center gap-3
                    "
                  >
                    <span className="text-sm text-gray-400">
                      Excepciones:{" "}
                      <strong className="text-yellow-300">
                        {cantidadExcepciones}
                      </strong>
                    </span>

                    <button
                      type="button"
                      onClick={abrirModalModelo}
                      disabled={
                        guardando ||
                        creandoModelo ||
                        !idMarca
                      }
                      className="
                        inline-flex items-center justify-center gap-2
                        px-4 py-2.5 rounded-lg bg-yellow-400
                        hover:bg-yellow-300 text-black text-sm font-bold
                        transition disabled:opacity-40
                        disabled:cursor-not-allowed
                      "
                    >
                      <AddCircleOutlineIcon fontSize="small" />
                      Agregar modelo
                    </button>

                    <div className="relative">
                      <SearchIcon
                        fontSize="small"
                        className="
                          absolute left-3 top-1/2 -translate-y-1/2
                          text-gray-500
                        "
                      />

                      <input
                        value={buscar}
                        onChange={(e) =>
                          setBuscar(e.target.value)
                        }
                        placeholder="Buscar modelo..."
                        className="
                          w-full sm:w-72 bg-gray-950 border
                          border-gray-700 rounded-lg py-2.5
                          pl-10 pr-3 outline-none text-sm
                          focus:border-yellow-400
                        "
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="
                    mx-4 mt-4 p-3 rounded-xl bg-sky-500/5
                    border border-sky-500/20 flex gap-2
                    text-sm text-gray-300
                  "
                >
                  <InfoOutlinedIcon
                    fontSize="small"
                    className="text-sky-300 shrink-0 mt-0.5"
                  />

                  <div>
                    Si un modelo no está marcado como excepción,
                    el sistema utilizará automáticamente el descuento
                    general de{" "}
                    <strong className="text-yellow-300">
                      {porcentajeGeneral || "0"}%
                    </strong>.
                  </div>
                </div>

                <div className="hidden md:block overflow-x-auto mt-4">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-950/70 text-xs text-gray-400">
                      <tr>
                        <th className="text-left px-4 py-3">
                          Modelo
                        </th>
                        <th className="text-left px-4 py-3">
                          Código
                        </th>
                        <th className="text-center px-4 py-3">
                          Excepción
                        </th>
                        <th className="text-center px-4 py-3">
                          Descuento
                        </th>
                        <th className="text-center px-4 py-3">
                          Efectivo
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-800">
                      {modelosFiltrados.map((modelo) => {
                        const excepcion =
                          excepciones[
                            modelo.idModeloProducto
                          ];

                        const activa =
                          excepcion?.activa ?? false;

                        const efectivo = activa
                          ? excepcion?.porcentaje
                          : porcentajeGeneral;

                        return (
                          <tr
                            key={modelo.idModeloProducto}
                            className="hover:bg-gray-800/40 transition"
                          >
                            <td className="px-4 py-4">
                              <div className="font-semibold">
                                {modelo.nombreModelo}
                              </div>

                              {modelo.cilindrada && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {modelo.cilindrada} cc
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-4 text-gray-400">
                              {modelo.codigoReferencia || "—"}
                            </td>

                            <td className="px-4 py-4 text-center">
                              <input
                                type="checkbox"
                                checked={activa}
                                onChange={(e) =>
                                  cambiarExcepcionActiva(
                                    modelo.idModeloProducto,
                                    e.target.checked,
                                  )
                                }
                                className="
                                  h-5 w-5 accent-yellow-400 cursor-pointer
                                "
                              />
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                {activa ? (
                                  <>
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.01"
                                      value={
                                        excepcion?.porcentaje ??
                                        ""
                                      }
                                      onChange={(e) =>
                                        cambiarPorcentajeExcepcion(
                                          modelo.idModeloProducto,
                                          e.target.value,
                                        )
                                      }
                                      className="
                                        w-24 bg-gray-950 border
                                        border-yellow-400/50 rounded-lg
                                        px-3 py-2 text-right
                                        text-yellow-300 font-semibold
                                        outline-none focus:border-yellow-400
                                      "
                                    />

                                    <span className="text-yellow-300">
                                      %
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-gray-500 text-sm">
                                    Usa general
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-4 text-center">
                              <span
                                className={`
                                  inline-flex items-center gap-1 px-2.5 py-1
                                  rounded-full border text-sm font-bold
                                  ${
                                    activa
                                      ? "bg-orange-500/10 border-orange-500/30 text-orange-300"
                                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                  }
                                `}
                              >
                                {activa && (
                                  <CheckCircleIcon
                                    sx={{ fontSize: 15 }}
                                  />
                                )}

                                {efectivo || "0"}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden p-4 space-y-3">
                  {modelosFiltrados.map((modelo) => {
                    const excepcion =
                      excepciones[
                        modelo.idModeloProducto
                      ];

                    const activa =
                      excepcion?.activa ?? false;

                    return (
                      <div
                        key={modelo.idModeloProducto}
                        className="
                          rounded-xl bg-gray-950 border
                          border-gray-800 p-4
                        "
                      >
                        <div className="flex justify-between gap-3">
                          <div>
                            <div className="font-semibold">
                              {modelo.nombreModelo}
                            </div>

                            <div className="text-xs text-gray-500 mt-1">
                              {modelo.codigoReferencia}
                            </div>
                          </div>

                          <label
                            className="
                              flex items-center gap-2
                              text-xs text-gray-300
                            "
                          >
                            <input
                              type="checkbox"
                              checked={activa}
                              onChange={(e) =>
                                cambiarExcepcionActiva(
                                  modelo.idModeloProducto,
                                  e.target.checked,
                                )
                              }
                              className="
                                h-5 w-5 accent-yellow-400
                              "
                            />
                            Excepción
                          </label>
                        </div>

                        <div className="mt-4">
                          {activa ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={
                                  excepcion?.porcentaje ??
                                  ""
                                }
                                onChange={(e) =>
                                  cambiarPorcentajeExcepcion(
                                    modelo.idModeloProducto,
                                    e.target.value,
                                  )
                                }
                                className="
                                  flex-1 bg-gray-900 border
                                  border-yellow-400/50 rounded-lg
                                  px-3 py-2 text-yellow-300 outline-none
                                "
                              />

                              <span className="text-yellow-300 font-bold">
                                %
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">
                              Utiliza el descuento general:{" "}
                              <strong className="text-emerald-300">
                                {porcentajeGeneral || "0"}%
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {modelosFiltrados.length === 0 && (
                  <div className="py-16 text-center text-gray-500">
                    No encontramos modelos.
                  </div>
                )}

                <div
                  className="
                    p-4 border-t border-gray-800 flex flex-col
                    sm:flex-row sm:items-center
                    sm:justify-between gap-3
                  "
                >
                  <div className="text-sm text-gray-500">
                    {configuracion.modelos.length} modelo(s) activo(s)
                    {" · "}
                    {cantidadExcepciones} excepción(es)
                  </div>

                  <button
                    onClick={guardar}
                    disabled={guardando}
                    className="
                      inline-flex items-center justify-center gap-2
                      px-5 py-3 rounded-lg bg-yellow-400
                      hover:bg-yellow-300 text-black font-bold
                      transition disabled:opacity-50
                    "
                  >
                    <SaveIcon fontSize="small" />

                    {guardando
                      ? "Guardando..."
                      : "Guardar configuración"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div
              className="
                bg-gray-900 border border-gray-800
                rounded-2xl py-20 text-center text-gray-500
              "
            >
              Seleccioná una marca para comenzar.
            </div>
          )}
        </div>
      </main>

      {modalModeloOpen && (
        <div
          className="
            fixed inset-0 z-[100] bg-black/70
            flex items-center justify-center p-4
          "
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              cerrarModalModelo();
            }
          }}
        >
          <div
            className="
              w-full max-w-2xl bg-gray-900
              border border-yellow-400/30
              rounded-2xl shadow-2xl overflow-hidden
            "
          >
            <div
              className="
                px-5 py-4 border-b border-gray-800
                flex items-center justify-between gap-3
              "
            >
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-yellow-400/80">
                  {configuracion?.marca} · {nombresMeses[mes - 1]} {anio}
                </p>

                <h2 className="text-xl font-bold mt-1">
                  Agregar modelo con excepción
                </h2>
              </div>

              <button
                type="button"
                onClick={cerrarModalModelo}
                disabled={creandoModelo}
                className="
                  h-9 w-9 rounded-lg border border-gray-700
                  grid place-items-center text-gray-300
                  hover:text-white hover:border-gray-500
                  disabled:opacity-40
                "
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div
                className="
                  rounded-xl bg-sky-500/5 border border-sky-500/20
                  p-3 text-sm text-gray-300
                "
              >
                Se creará el modelo como activo y también su excepción
                de descuento para el mes seleccionado. El descuento
                general actual es{" "}
                <strong className="text-yellow-300">
                  {porcentajeGeneral || "0"}%
                </strong>.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Código de referencia *
                  </label>

                  <input
                    value={nuevoModelo.codigoReferencia}
                    onChange={(e) =>
                      setNuevoModelo((actual) => ({
                        ...actual,
                        codigoReferencia: e.target.value,
                      }))
                    }
                    maxLength={50}
                    placeholder="Ej.: 59012107FA"
                    className="
                      w-full bg-gray-950 border border-gray-700
                      rounded-lg px-3 py-2.5 outline-none
                      focus:border-yellow-400
                    "
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Nombre del modelo *
                  </label>

                  <input
                    value={nuevoModelo.nombreModelo}
                    onChange={(e) =>
                      setNuevoModelo((actual) => ({
                        ...actual,
                        nombreModelo: e.target.value,
                      }))
                    }
                    maxLength={150}
                    placeholder="Ej.: BLITZ 110"
                    className="
                      w-full bg-gray-950 border border-gray-700
                      rounded-lg px-3 py-2.5 outline-none
                      focus:border-yellow-400
                    "
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Cilindrada
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={nuevoModelo.cilindrada}
                    onChange={(e) =>
                      setNuevoModelo((actual) => ({
                        ...actual,
                        cilindrada: e.target.value,
                      }))
                    }
                    placeholder="Ej.: 110"
                    className="
                      w-full bg-gray-950 border border-gray-700
                      rounded-lg px-3 py-2.5 outline-none
                      focus:border-yellow-400
                    "
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Categoría
                  </label>

                  <input
                    value={nuevoModelo.categoria}
                    onChange={(e) =>
                      setNuevoModelo((actual) => ({
                        ...actual,
                        categoria: e.target.value,
                      }))
                    }
                    maxLength={50}
                    placeholder="MOTO"
                    className="
                      w-full bg-gray-950 border border-gray-700
                      rounded-lg px-3 py-2.5 outline-none
                      focus:border-yellow-400
                    "
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Descuento de excepción *
                </label>

                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={nuevoModelo.porcentajeDescuento}
                    onChange={(e) =>
                      setNuevoModelo((actual) => ({
                        ...actual,
                        porcentajeDescuento: e.target.value,
                      }))
                    }
                    placeholder="Ej.: 13"
                    className="
                      flex-1 bg-gray-950 border
                      border-yellow-400/40 rounded-lg
                      px-3 py-2.5 text-yellow-300 font-bold
                      outline-none focus:border-yellow-400
                    "
                  />

                  <span className="text-yellow-300 font-bold text-lg">
                    %
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Debe ser diferente al descuento general de{" "}
                  {porcentajeGeneral || "0"}%.
                </p>
              </div>
            </div>

            <div
              className="
                px-5 py-4 border-t border-gray-800
                flex flex-col-reverse sm:flex-row
                sm:justify-end gap-3
              "
            >
              <button
                type="button"
                onClick={cerrarModalModelo}
                disabled={creandoModelo}
                className="
                  px-5 py-2.5 rounded-lg border border-gray-700
                  text-gray-300 hover:border-gray-500
                  disabled:opacity-40
                "
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={crearModelo}
                disabled={creandoModelo}
                className="
                  inline-flex items-center justify-center gap-2
                  px-5 py-2.5 rounded-lg bg-yellow-400
                  hover:bg-yellow-300 text-black font-bold
                  disabled:opacity-50
                "
              >
                <AddCircleOutlineIcon fontSize="small" />
                {creandoModelo
                  ? "Creando..."
                  : "Crear modelo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DescuentosContado;

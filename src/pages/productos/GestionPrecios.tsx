import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import preciosService from "api/preciosProductosService";
import marcasService from "api/marcasService";

import { Marca } from "types/marca";
import { ModeloProducto } from "types/modeloProducto";
import {
  PrecioBlock,
  PrecioModelo,
  emptyPrecioBlock,
} from "types/precioProducto";

import { PreciosTable } from "../clientes/components/PreciosTable";

/* =======================
   Helpers
======================= */
const onlyDigits = (v: string) => v.replace(/\D/g, "");
const isEmpty = (v?: string) => !v || v.trim() === "";

/* =======================
   Component
======================= */
const GestionPrecios: React.FC = () => {
  const navigate = useNavigate();

  const [modelos, setModelos] = useState<ModeloProducto[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [precios, setPrecios] = useState<Record<number, PrecioModelo>>({});
  const [loading, setLoading] = useState(false);

  const [marcaSeleccionada, setMarcaSeleccionada] = useState<string | "ALL">(
    "ALL"
  );

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarTodo = async () => {
    setLoading(true);
    try {
      const [modelosData, marcasData, listadoPrecios] = await Promise.all([
        preciosService.obtenerModelos(),
        marcasService.obtenerMarcas(true),
        preciosService.obtenerListadoPrecios(),
      ]);

      setModelos(modelosData);
      setMarcas(marcasData);

      const mapa: Record<number, PrecioModelo> = {};

      modelosData.forEach((m) => {
        const modeloPrecio = listadoPrecios.find(
          (x: any) => x.idModeloProducto === m.id
        );

        const normal = modeloPrecio?.listasPrecios?.find(
          (l: any) => l.esPromo === false
        );

        const promo = modeloPrecio?.listasPrecios?.find(
          (l: any) => l.esPromo === true
        );

        const normalPlan = normal?.planes?.[0];
        const promoPlan = promo?.planes?.[0];

        mapa[m.id] = {
          normal: normal
            ? {
                idListaPrecio: normal.idListaPrecio,
                idPlan: normalPlan?.id,
                esPromo: false,
                estado: normal.estado,

                precioPublico: String(normal.precioPublico ?? ""),
                precioDistribuidor: String(normal.precioDistribuidor ?? ""),
                precioBase: String(normal.precioBase ?? ""),

                fechaDesde: normal.fechaDesde
                  ? normal.fechaDesde.slice(0, 10)
                  : "",
                fechaHasta: normal.fechaHasta
                  ? normal.fechaHasta.slice(0, 10)
                  : "",

                entregaInicial: String(normalPlan?.entregaInicial ?? ""),
                importeCuota: String(normalPlan?.importeCuota ?? ""),
                interes: String(normalPlan?.interes ?? ""),
                codigoPlan: String(normalPlan?.codigoPlan ?? ""),
              }
            : emptyPrecioBlock(false),

          promo: promo
            ? {
                idListaPrecio: promo.idListaPrecio,
                idPlan: promoPlan?.id,
                esPromo: true,
                estado: promo.estado,

                precioPublico: String(promo.precioPublico ?? ""),
                precioDistribuidor: String(promo.precioDistribuidor ?? ""),
                precioBase: String(promo.precioBase ?? ""),

                fechaDesde: promo.fechaDesde
                  ? promo.fechaDesde.slice(0, 10)
                  : "",
                fechaHasta: promo.fechaHasta
                  ? promo.fechaHasta.slice(0, 10)
                  : "",

                entregaInicial: String(promoPlan?.entregaInicial ?? ""),
                importeCuota: String(promoPlan?.importeCuota ?? ""),
                interes: String(promoPlan?.interes ?? ""),
                codigoPlan: String(promoPlan?.codigoPlan ?? ""),
              }
            : undefined,
        };
      });

      setPrecios(mapa);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     Handlers
  ======================= */
  const updateBlock = (
    idModelo: number,
    tipo: "normal" | "promo",
    field: keyof PrecioBlock,
    value: string
  ) => {
    setPrecios((prev) => ({
      ...prev,
      [idModelo]: {
        ...prev[idModelo],
        [tipo]: {
          ...(prev[idModelo]?.[tipo] ?? emptyPrecioBlock(tipo === "promo")),
          [field]: value,
          error: "",
          mensaje: "",
        },
      },
    }));
  };

  const agregarPromo = (idModelo: number) => {
    setPrecios((prev) => ({
      ...prev,
      [idModelo]: {
        ...prev[idModelo],
        promo: emptyPrecioBlock(true),
      },
    }));
  };

  const guardar = async (idModelo: number, tipo: "normal" | "promo") => {
    const block =
      tipo === "normal" ? precios[idModelo]?.normal : precios[idModelo]?.promo;
    if (!block) return;

    // validación mínima
    if (
      isEmpty(block.precioPublico) ||
      isEmpty(block.precioDistribuidor) ||
      isEmpty(block.precioBase)
    ) {
      updateBlock(
        idModelo,
        tipo,
        "error",
        "Completá Público / Distrib. / Base"
      );
      return;
    }

    // si es promo: exigir fechas
    if (
      block.esPromo &&
      (isEmpty(block.fechaDesde) || isEmpty(block.fechaHasta))
    ) {
      updateBlock(
        idModelo,
        tipo,
        "error",
        "Promo requiere Fecha desde y hasta"
      );
      return;
    }

    try {
      // 1) Lista precio (crear o editar)
      let idLista = block.idListaPrecio;

      if (idLista) {
        await preciosService.editarListaPrecio({
          Id: idLista,
          precioPublico: Number(onlyDigits(block.precioPublico)),
          precioDistribuidor: Number(onlyDigits(block.precioDistribuidor)),
          precioBase: Number(onlyDigits(block.precioBase)),
          fechaDesde: block.fechaDesde,
          fechaHasta: block.esPromo ? block.fechaHasta : null,
          esPromo: block.esPromo,
        });
      } else {
        const res = await preciosService.crearListaPrecio({
          idModeloProducto: idModelo,
          precioPublico: Number(onlyDigits(block.precioPublico)),
          precioDistribuidor: Number(onlyDigits(block.precioDistribuidor)),
          precioBase: Number(onlyDigits(block.precioBase)),
          fechaDesde: block.fechaDesde || "",
          fechaHasta: block.esPromo ? block.fechaHasta || "" : undefined,
          esPromo: block.esPromo,
        });

        idLista = res?.Id ?? res?.id;
      }

      // 2) Plan (crear o editar)

      if (!idLista) {
        throw new Error("No se pudo obtener idListaPrecio");
      }
      if (block.idPlan) {
        await preciosService.editarPlan({
          id: block.idPlan,
          idListaPrecio: idLista,
          entregaInicial: Number(onlyDigits(block.entregaInicial || "0")),
          cantidadCuotas: 30,
          importeCuota: Number(onlyDigits(block.importeCuota || "0")),
          interes: block.interes || undefined,
          codigoPlan: block.codigoPlan,
        });
      } else {
        await preciosService.crearPlan({
          idListaPrecio: idLista,
          entregaInicial: Number(onlyDigits(block.entregaInicial || "0")),
          cantidadCuotas: 30,
          importeCuota: Number(onlyDigits(block.importeCuota || "0")),
          interes: block.interes || undefined,
          codigoPlan: block.codigoPlan,
        });
      }

      // refresco para traer ids/estado/plan id
      await cargarTodo();
    } catch (e: any) {
      updateBlock(idModelo, tipo, "error", e?.message || "Error al guardar");
    }
  };

  const activarLista = async (idListaPrecio: number) => {
    await preciosService.activarListaPrecio(idListaPrecio);
    await cargarTodo();
  };

  const desactivarLista = async (idListaPrecio: number) => {
    await preciosService.desactivarListaPrecio(idListaPrecio);
    await cargarTodo();
  };

  /* =======================
     Filtrado por marca
  ======================= */
  const modelosFiltrados = useMemo(() => {
    if (marcaSeleccionada === "ALL") return modelos;
    return modelos.filter((m) => m.marca === marcaSeleccionada);
  }, [marcaSeleccionada, modelos]);

  /* =======================
     Render
  ======================= */
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-yellow-400">
            Gestión de Precios
          </h1>

          <button
            onClick={() => navigate("/clientes/dashboard")}
            className="flex items-center gap-2 px-4 py-2 rounded-full
              border border-yellow-400 text-yellow-400
              hover:bg-yellow-400 hover:text-black transition"
          >
            <ArrowBackIcon fontSize="small" />
            Volver
          </button>
        </div>

        {/* SELECT MARCAS */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <label className="text-sm text-gray-300 font-medium">Marcas</label>

          <select
            value={marcaSeleccionada}
            onChange={(e) => setMarcaSeleccionada(e.target.value)}
            className={`
              w-full sm:w-72 px-4 py-2 rounded-lg font-medium
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-yellow-400
              ${
                marcaSeleccionada === "ALL"
                  ? "bg-gray-900 text-gray-300 border border-gray-600"
                  : "bg-yellow-100 text-gray-900 border border-yellow-400"
              }
            `}
          >
            <option value="ALL" className="bg-gray-900 text-white">
              Todas las marcas
            </option>

            {marcas.map((m) => (
              <option
                key={m.id}
                value={m.nombre}
                className="bg-gray-900 text-white"
              >
                {m.nombre}
              </option>
            ))}
          </select>

          {marcaSeleccionada !== "ALL" && (
            <span className="text-xs text-yellow-300 mt-1">
              Marca seleccionada para la carga de precios
            </span>
          )}
        </div>
      </div>

      {/* CONTENIDO */}
      {loading ? (
        <div className="text-gray-400">Cargando…</div>
      ) : (
        modelosFiltrados.map((m) => {
          const data = precios[m.id];
          if (!data) return null;

          return (
            <div
              key={m.id}
              className="mb-6 border border-gray-300/40 rounded-2xl p-5 bg-black/20"
            >
              <div className="text-gray-200 font-semibold mb-3">
                {m.marca} – {m.nombreModelo} ({m.codigoReferencia})
              </div>

              <PreciosTable
                precios={data}
                onChange={(tipo, field, value) =>
                  updateBlock(m.id, tipo, field, value)
                }
                onGuardar={(tipo) => guardar(m.id, tipo)}
                onAgregarPromo={() => agregarPromo(m.id)}
                onActivar={(id) => activarLista(id)}
                onDesactivar={(id) => desactivarLista(id)}
              />
            </div>
          );
        })
      )}
    </div>
  );
};

export default GestionPrecios;

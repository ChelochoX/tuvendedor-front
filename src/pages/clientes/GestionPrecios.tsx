import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import preciosService from "api/preciosProductosService";
import marcasService from "api/marcasService";

import {
  ModeloProducto,
  PrecioBlock,
  PrecioModelo,
  emptyPrecioBlock,
} from "types/precioProducto";
import { Marca } from "types/marca";

/* =======================
   Helpers
======================= */
const onlyDigits = (v: string) => v.replace(/\D/g, "");
const miles = (v?: string) =>
  v ? Number(onlyDigits(v)).toLocaleString("es-PY") : "";
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

  const [marcaSeleccionada, setMarcaSeleccionada] = useState<number | "ALL">(
    "ALL"
  );

  /* =======================
     Carga inicial
  ======================= */
  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    setLoading(true);
    try {
      const [modelosData, marcasData] = await Promise.all([
        preciosService.obtenerModelos(),
        marcasService.obtenerMarcas(true),
      ]);

      setModelos(modelosData);
      setMarcas(marcasData);

      const inicial: Record<number, PrecioModelo> = {};
      modelosData.forEach((m) => {
        inicial[m.id] = {
          normal: emptyPrecioBlock(false),
        };
      });

      setPrecios(inicial);
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

  /* =======================
     Guardar
  ======================= */
  const guardar = async (m: ModeloProducto, tipo: "normal" | "promo") => {
    const block =
      tipo === "normal" ? precios[m.id]?.normal : precios[m.id]?.promo;

    if (!block) return;

    if (
      isEmpty(block.precioPublico) ||
      isEmpty(block.precioDistribuidor) ||
      isEmpty(block.precioBase)
    ) {
      updateBlock(
        m.id,
        tipo,
        "error",
        "Completá todos los campos obligatorios"
      );
      return;
    }

    try {
      const res = await preciosService.crearListaPrecio({
        idModeloProducto: m.id,
        precioPublico: Number(onlyDigits(block.precioPublico)),
        precioDistribuidor: Number(onlyDigits(block.precioDistribuidor)),
        precioBase: Number(onlyDigits(block.precioBase)),
        fechaDesde: block.fechaDesde,
        fechaHasta: block.esPromo ? block.fechaHasta : undefined,
        esPromo: block.esPromo,
      });

      const idLista = res?.Id || res?.id;

      await preciosService.crearPlan({
        idListaPrecio: idLista,
        entregaInicial: Number(onlyDigits(block.entregaInicial || "0")),
        cantidadCuotas: 30,
        importeCuota: Number(onlyDigits(block.importeCuota)),
        interes: Number(block.interes || 0),
        codigoPlan: block.codigoPlan,
      });

      updateBlock(m.id, tipo, "mensaje", "Precio guardado correctamente ✔");
    } catch (e: any) {
      updateBlock(m.id, tipo, "error", e.message || "Error al guardar");
    }
  };

  /* =======================
     Filtrado por marca
  ======================= */
  const modelosFiltrados =
    marcaSeleccionada === "ALL"
      ? modelos
      : modelos.filter((m) => m.idMarca === marcaSeleccionada);

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
            onChange={(e) =>
              setMarcaSeleccionada(
                e.target.value === "ALL" ? "ALL" : Number(e.target.value)
              )
            }
            className="w-full sm:w-72 bg-gray-900 text-white px-4 py-2 rounded-lg
            border border-gray-600 focus:outline-none
            focus:ring-2 focus:ring-yellow-400"
          >
            <option value="ALL">Todas las marcas</option>
            {marcas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
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
              className="mb-6 border border-gray-300/40 rounded-xl p-5"
            >
              <div className="text-gray-200 font-semibold mb-3">
                {m.marca} – {m.modelo} ({m.codigo})
              </div>

              <PrecioUI
                titulo="PRECIO NORMAL"
                color="bg-gray-50 border border-gray-200"
                block={data.normal}
                onChange={(f, v) => updateBlock(m.id, "normal", f, v)}
                onSave={() => guardar(m, "normal")}
              />

              {data.promo ? (
                <PrecioUI
                  titulo="PROMO"
                  color="bg-yellow-50 border border-yellow-300/50"
                  block={data.promo}
                  onChange={(f, v) => updateBlock(m.id, "promo", f, v)}
                  onSave={() => guardar(m, "promo")}
                  showFecha
                />
              ) : (
                <button
                  onClick={() => agregarPromo(m.id)}
                  className="mt-3 text-yellow-400 underline"
                >
                  + Agregar promo
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

/* =======================
   Sub UI
======================= */
type PrecioUIProps = {
  titulo: string;
  color: string;
  block: PrecioBlock;
  showFecha?: boolean;
  onSave: () => void;
  onChange: (field: keyof PrecioBlock, value: string) => void;
};

const PrecioUI: React.FC<PrecioUIProps> = ({
  titulo,
  color,
  block,
  onChange,
  onSave,
  showFecha,
}) => (
  <div className={`mt-4 p-5 rounded-xl ${color}`}>
    <div className="font-semibold text-gray-700 mb-4">{titulo}</div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {(
        ["precioPublico", "precioDistribuidor", "precioBase"] as Array<
          keyof PrecioBlock
        >
      ).map((f) => (
        <input
          key={f}
          className={`p-2 rounded bg-gray-800 text-white
          ${
            block.error && isEmpty(block[f] as string)
              ? "border border-red-500"
              : "border border-transparent"
          }`}
          placeholder={f}
          value={miles(block[f] as string)}
          onChange={(e) => onChange(f, onlyDigits(e.target.value))}
        />
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
      <input
        placeholder="Entrega"
        className="bg-gray-800 text-white p-2 rounded"
        value={miles(block.entregaInicial)}
        onChange={(e) => onChange("entregaInicial", onlyDigits(e.target.value))}
      />
      <input
        disabled
        value="30 cuotas"
        className="bg-gray-700 text-gray-300 p-2 rounded"
      />
      <input
        placeholder="Cuota"
        className="bg-gray-800 text-white p-2 rounded"
        value={miles(block.importeCuota)}
        onChange={(e) => onChange("importeCuota", onlyDigits(e.target.value))}
      />
      <input
        placeholder="Código plan"
        className="bg-gray-800 text-white p-2 rounded"
        value={block.codigoPlan}
        onChange={(e) => onChange("codigoPlan", e.target.value)}
      />
    </div>

    {showFecha && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <input
          type="date"
          className="bg-gray-800 text-white p-2 rounded"
          value={block.fechaDesde}
          onChange={(e) => onChange("fechaDesde", e.target.value)}
        />
        <input
          type="date"
          className="bg-gray-800 text-white p-2 rounded"
          value={block.fechaHasta}
          onChange={(e) => onChange("fechaHasta", e.target.value)}
        />
      </div>
    )}

    <button
      onClick={onSave}
      className="mt-4 px-6 py-2 bg-yellow-400 text-black
      font-semibold rounded-full hover:bg-yellow-300 transition"
    >
      Guardar
    </button>

    {block.error && (
      <div
        className="mt-3 text-sm text-red-600 bg-red-50
      border border-red-200 rounded px-3 py-2"
      >
        ⚠ {block.error}
      </div>
    )}

    {block.mensaje && (
      <div
        className="mt-3 text-sm text-green-600 bg-green-50
      border border-green-200 rounded px-3 py-2"
      >
        ✔ {block.mensaje}
      </div>
    )}
  </div>
);

export default GestionPrecios;

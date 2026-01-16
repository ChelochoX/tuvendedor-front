import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import marcasService from "api/marcasService";
import modelosService from "api/modelosProductoService";

import { Marca } from "types/marca";
import {
  ModeloProducto,
  CrearModeloProductoRequest,
} from "types/modeloProducto";

const GestionModelos: React.FC = () => {
  const navigate = useNavigate();

  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<ModeloProducto[]>([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<number | "">("");

  const [nombreModelo, setNombreModelo] = useState("");
  const [codigoReferencia, setCodigoReferencia] = useState("");
  const [rubro, setRubro] = useState("MOTO");

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarMarcas();
  }, []);

  useEffect(() => {
    if (marcaSeleccionada) cargarModelos();
    else setModelos([]);
  }, [marcaSeleccionada]);

  const cargarMarcas = async () => {
    const data = await marcasService.obtenerMarcas(true);
    setMarcas(data);
  };

  const cargarModelos = async () => {
    setLoading(true);
    try {
      const data = await modelosService.obtenerModelos(
        Number(marcaSeleccionada),
        false
      );
      setModelos(data);
    } finally {
      setLoading(false);
    }
  };

  const guardarModelo = async () => {
    if (!marcaSeleccionada || !nombreModelo.trim()) return;

    try {
      if (editandoId) {
        await modelosService.editarModelo({
          id: editandoId,
          idMarca: Number(marcaSeleccionada),
          nombreModelo,
          codigoReferencia,
        });
      } else {
        const payload: CrearModeloProductoRequest = {
          idMarca: Number(marcaSeleccionada),
          nombreModelo,
          codigoReferencia,
          rubro,
        };
        await modelosService.crearModelo(payload);
      }

      setNombreModelo("");
      setCodigoReferencia("");
      setEditandoId(null);
      cargarModelos();
    } catch {
      alert("Error al guardar el modelo");
    }
  };

  const toggleEstado = async (m: ModeloProducto) => {
    if (m.estado === "Activo") await modelosService.desactivarModelo(m.id);
    else await modelosService.activarModelo(m.id);

    cargarModelos();
  };

  return (
    <div className="p-6">
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        {/* ===== DESKTOP ===== */}
        <div className="hidden lg:flex items-center justify-between">
          <h1 className="text-2xl font-bold text-yellow-400">
            Gestión de Modelos
          </h1>

          <button
            onClick={() => navigate("/panel/dashboard")}
            className="
              flex items-center gap-2
              px-4 py-2 rounded-full
              border border-yellow-400/60
              text-yellow-300 font-medium
              hover:bg-yellow-400 hover:text-black
              transition-all duration-200
            "
          >
            <ArrowBackIcon fontSize="small" />
            Volver al Dashboard
          </button>
        </div>

        {/* ===== MOBILE ===== */}
        <div className="lg:hidden">
          <h1 className="text-2xl font-bold text-yellow-400 mb-2">
            Gestión de Modelos
          </h1>

          <button
            onClick={() => navigate("/panel/dashboard")}
            className="
              inline-flex items-center gap-2
              px-4 py-2 rounded-full
              bg-yellow-400 text-black
              font-semibold text-sm
              shadow
              hover:bg-yellow-300
              transition-all duration-200
            "
          >
            <ArrowBackIcon fontSize="small" />
            Volver al Dashboard
          </button>
        </div>
      </div>

      {/* ================= SELECT MARCA ================= */}
      <div className="mb-6">
        <label className="text-sm text-gray-300 block mb-1">Marca</label>
        <select
          value={marcaSeleccionada}
          onChange={(e) =>
            setMarcaSeleccionada(
              e.target.value === "" ? "" : Number(e.target.value)
            )
          }
          className="
            w-full md:w-80
            bg-gray-900 text-white px-4 py-2 rounded-lg
            border border-yellow-400
            focus:ring-2 focus:ring-yellow-400
          "
        >
          <option value="">Seleccionar marca</option>
          {marcas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* ================= FORM ================= */}
      {marcaSeleccionada && (
        <div className="bg-gray-800 p-4 rounded-lg border border-yellow-400 mb-6">
          <h2 className="text-yellow-400 font-semibold mb-3">
            {editandoId ? "Editar modelo" : "Nuevo modelo"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Nombre del modelo"
              value={nombreModelo}
              onChange={(e) => setNombreModelo(e.target.value)}
              className="px-3 py-2 rounded bg-gray-900 border border-gray-600 text-white"
            />

            <input
              placeholder="Código referencia"
              value={codigoReferencia}
              onChange={(e) => setCodigoReferencia(e.target.value)}
              className="px-3 py-2 rounded bg-gray-900 border border-gray-600 text-white"
            />

            <button
              onClick={guardarModelo}
              className={`px-4 py-2 rounded font-semibold transition-all
                ${
                  editandoId
                    ? "bg-orange-400 hover:bg-orange-500 text-black"
                    : "bg-yellow-400 hover:bg-yellow-500 text-black"
                }
              `}
            >
              {editandoId ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* ================= TABLA ================= */}
      <div className="bg-gray-900 rounded-lg border border-yellow-400 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 text-yellow-300">
            <tr>
              <th className="px-4 py-3">Modelo</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700 text-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">
                  Cargando modelos...
                </td>
              </tr>
            ) : modelos.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">
                  No hay modelos para esta marca
                </td>
              </tr>
            ) : (
              modelos.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-gray-800/70 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-100">
                    {m.nombreModelo}
                  </td>

                  <td className="px-4 py-3 text-gray-200">
                    {m.codigoReferencia}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs
                        ${
                          m.estado === "Activo"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                    >
                      {m.estado}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div
                      className="
                        flex flex-col gap-1
                        md:flex-row md:gap-3
                        md:justify-end
                        text-right
                      "
                    >
                      <button
                        onClick={() => {
                          setEditandoId(m.id);
                          setNombreModelo(m.nombreModelo);
                          setCodigoReferencia(m.codigoReferencia);
                        }}
                        className="text-yellow-400 hover:text-yellow-300 font-semibold"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => toggleEstado(m)}
                        className="text-gray-300 hover:text-white text-xs md:text-sm"
                      >
                        {m.estado === "Activo" ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionModelos;

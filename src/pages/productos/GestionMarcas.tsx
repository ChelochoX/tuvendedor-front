import { useEffect, useState } from "react";
import marcasService from "api/marcasService";
import { Marca } from "types/marca";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const GestionMarcas: React.FC = () => {
  const navigate = useNavigate();
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [nombre, setNombre] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const nombreValido = nombre.trim().length > 0;

  const cargarMarcas = async () => {
    setLoading(true);
    try {
      const data = await marcasService.obtenerMarcas(false);
      setMarcas(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMarcas();
  }, []);

  const guardarMarca = async () => {
    if (!nombre.trim()) return;

    try {
      if (editandoId) {
        await marcasService.editarMarca({
          id: editandoId,
          nombre,
        });
      } else {
        await marcasService.crearMarca({ nombre });
      }

      setNombre("");
      setEditandoId(null);
      cargarMarcas();
    } catch {
      alert("Error al guardar la marca");
    }
  };

  const toggleEstado = async (marca: Marca) => {
    if (marca.estado === "Activo") {
      await marcasService.desactivarMarca(marca.id);
    } else {
      await marcasService.activarMarca(marca.id);
    }
    cargarMarcas();
  };

  return (
    <div className="p-6">
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        {/* ===== DESKTOP ===== */}
        <div className="hidden lg:flex items-center justify-between">
          <h1 className="text-2xl font-bold text-yellow-400">
            Gestión de Marcas
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
            Gestión de Marcas
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

      {/* ================= FORMULARIO ================= */}
      <div className="bg-gray-800 p-4 rounded-lg border border-yellow-400 mb-6">
        <h2 className="text-yellow-400 font-semibold mb-3">
          {editandoId ? "Editar marca" : "Nueva marca"}
        </h2>

        <div className="flex gap-4">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la marca"
            className="flex-1 px-3 py-2 rounded bg-gray-900 border border-gray-600 text-white"
          />

          <button
            onClick={guardarMarca}
            disabled={!nombreValido}
            className={`px-4 py-2 rounded font-semibold transition-all
              ${
                !nombreValido
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : editandoId
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-yellow-400 hover:bg-yellow-500 text-black"
              }
            `}
          >
            {editandoId ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </div>

      {/* ================= TABLA ================= */}
      <div className="bg-gray-900 rounded-lg border border-yellow-400 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-700 text-yellow-300 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  Cargando marcas...
                </td>
              </tr>
            ) : marcas.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  No hay marcas registradas
                </td>
              </tr>
            ) : (
              marcas.map((m) => (
                <tr key={m.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-100">
                    {m.nombre}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          m.estado === "Activo"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                    >
                      {m.estado}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setNombre(m.nombre);
                        setEditandoId(m.id);
                      }}
                      className="text-yellow-400 hover:text-yellow-300 font-semibold"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => toggleEstado(m)}
                      className="text-gray-300 hover:text-white"
                    >
                      {m.estado === "Activo" ? "Desactivar" : "Activar"}
                    </button>
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

export default GestionMarcas;

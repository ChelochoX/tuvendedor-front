// src/pages/clientes/ListarInteresados.tsx
import React, { useEffect, useState } from "react";
import { obtenerInteresados } from "../../api/clientesService";
import { Interesado } from "../../types/clientes";
import Swal from "sweetalert2";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  seleccionado: Interesado | null;
  setSeleccionado: (i: Interesado | null) => void;
  recargarLista: boolean;
  setRecargarLista: (v: boolean) => void;
}

const ListarInteresados: React.FC<Props> = ({
  seleccionado,
  setSeleccionado,
  recargarLista,
  setRecargarLista,
}) => {
  const [interesados, setInteresados] = useState<Interesado[]>([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [filtros, setFiltros] = useState({
    nombre: "",
    estado: "",
    fechaDesde: new Date().toISOString().split("T")[0],
    fechaHasta: "",
    numeroPagina: 1,
    registrosPorPagina: 10,
  });

  const cargarInteresados = async () => {
    try {
      const data = await obtenerInteresados({
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta || undefined,
        nombre: filtros.nombre,
        estado: filtros.estado,
        numeroPagina: filtros.numeroPagina,
        registrosPorPagina: filtros.registrosPorPagina,
      });

      // 🔹 data ya tiene la forma { items, totalRegistros, paginaActual, registrosPorPagina }
      setInteresados(data.items || []);
      setTotalRegistros(data.totalRegistros || 0);
      setRecargarLista(false);
    } catch (error) {
      Swal.fire("Error", "No se pudieron obtener los interesados", "error");
    }
  };

  useEffect(() => {
    cargarInteresados();
  }, [filtros.numeroPagina, filtros.registrosPorPagina, recargarLista]);

  const totalPaginas = Math.ceil(totalRegistros / filtros.registrosPorPagina);

  return (
    <aside className="md:w-1/3 w-full p-3 border-b md:border-b-0 md:border-r border-yellow-400">
      <h2 className="text-lg font-semibold text-yellow-400 mb-2">
        Interesados
      </h2>

      {/* 🔹 Filtros */}
      <div className="space-y-2 mb-4 text-sm">
        <div>
          <label className="block text-gray-300 mb-1">Nombre:</label>
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={filtros.nombre}
            onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
            className="w-full p-1.5 text-sm rounded bg-gray-800 border border-gray-600"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Estado:</label>
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            className="w-full p-1.5 text-sm rounded bg-gray-800 border border-gray-600"
          >
            <option value="">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Pendiente">Pendiente</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Fecha desde:</label>
          <input
            type="date"
            value={filtros.fechaDesde}
            onChange={(e) =>
              setFiltros({ ...filtros, fechaDesde: e.target.value })
            }
            className="w-full p-1.5 text-sm rounded bg-gray-800 border border-gray-600"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Fecha hasta:</label>
          <input
            type="date"
            value={filtros.fechaHasta}
            onChange={(e) =>
              setFiltros({ ...filtros, fechaHasta: e.target.value })
            }
            className="w-full p-1.5 text-sm rounded bg-gray-800 border border-gray-600"
          />
        </div>

        <button
          onClick={() => {
            setFiltros({ ...filtros, numeroPagina: 1 });
            cargarInteresados();
          }}
          className="w-full bg-yellow-500 text-black font-semibold py-1.5 rounded hover:bg-yellow-400 transition mt-2"
        >
          Buscar
        </button>
      </div>

      {/* 🔹 Lista compacta de interesados */}
      <ul className="divide-y divide-gray-700 text-sm">
        {interesados.map((i) => (
          <li
            key={i.id}
            onClick={() => setSeleccionado(i)}
            className={`p-2 cursor-pointer rounded transition flex flex-wrap justify-between items-center gap-1 ${
              seleccionado?.id === i.id
                ? "bg-gray-700 border-l-4 border-yellow-400"
                : "hover:bg-gray-800"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-300">
              <strong className="text-yellow-400">{i.nombre}</strong>
              <span>📍 {i.ciudad || "Sin ciudad"}</span>
              <span>💼 {i.productoInteres || "Sin interés"}</span>
              <span>📅 {new Date(i.fechaRegistro).toLocaleDateString()}</span>
            </div>

            <span
              className={`text-xs font-semibold ${
                i.estado === "Pendiente"
                  ? "text-yellow-400"
                  : i.estado === "Activo"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {i.estado || "Sin estado"}
            </span>
          </li>
        ))}

        {interesados.length === 0 && (
          <li className="text-gray-400 text-center py-2 text-xs">
            No se encontraron interesados.
          </li>
        )}
      </ul>

      {/* 🔹 Paginación */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-3 text-xs text-gray-300 gap-2">
        <div className="flex items-center gap-2">
          <label>Mostrar:</label>
          <select
            value={filtros.registrosPorPagina}
            onChange={(e) =>
              setFiltros({
                ...filtros,
                registrosPorPagina: parseInt(e.target.value),
                numeroPagina: 1,
              })
            }
            className="bg-gray-800 border border-gray-600 rounded p-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <span>
            Página {filtros.numeroPagina} de {totalPaginas} — Total:{" "}
            {totalRegistros}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setFiltros((p) => ({
                  ...p,
                  numeroPagina: Math.max(1, p.numeroPagina - 1),
                }))
              }
              disabled={filtros.numeroPagina <= 1}
              className="p-2 rounded bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-40 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() =>
                setFiltros((p) => ({
                  ...p,
                  numeroPagina: Math.min(totalPaginas, p.numeroPagina + 1),
                }))
              }
              disabled={filtros.numeroPagina >= totalPaginas}
              className="p-2 rounded bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-40 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ListarInteresados;

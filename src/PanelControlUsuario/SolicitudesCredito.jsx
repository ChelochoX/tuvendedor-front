import React, { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
const basePath = import.meta.env.VITE_BASE_PATH || "/api/Motos/";

function SolicitudesCredito() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para el filtro seleccionado y su valor
  const [selectedFilter, setSelectedFilter] = useState("terminoDeBusqueda");
  const [filterValue, setFilterValue] = useState("");

  // Nuevos estados para el rango de fechas
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Paginación
  const [pagina, setPagina] = useState(1);
  const [cantidadRegistros, setCantidadRegistros] = useState(10);
  const [totalRegistros, setTotalRegistros] = useState(0);

  // Estado para manejar los registros seleccionados
  const [selectedRecords, setSelectedRecords] = useState([]);

  useEffect(() => {
    fetchData();
  }, [pagina, cantidadRegistros]);

  // Función para obtener los datos desde la API
  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        pagina,
        cantidadRegistros,
      });

      if (selectedFilter === "fechaCreacion") {
        // Filtrar por fecha única
        queryParams.append("fechaCreacion", filterValue);
      } else if (selectedFilter === "rangoFecha") {
        // Filtrar por rango de fecha
        queryParams.append("fechaInicio", fechaInicio);
        queryParams.append("fechaFin", fechaFin);
      } else {
        // Filtrar por término de búsqueda genérico o modelo solicitado
        queryParams.append(selectedFilter, filterValue);
      }

      const response = await fetch(
        `${apiUrl}${basePath}obtener-solicitudes-credito?${queryParams.toString()}`
      );
      const result = await response.json();

      setData(result.items || []);
      setTotalRegistros(result.totalRegistros || 0);

      setLoading(false);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setData([]);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagina(1); // Reinicia la paginación al realizar una nueva búsqueda
    fetchData();
  };

  const handlePageChange = (newPage) => {
    if (
      newPage > 0 &&
      newPage <= Math.ceil(totalRegistros / cantidadRegistros)
    ) {
      setPagina(newPage);
    }
  };

  const handleSelectRecord = (id) => {
    setSelectedRecords((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((recordId) => recordId !== id)
        : [...prevSelected, id]
    );
  };

  // Definir la función clearFilter aquí para borrar el valor del filtro
  const clearFilter = () => {
    setFilterValue("");
    setPagina(1); // Reiniciar a la primera página después de limpiar el filtro
    fetchData();
  };

  const totalPages = Math.ceil(totalRegistros / cantidadRegistros);
  const maxVisiblePages = 5;

  // Función para generar los botones de paginación
  const renderPaginationButtons = () => {
    const pages = [];
    let startPage = Math.max(1, pagina - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="min-w-9 rounded-full border border-slate-300 py-2 px-3.5 text-center text-sm text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 transition-all shadow-sm focus:text-white focus:bg-slate-800"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span
            key="dots-start"
            className="min-w-9 rounded-full py-2 px-3.5 text-center text-sm text-slate-600"
          >
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`min-w-9 rounded-full py-2 px-3.5 border text-center text-sm transition-all shadow-sm ${
            i === pagina
              ? "bg-slate-800 text-white border-transparent shadow-md"
              : "border-slate-300 text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span
            key="dots-end"
            className="min-w-9 rounded-full py-2 px-3.5 text-center text-sm text-slate-600"
          >
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="min-w-9 rounded-full border border-slate-300 py-2 px-3.5 text-center text-sm text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 transition-all shadow-sm focus:text-white focus:bg-slate-800"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  // Formato de número con puntos de miles
  const formatNumber = (number) => {
    return new Intl.NumberFormat("es-ES").format(number);
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Solicitudes de Crédito
      </h2>

      {/* Campo de Búsqueda Unificado */}
      <form onSubmit={handleSearch} className="mb-4 space-y-4 text-sm">
        <div className="flex items-center space-x-2">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-2 py-2 border rounded text-sm"
          >
            <option value="terminoDeBusqueda">Término de Búsqueda</option>
            <option value="modeloSolicitado">Modelo Solicitado</option>
            <option value="fechaCreacion">Fecha Única</option>
            <option value="rangoFecha">Rango de Fecha</option>
          </select>

          {selectedFilter === "fechaCreacion" ? (
            <input
              type="date"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Ingrese la fecha"
            />
          ) : selectedFilter === "rangoFecha" ? (
            <div className="flex space-x-2">
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Fecha inicio"
              />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Fecha fin"
              />
            </div>
          ) : (
            <div className="relative w-full">
              <input
                type="text"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Ingrese el término de búsqueda"
              />
              {filterValue && (
                <button
                  type="button"
                  onClick={clearFilter}
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                >
                  &#10005;
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Grilla de Datos */}
      {loading ? (
        <p className="text-sm">Cargando datos...</p>
      ) : (
        <div className="flex justify-center w-full overflow-auto mb-4">
          <div className="w-full max-w-7xl">
            <table className="w-full bg-yellow-50 rounded-lg shadow-lg text-xs">
              <thead>
                <tr className="bg-yellow-200 text-gray-700 uppercase font-bold tracking-wide">
                  <th className="py-2 px-4 font-semibold border-b-2 border-gray-300 text-center">
                    Seleccionar
                  </th>
                  <th className="py-2 px-4 font-semibold border-b-2 border-gray-300 text-center">
                    #
                  </th>
                  <th className="py-2 px-4 font-semibold border-b-2 border-gray-300 text-center">
                    Cédula
                  </th>
                  <th className="py-2 px-4 font-semibold border-b-2 border-gray-300 text-center">
                    Modelo Solicitado
                  </th>
                  <th className="py-2 px-4 font-semibold border-b-2 border-gray-300 text-center">
                    Entrega Inicial
                  </th>
                  <th className="py-2 px-4 font-semibold border-b-2 border-gray-300 text-center">
                    Cuotas
                  </th>
                  <th className="py-2 px-4 font-semibold border-b-2 border-gray-300 text-center">
                    Monto x Cuota
                  </th>
                  <th className="py-2 px-4 font-semibold border-b-2 border-gray-300 text-center">
                    Teléfono
                  </th>
                  <th className="py-2 px-4 font-semibold border-b-2 border-gray-300 text-center">
                    Fecha Creación
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {data.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 hover:bg-green-100"
                  >
                    <td className="py-2 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRecords.includes(row.id)}
                        onChange={() => handleSelectRecord(row.id)}
                      />
                    </td>
                    <td className="py-2 px-4 text-center">
                      {index + 1 + (pagina - 1) * cantidadRegistros}
                    </td>
                    <td className="py-2 px-4 text-center">{row.cedula}</td>
                    <td className="py-2 px-4 text-center">
                      {row.modeloSolicitado}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {row.entregaInicial}
                    </td>
                    <td className="py-2 px-4 text-center">{row.cuotas}</td>
                    <td className="py-2 px-4 text-center">
                      {formatNumber(row.montoPorCuota)}
                    </td>
                    <td className="py-2 px-4 text-center">{row.telefono}</td>
                    <td className="py-2 px-4 text-center">
                      {new Date(row.fechaCreacion).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Información y Paginación */}
      <div className="flex justify-between items-center mt-4 text-xs">
        <span>
          Mostrando{" "}
          {Math.min((pagina - 1) * cantidadRegistros + 1, totalRegistros)} -{" "}
          {Math.min(pagina * cantidadRegistros, totalRegistros)} de{" "}
          {totalRegistros} resultados
        </span>
        <div className="flex space-x-1">
          <button
            onClick={() => handlePageChange(pagina - 1)}
            disabled={pagina === 1}
            className="rounded-full border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 disabled:pointer-events-none disabled:opacity-50"
          >
            Prev
          </button>

          {renderPaginationButtons()}

          <button
            onClick={() => handlePageChange(pagina + 1)}
            disabled={pagina === totalPages}
            className="rounded-full border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 disabled:pointer-events-none disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default SolicitudesCredito;

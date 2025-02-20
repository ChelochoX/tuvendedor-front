import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
const basePath = import.meta.env.VITE_BASE_PATH || "/api/Motos/";

function SolicitudesCredito() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("terminoDeBusqueda");
  const [filterValue, setFilterValue] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [pagina, setPagina] = useState(1);
  const [cantidadRegistros, setCantidadRegistros] = useState(10);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detalleCredito, setDetalleCredito] = useState(null);
  const [isEditingSalario, setIsEditingSalario] = useState(false);
  const [aportaIPS, setAportaIPS] = useState(
    detalleCredito?.datosLaborales?.aportaIPS || false
  );

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

  // Función modificada para manejar la selección de un solo registro
  const handleSelectRecord = async (id) => {
    // Si ya está seleccionado, lo deselecciona y borra el detalle
    if (selectedRecord === id) {
      setSelectedRecord(null);
      setDetalleCredito(null);
    } else {
      setSelectedRecord(id);
      await fetchDetalleCredito(id); // Llama a la API para obtener los detalles
    }
  };

  const fetchDetalleCredito = async (id) => {
    try {
      const response = await fetch(
        `${apiUrl}${basePath}obtener-detalle-solicitud-credito/${id}`
      );
      const result = await response.json();
      console.log("Datos de detalle de crédito:", result); // Verificar datos recibidos
      setDetalleCredito(result.Data || {});
    } catch (error) {
      console.error("Error al obtener detalles de crédito:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDetalleCredito((prev) => ({ ...prev, [name]: value }));
  };

  // Definición de handleLaboralesChange
  const handleLaboralesChange = (e) => {
    const { name, value } = e.target;

    const parsedValue =
      name === "salario" ? parseFloat(value.replace(/,/g, "")) : value;

    setDetalleCredito((prevDetalle) => ({
      ...prevDetalle,
      datosLaborales: {
        ...prevDetalle.datosLaborales,
        [name]: parsedValue,
      },
    }));
  };

  // Manejador para activar la edición del salario
  const handleSalarioFocus = () => setIsEditingSalario(true);

  // Manejador para aplicar formato cuando el usuario deja de editar
  const handleSalarioBlur = () => setIsEditingSalario(false);

  const handleReferenciaComercialChange = (index, e) => {
    const { name, value } = e.target;
    const newReferenciasComerciales = [
      ...detalleCredito.referenciasComerciales,
    ];
    newReferenciasComerciales[index][name] = value;
    setDetalleCredito((prev) => ({
      ...prev,
      referenciasComerciales: newReferenciasComerciales,
    }));
  };

  const handleReferenciaPersonalChange = (index, e) => {
    const { name, value } = e.target;
    const newReferenciasPersonales = [...detalleCredito.referenciasPersonales];
    newReferenciasPersonales[index][name] = value;
    setDetalleCredito((prev) => ({
      ...prev,
      referenciasPersonales: newReferenciasPersonales,
    }));
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
  const formatNumber = (value) => {
    if (isNaN(value)) return ""; // Si el valor no es un número, devuelve una cadena vacía
    return new Intl.NumberFormat().format(value); // Formatea el número si es válido
  };

  const handleActualizarSolicitud = async () => {
    try {
      const idSolicitud = selectedRecord;
      const url = `${apiUrl}${basePath}solicitudcredito/actualizar/${idSolicitud}`;

      // Crear el objeto `solicitudCreditoData` de acuerdo a la estructura esperada en el backend
      const solicitudCreditoData = {
        modeloSolicitado: detalleCredito.modeloSolicitado,
        entregaInicial: detalleCredito.entregaInicial,
        cantidadCuotas: detalleCredito.cantidadCuotas,
        montoPorCuota: detalleCredito.montoPorCuota,
        nombresApellidos: detalleCredito.nombresApellidos,
        cedulaIdentidad: detalleCredito.cedulaIdentidad,
        telefonoMovil: detalleCredito.telefonoMovil,
        fechaNacimiento: detalleCredito.fechaNacimiento,
        barrio: detalleCredito.barrio,
        ciudad: detalleCredito.ciudad,
        direccionParticular: detalleCredito.direccionParticular,
        // Datos Laborales
        empresa: detalleCredito.datosLaborales?.empresa || "",
        telefonoLaboral: detalleCredito.datosLaborales?.telefonoLaboral || "",
        direccionLaboral: detalleCredito.datosLaborales?.direccionLaboral || "",
        antiguedadAnios: detalleCredito.datosLaborales?.antiguedadAnios || 0,
        aportaIPS: detalleCredito.datosLaborales?.aportaIPS || false,
        cantidadAportes: detalleCredito.datosLaborales?.aportaIPS
          ? detalleCredito.datosLaborales?.cantidadAportes || 0
          : 0,
        salario: detalleCredito.datosLaborales?.salario || 0,
        // Referencias Comerciales
        referenciasComerciales:
          detalleCredito.referenciasComerciales?.map((ref) => ({
            id: ref.id, // Incluye el ID de la referencia comercial
            nombreLocal: ref.nombreLocal,
            telefono: ref.telefono,
          })) || [],
        // Referencias Personales
        referenciasPersonales:
          detalleCredito.referenciasPersonales?.map((ref) => ({
            id: ref.id, // Incluye el ID de la referencia personal
            nombre: ref.nombre,
            telefono: ref.telefono,
          })) || [],
      };

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(solicitudCreditoData),
      });

      if (response.ok) {
        const result = await response.json();
        Swal.fire({
          icon: "success",
          title: "Solicitud Actualizada",
          text:
            result.message ||
            "La solicitud de crédito ha sido actualizada exitosamente",
          confirmButtonColor: "#4CAF50",
        });
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error al actualizar solicitud de crédito:", error);
      Swal.fire({
        icon: "error",
        title: "Error al Actualizar",
        text:
          error.message ||
          "Ocurrió un error inesperado al actualizar la solicitud de crédito",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleGenerarPDF = async () => {
    try {
      const idSolicitud = selectedRecord; // El ID seleccionado en la tabla
      const url = `${apiUrl}${basePath}solicitudcredito/generarpdf?idSolicitud=${idSolicitud}`;

      // Crear un nuevo objeto con los datos completos y consistentes
      const solicitudCreditoData = {
        modeloSolicitado: detalleCredito.modeloSolicitado,
        entregaInicial: detalleCredito.entregaInicial,
        cantidadCuotas: detalleCredito.cantidadCuotas,
        montoPorCuota: detalleCredito.montoPorCuota,
        nombresApellidos: detalleCredito.nombresApellidos,
        cedulaIdentidad: detalleCredito.cedulaIdentidad,
        telefonoMovil: detalleCredito.telefonoMovil,
        fechaNacimiento: detalleCredito.fechaNacimiento,
        barrio: detalleCredito.barrio,
        ciudad: detalleCredito.ciudad,
        direccionParticular: detalleCredito.direccionParticular,
        // Datos Laborales
        empresa: detalleCredito.datosLaborales?.empresa || "",
        telefonoLaboral: detalleCredito.datosLaborales?.telefonoLaboral || "",
        direccionLaboral: detalleCredito.datosLaborales?.direccionLaboral || "",
        antiguedadAnios: detalleCredito.datosLaborales?.antiguedadAnios || 0,
        aportaIPS: detalleCredito.datosLaborales?.aportaIPS || false,
        cantidadAportes: detalleCredito.datosLaborales?.aportaIPS
          ? detalleCredito.datosLaborales?.cantidadAportes || 0
          : 0,
        salario: detalleCredito.datosLaborales?.salario || 0,
        // Referencias Comerciales
        referenciasComerciales:
          detalleCredito.referenciasComerciales?.map((ref) => ({
            id: ref.id,
            nombreLocal: ref.nombreLocal,
            telefono: ref.telefono,
          })) || [],
        // Referencias Personales
        referenciasPersonales:
          detalleCredito.referenciasPersonales?.map((ref) => ({
            id: ref.id,
            nombre: ref.nombre,
            telefono: ref.telefono,
          })) || [],
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(solicitudCreditoData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const pdfUrl = window.URL.createObjectURL(blob);
        window.open(pdfUrl, "_blank");
        Swal.fire("PDF generado", "Documento generado exitosamente", "success");
      } else {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `Error ${response.status}`);
      }
    } catch (error) {
      console.error("Error al generar documento PDF:", error);
      Swal.fire({
        icon: "error",
        title: "Error al Generar documento PDF",
        text: error.message,
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleAportaIPSChange = (e) => {
    const isAportaIPS = e.target.value === "true";
    setAportaIPS(isAportaIPS);

    // Actualizar el estado de detalleCredito
    setDetalleCredito((prevDetalle) => ({
      ...prevDetalle,
      datosLaborales: {
        ...prevDetalle.datosLaborales,
        aportaIPS: isAportaIPS,
        cantidadAportes: isAportaIPS
          ? prevDetalle.datosLaborales?.cantidadAportes || ""
          : 0,
      },
    }));
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
                        checked={selectedRecord === row.id}
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

      {/* Mostrar detalles solo si hay datos en detalleCredito */}
      {detalleCredito && (
        <div className="bg-white p-4 mt-4 rounded-lg shadow-md text-xs">
          <h4 className="font-semibold text-lg mb-2">
            Detalles de Solicitud de Crédito
          </h4>

          {/* Datos Personales y Laborales en paralelo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-lg mb-2">Datos Personales</h4>
              <label>Nombres y Apellidos:</label>
              <input
                type="text"
                name="nombresApellidos"
                value={detalleCredito.nombresApellidos || ""}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border rounded mt-1"
              />
              {/* Cedula y Telefono Movil en paralelo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Cédula:</label>
                  <input
                    type="text"
                    name="cedulaIdentidad"
                    value={detalleCredito.cedulaIdentidad || ""}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border rounded mt-1"
                  />
                </div>
                <div>
                  <label>Teléfono Móvil:</label>
                  <input
                    type="text"
                    name="telefonoMovil"
                    value={detalleCredito.telefonoMovil || ""}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border rounded mt-1"
                  />
                </div>
              </div>

              <label>Fecha de Nacimiento:</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={
                  detalleCredito.fechaNacimiento
                    ? new Date(detalleCredito.fechaNacimiento)
                        .toISOString()
                        .substring(0, 10)
                    : ""
                }
                onChange={handleInputChange}
                className="w-full px-2 py-1 border rounded mt-1"
              />
              {/* Barrio y Ciudad en paralelo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Barrio:</label>
                  <input
                    type="text"
                    name="barrio"
                    value={detalleCredito.barrio || ""}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border rounded mt-1"
                  />
                </div>
                <div>
                  <label>Ciudad:</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={detalleCredito.ciudad || ""}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border rounded mt-1"
                  />
                </div>
              </div>

              <label>Dirección Particular:</label>
              <input
                type="text"
                name="direccionParticular"
                value={detalleCredito.direccionParticular || ""}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border rounded mt-1"
              />
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Datos Laborales</h4>
              <label>Empresa:</label>
              <input
                type="text"
                name="empresa"
                value={detalleCredito.datosLaborales?.empresa || ""}
                onChange={handleLaboralesChange}
                className="w-full px-2 py-1 border rounded mt-1"
              />
              <label>Dirección Laboral:</label>
              <input
                type="text"
                name="direccionLaboral"
                value={detalleCredito.datosLaborales?.direccionLaboral || ""}
                onChange={handleLaboralesChange}
                className="w-full px-2 py-1 border rounded mt-1"
              />

              {/* Teléfono Laboral y Salario en la misma línea */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label>Teléfono Laboral:</label>
                  <input
                    type="text"
                    name="telefonoLaboral"
                    value={detalleCredito.datosLaborales?.telefonoLaboral || ""}
                    onChange={handleLaboralesChange}
                    className="w-full px-2 py-1 border rounded mt-1"
                  />
                </div>
                <div>
                  <label>Salario:</label>
                  <input
                    type="text"
                    name="salario"
                    value={
                      isEditingSalario
                        ? detalleCredito.datosLaborales?.salario || ""
                        : formatNumber(detalleCredito.datosLaborales?.salario)
                    }
                    onChange={handleLaboralesChange}
                    onFocus={handleSalarioFocus}
                    onBlur={handleSalarioBlur}
                    className="w-full px-2 py-1 border rounded mt-1"
                  />
                </div>
              </div>

              {/* Antigüedad Años, Aporta IPS, y Cantidad de Aportes en la misma línea */}
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <label>Antigüedad (Años):</label>
                  <input
                    type="number"
                    name="antiguedadAnios"
                    value={detalleCredito.datosLaborales?.antiguedadAnios || ""}
                    onChange={handleLaboralesChange}
                    className="w-full px-2 py-1 border rounded mt-1"
                  />
                </div>
                <div>
                  <label>Aporta IPS:</label>
                  <select
                    name="aportaIPS"
                    value={aportaIPS ? "true" : "false"}
                    onChange={handleAportaIPSChange}
                    className="w-full px-2 py-1 border rounded mt-1"
                  >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div>
                  <label>Cantidad Aportes:</label>
                  <input
                    type="number"
                    name="cantidadAportes"
                    value={detalleCredito.datosLaborales?.cantidadAportes || ""}
                    onChange={handleLaboralesChange}
                    disabled={!aportaIPS} // Desactivar cuando aportaIPS es falso
                    className="w-full px-2 py-1 border rounded mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Referencias Comerciales y Personales en paralelo */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-semibold text-lg mb-2">
                Referencias Comerciales
              </h4>
              {detalleCredito.referenciasComerciales?.map(
                (refComercial, index) => (
                  <div key={index} className="mt-2">
                    <label>Nombre del Local {index + 1}:</label>
                    <input
                      type="text"
                      name="nombreLocal"
                      value={refComercial.nombreLocal || ""}
                      onChange={(e) =>
                        handleReferenciaComercialChange(index, e)
                      }
                      className="w-full px-2 py-1 border rounded mt-1"
                    />
                    <label>Teléfono:</label>
                    <input
                      type="text"
                      name="telefono"
                      value={refComercial.telefono || ""}
                      onChange={(e) =>
                        handleReferenciaComercialChange(index, e)
                      }
                      className="w-full px-2 py-1 border rounded mt-1"
                    />
                  </div>
                )
              )}
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">
                Referencias Personales
              </h4>
              {detalleCredito.referenciasPersonales?.map(
                (refPersonal, index) => (
                  <div key={index} className="mt-2">
                    <label>Nombre {index + 1}</label>
                    <input
                      type="text"
                      name="nombre"
                      value={refPersonal.nombre || ""}
                      onChange={(e) => handleReferenciaPersonalChange(index, e)}
                      className="w-full px-2 py-1 border rounded mt-1"
                    />
                    <label>Teléfono:</label>
                    <input
                      type="text"
                      name="telefono"
                      value={refPersonal.telefono || ""}
                      onChange={(e) => handleReferenciaPersonalChange(index, e)}
                      className="w-full px-2 py-1 border rounded mt-1"
                    />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div
            className="flex justify-start space-x-4 items-center"
            style={{ marginTop: "-2rem" }}
          >
            <button
              onClick={handleActualizarSolicitud}
              className="bg-lime-500 text-white font-semibold py-2 px-4 rounded shadow hover:bg-lime-600 transition-all"
            >
              Actualizar Datos
            </button>
            <button
              onClick={handleGenerarPDF}
              className="bg-lime-500 text-white font-semibold py-2 px-4 rounded shadow hover:bg-lime-600 transition-all"
            >
              Generar PDF
            </button>
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

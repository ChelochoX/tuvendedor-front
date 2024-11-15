import React, { useState, useEffect } from "react";

const CreditoResumen = () => {
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL del endpoint del backend para obtener las estadísticas de créditos
  const apiUrl = import.meta.env.VITE_API_URL;
  const basePath = import.meta.env.VITE_BASE_PATH;
  const creditosPath = "obtener-estadisticas-creditos"; // Endpoint específico para estadísticas de créditos
  const endpointUrl = `${apiUrl}${basePath}${creditosPath}`;

  // Función para obtener las estadísticas de créditos desde el backend
  const fetchEstadisticas = async () => {
    try {
      const response = await fetch(endpointUrl);
      if (!response.ok)
        throw new Error("Error al obtener las estadísticas de créditos");

      const data = await response.json();

      // Verificamos si el backend devuelve un arreglo válido en `Data`
      if (data.Success && Array.isArray(data.Data)) {
        setEstadisticas(data.Data);
      } else {
        console.error(
          "La respuesta no contiene un arreglo válido en 'Data':",
          data
        );
        setError("Datos de estadísticas de créditos no válidos");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error al obtener las estadísticas de créditos:", error);
      setError("No se pudo obtener las estadísticas de créditos");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  // Obtener el total de créditos generales
  const totalCreditosGenerales = estadisticas[0]?.totalCreditosGenerales || 0;

  // Agrupar los créditos por modelo
  const creditosPorModelo = estadisticas.reduce((acc, item) => {
    const modelo = item.modeloSolicitado;
    if (!acc[modelo]) {
      acc[modelo] = item.creditosPorModelo;
    }
    return acc;
  }, {});

  // Mapeo de nombres de los meses en español
  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // Agrupar los créditos por mes (asegurando que todos los meses estén representados)
  const creditosPorMes = nombresMeses.reduce((acc, nombreMes, index) => {
    const mes = `2024-${String(index + 1).padStart(2, "0")}`; // Formato "2024-01", "2024-02", etc.
    acc[nombreMes] = estadisticas
      .filter((item) => item.mes === mes)
      .reduce((sum, item) => sum + item.creditosPorMes, 0);
    return acc;
  }, {});

  return (
    <div className="p-4">
      {" "}
      {/* Reducimos el padding para acercar el título */}
      {loading && <p>Cargando estadísticas de créditos...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="bg-blue-50 shadow-lg rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {" "}
          {/* Fondo suave */}
          {/* Total de créditos en tamaño grande a la izquierda */}
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Total de Créditos Cargados
            </h2>
            <p className="text-8xl font-bold text-blue-600">
              {totalCreditosGenerales}
            </p>
          </div>
          {/* Créditos por modelo en el centro */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold text-gray-700 text-center md:text-left">
              Créditos por Modelo
            </h2>
            <ul className="mt-4 space-y-2">
              {Object.entries(creditosPorModelo).map(
                ([modelo, total], index) => (
                  <li key={index} className="flex justify-between text-lg">
                    <span className="text-gray-800">{modelo}</span>{" "}
                    {/* Sin font-bold */}
                    <span className="font-bold text-blue-600">{total}</span>
                  </li>
                )
              )}
            </ul>
          </div>
          {/* Créditos por mes a la derecha */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold text-gray-700 text-center md:text-left">
              Créditos por Mes
            </h2>
            <ul className="mt-4 space-y-2">
              {Object.entries(creditosPorMes).map(([nombreMes, cantidad]) => (
                <li key={nombreMes} className="flex justify-between text-lg">
                  <span className="text-gray-700">{nombreMes}</span>
                  <span className="font-bold text-blue-600">{cantidad}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditoResumen;

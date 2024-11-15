import React, { useState, useEffect } from "react";
import AccesoAPagina from "./AccesoAPagina";
import CreditoResumen from "./CreditoResumen"; // Importamos el componente CreditoResumen

const Dashboard = () => {
  const [accesos, setAccesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const basePath = import.meta.env.VITE_BASE_PATH;
  const accesoEstadisticasPath = "obtener-estadisticas-acceso";
  const endpointUrl = `${apiUrl}${basePath}${accesoEstadisticasPath}`;

  const fetchAccesos = async () => {
    try {
      const response = await fetch(endpointUrl);
      if (!response.ok) throw new Error("Error al obtener los datos de acceso");

      const data = await response.json();

      if (data.Success && Array.isArray(data.Data)) {
        setAccesos(data.Data);
      } else {
        console.error(
          "La respuesta no contiene un arreglo válido en 'Data':",
          data
        );
        setError("Datos de acceso no válidos");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error al obtener los datos de acceso:", error);
      setError("No se pudo obtener los datos de acceso");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccesos();
  }, []);

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Control de Acceso a Páginas</h1>

      {loading && <p>Cargando datos...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {/* Componente AccesoAPagina en la parte superior */}
          <AccesoAPagina accesos={accesos} />

          {/* Título y componente CreditoResumen en la parte inferior */}
          <h2 className="text-2xl font-bold mt-8 mb-4">
            Resumen Estado de Crédito
          </h2>
          <CreditoResumen />
        </>
      )}
    </div>
  );
};

export default Dashboard;

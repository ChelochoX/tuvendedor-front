import React, { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
const basePath = import.meta.env.VITE_BASE_PATH || "/api/Motos/";

function GenerarPDF() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para obtener los datos desde la API
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${apiUrl}${basePath}obtenerDatosSolicitudCredito`
        );
        const result = await response.json();
        setData(result); // Guarda los datos en el estado
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Solicitudes de Crédito
      </h2>
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full bg-white rounded-lg shadow-lg">
            <thead>
              <tr className="w-full bg-gray-200 text-left text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 font-semibold">#</th>
                <th className="py-3 px-6 font-semibold">Cédula</th>
                <th className="py-3 px-6 font-semibold">Modelo Solicitado</th>
                <th className="py-3 px-6 font-semibold">Entrega Inicial</th>
                <th className="py-3 px-6 font-semibold">Cuotas</th>
                <th className="py-3 px-6 font-semibold">Monto x Cuota</th>
                <th className="py-3 px-6 font-semibold">Teléfono</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {data.map((row, index) => (
                <tr
                  key={row.Id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6">{index + 1}</td>
                  <td className="py-3 px-6">{row.CedulaIdentidad}</td>
                  <td className="py-3 px-6">{row.ModeloSolicitado}</td>
                  <td className="py-3 px-6">{row.EntregaInicial}</td>
                  <td className="py-3 px-6">{row.CantidadCuotas}</td>
                  <td className="py-3 px-6">{row.MontoPorCuota}</td>
                  <td className="py-3 px-6">{row.TelefonoMovil}</td>
                  <td className="py-3 px-6">
                    <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                      Generar PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default GenerarPDF;

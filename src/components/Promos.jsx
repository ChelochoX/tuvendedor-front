import React, { useEffect, useState } from "react";
import CardsCategorias from "./CardsCategorias"; // Reutilizamos el componente para mostrar las promociones
import axios from "axios";

function Promos() {
  const [promos, setPromos] = useState([]); // Estado para guardar las promociones
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const promoPath = "listarproductoPromo"; // Endpoint de promociones

  // Función para obtener las promociones
  const fetchPromos = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/Motos/${promoPath}`);
      setPromos(response.data); // Guardar las promociones en el estado
    } catch (error) {
      console.error("Error al obtener las promociones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Llamar a la API al montar el componente
  useEffect(() => {
    fetchPromos();
  }, []);

  // Si no hay promociones, no mostramos nada
  if (!isLoading && promos.length === 0) {
    return null;
  }

  return (
    <div className="container mb-8">
      {/* Descripción de las promociones */}
      <div className="mb-6">
        {/* Título con gradiente */}
        <h2 className="text-left text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-3xl font-extrabold animate-gradient-fade">
          ¡Aprovecha nuestras ofertas exclusivas!
        </h2>

        {/* Subtítulo animado */}
        <p className="text-left text-gray-700 mt-2 text-lg animate-fade-in">
          Descubre las promociones que hemos preparado especialmente para ti.
        </p>
      </div>

      {/* Mostrar tarjetas de promociones */}
      {isLoading ? (
        <p className="text-left text-gray-500">Cargando promociones...</p>
      ) : (
        <CardsCategorias modelos={promos} isPromo={true} />
      )}

      {/* Efectos CSS personalizados */}
      <style>
        {`
          /* Efecto de gradiente dinámico */
          @keyframes gradientFade {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          .animate-gradient-fade {
            background-size: 200% 200%;
            animation: gradientFade 4s ease infinite;
          }

          /* Animación de aparición suave */
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in {
            animation: fadeIn 1.5s ease-in-out;
          }
        `}
      </style>
    </div>
  );
}

export default Promos;

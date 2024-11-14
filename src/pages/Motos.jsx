import React, { useState, useEffect } from "react";

import Sidebar from "../components/Sidebar"; // Importa Sidebar
import CardsCategorias from "../components/CardsCategorias"; // Importa CardsCategorias
import axios from "axios"; // Usaremos Axios para hacer la petición

function Motos() {
  const categories = [
    "ATV/Cuaci",
    "Motonetas",
    "Electricas",
    "Motocargas",
    "Automáticas",
    "Trail",
    "Utilitaria",
    "PROMOCIONES",
  ];

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [modelos, setModelos] = useState([]);
  const [showShake, setShowShake] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showArrowMessage, setShowArrowMessage] = useState(true);

  // Obtener la URL base desde la variable de entorno
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const basePath = import.meta.env.VITE_BASE_PATH || "/api/Motos/";
  const promoPath = "listarproductoPromo";

  // Función para obtener los modelos de la categoría seleccionada
  const fetchModelos = async (categoria) => {
    setIsLoading(true); //
    try {
      let response;
      if (categoria === "PROMOCIONES") {
        // Llama al endpoint específico de promociones
        response = await axios.get(`${apiUrl}${basePath}${promoPath}`);
      } else {
        // Convertimos '/' en '-' para la categoría 'ATV/CUACI'
        const formattedCategory = categoria.replace(/\//g, "-");
        // Llama a la API del backend para obtener los modelos con la categoría formateada
        response = await axios.get(
          `${apiUrl}${basePath}modelo/${formattedCategory}`
        );
      }

      // Actualiza el estado con los modelos obtenidos
      setModelos(response.data);
    } catch (error) {
    } finally {
      setIsLoading(false); // Finaliza la carga
    }
  };

  // Llamar a la API cada vez que cambie la categoría seleccionada
  useEffect(() => {
    fetchModelos(selectedCategory);
  }, [selectedCategory]);

  // Efecto de sacudida continuo cada 5 segundos si el sidebar está cerrado
  useEffect(() => {
    let interval;

    if (!isSidebarOpen) {
      // Configura un intervalo para la sacudida cada 5 segundos
      interval = setInterval(() => {
        setShowShake(true); // Activar sacudida
        setShowPromo(true); // Mostrar promoción

        // Después de 3 segundos, desactivar la sacudida y el pop-up
        setTimeout(() => {
          setShowShake(false);
          setShowPromo(false);
        }, 1000);
      }, 3000); // Cada 5 segundos
    }

    return () => clearInterval(interval); // Limpiar intervalo cuando se abra el sidebar o al desmontar
  }, [isSidebarOpen]);

  // Cambia el estado del sidebar con un solo clic
  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev); // Alterna el estado correctamente
  };

  // Definir isPromo para saber si la categoría seleccionada es 'PROMOCIONES'
  const isPromo = selectedCategory === "PROMOCIONES";

  // Añadimos solo este efecto para el desplazamiento hacia arriba
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedCategory]);

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex">
          {/* Botón de Categorías con efecto de sacudida y promo */}
          <div className="relative">
            <button
              className={`fixed top-28 left-4 z-50 p-2 bg-yellow-500 text-black font-bold rounded-lg shadow-md
              ${showShake ? "animate-shake" : ""} 
              p-2 text-base`} // Evitamos el crecimiento en móvil
              onClick={handleSidebarToggle} // Cambia el estado del sidebar con un solo clic
              style={{ transition: "none" }} // Evitar cualquier cambio de tamaño
            >
              Categorías
            </button>

            {/* Mensaje emergente de promo ajustado para estar justo al lado derecho en móvil y web */}
            {showPromo &&
              !isSidebarOpen && ( // Solo mostrar promo si el sidebar está cerrado
                <span className="absolute top-0 left-full ml-16 bg-red-500 text-white text-xs px-2 py-1 rounded-lg w-32 text-center">
                  ¡Presiona el botón Categorías!
                </span>
              )}
          </div>

          {/* Sidebar que actualizará la categoría seleccionada */}
          {isSidebarOpen && (
            <Sidebar
              categories={categories}
              setCategory={setSelectedCategory}
            />
          )}

          {/* Grid de Motos con margen izquierdo en modo web */}
          <div className="flex-1 md:ml-64">
            {/* Mostrar mensaje si está cargando */}
            {isLoading && <p>Cargando modelos...</p>}

            {/* Mostrar mensaje si no hay promociones y se seleccionó "PROMOCIONES" */}
            {!isLoading && isPromo && modelos.length === 0 && (
              <p>No hay promociones disponibles en este momento.</p>
            )}

            {/* Mostrar los modelos si hay datos */}
            {!isLoading && modelos.length > 0 && (
              <CardsCategorias modelos={modelos} isPromo={isPromo} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Motos;

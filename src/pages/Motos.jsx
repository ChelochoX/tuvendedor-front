import React, { useState, useEffect } from "react";
import CardsCategorias from "../components/CardsCategorias";
import Promos from "../components/Promos";
import SearchBar from "../components/SearchBar";
import axios from "axios";
import useDebounce from "../hooks/useDebounce";

function Motos() {
  const [modelos, setModelos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredModelos, setFilteredModelos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce para retrasar la búsqueda
  const debouncedSearchQuery = useDebounce(searchQuery, 3000);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const basePath = import.meta.env.VITE_BASE_PATH || "/api/Motos/";

  // Función para obtener todos los modelos
  const fetchModelos = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}${basePath}modelo`);
      setModelos(response.data); // Guardar todos los modelos obtenidos
      setFilteredModelos(response.data); // Inicializar los modelos filtrados
    } catch (error) {
      console.error("Error al obtener los modelos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para buscar modelos por coincidencia
  const buscarModelos = async (expresionBusqueda) => {
    if (!expresionBusqueda.trim()) {
      fetchModelos(); // Si el campo está vacío, obtenemos todos los modelos
      return;
    }

    setIsLoading(true);
    try {
      const url = `${apiUrl}${basePath}modelo/buscar/${encodeURIComponent(
        expresionBusqueda
      )}`;
      console.log(`Realizando búsqueda con URL: ${url}`);
      const response = await axios.get(url);
      setFilteredModelos(response.data); // Mostrar solo los modelos encontrados
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn("No se encontraron resultados para la búsqueda.");
        setFilteredModelos([]); // No hay resultados
      } else {
        console.error("Error al buscar modelos:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto inicial para obtener todos los modelos
  useEffect(() => {
    fetchModelos();
  }, []);

  // Efecto para manejar la búsqueda usando el debounce
  useEffect(() => {
    buscarModelos(debouncedSearchQuery); // Buscar modelos cuando `debouncedSearchQuery` cambie
  }, [debouncedSearchQuery]);

  const handleClearSearch = () => {
    setSearchQuery(""); // Limpia el texto del input
    fetchModelos(); // Recupera todos los modelos y promociones
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Contenedor principal */}
      <div className="w-full max-w-screen-lg mx-auto">
        {/* Buscador y descripción */}
        <div className="mb-8">
          <p className="text-gray-600 text-sm mb-2 text-left">
            Ingresa el modelo que deseas buscar (Ej: Dakar, GL, Motocarro)
          </p>
          <div className="w-full">
            <SearchBar
              placeholder="Ingresa el modelo a buscar (Ej: Dakar, GL, Motocarro)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={handleClearSearch}
              className="w-full" // Aseguramos que ocupe el mismo ancho
            />
          </div>
        </div>

        {/* Mostrar promociones y todos los modelos solo si no hay búsqueda */}
        {searchQuery.trim() === "" && (
          <>
            <Promos />
            <div className="my-12 text-left">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-green-500 to-orange-500 text-transparent bg-clip-text">
                ¡Explora más modelos que tenemos para ti!
              </h2>
            </div>
          </>
        )}

        {/* Mostrar mensaje si está cargando */}
        {isLoading && <p className="text-center">Cargando modelos...</p>}

        {/* Mostrar tarjetas de modelos */}
        {!isLoading && filteredModelos.length > 0 && (
          <div className="w-full">
            <CardsCategorias modelos={filteredModelos} isPromo={false} />
          </div>
        )}

        {/* Mostrar mensaje si no hay resultados */}
        {!isLoading && filteredModelos.length === 0 && searchQuery.trim() && (
          <p className="text-center text-gray-500">
            No se encontraron modelos que coincidan con tu búsqueda.
          </p>
        )}
      </div>
    </div>
  );
}

export default Motos;

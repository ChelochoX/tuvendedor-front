import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registrarVisita } from "../components/RegistrarVisita";

const CarruselHome = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]); // Estado para almacenar las imágenes desde el backend
  const [error, setError] = useState(null); // Estado para almacenar cualquier error

  const navigate = useNavigate(); // Hook para la navegación

  // Variables de entorno
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const basePath = import.meta.env.VITE_BASE_PATH || "/api/Motos/";
  const promoPath = "homecarrusel/imagenes"; // Ruta específica para obtener las imágenes en promoción

  // Función para cargar las imágenes desde el backend
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${apiUrl}${basePath}${promoPath}`);
        if (!response.ok) {
          throw new Error(
            `Error al cargar las imágenes: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setImages(data); // Guardar las imágenes en el estado
        } else {
          throw new Error("La respuesta no es un array");
        }
      } catch (error) {
        setError(error.message); // Guardar el error en el estado
      }
    };
    fetchImages();
  }, []);

  // Función para avanzar al siguiente slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Función para retroceder al slide anterior
  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Función para manejar el clic en una imagen y redirigir a la página de detalles
  const handleImageClick = async (nombre, url, isPromo = true) => {
    await registrarVisita(`CARRUSEL PROMOS`);

    // Quita la extensión de la imagen (por ejemplo, ".jpeg")
    const nombreSinExtension = nombre.replace(/\.[^/.]+$/, "");

    try {
      // Llamar al endpoint para obtener todas las imágenes del modelo seleccionado
      const response = await fetch(
        `${apiUrl}${basePath}modelo/${encodeURIComponent(
          nombreSinExtension
        )}/imagenes`
      );
      if (!response.ok) {
        throw new Error(
          `Error al cargar las imágenes del modelo: ${response.status} ${response.statusText}`
        );
      }
      const imagenesModelo = await response.json();

      // Navegar a la página de detalles con las imágenes del modelo
      navigate(`/motos/detalle/${nombreSinExtension}`, {
        state: {
          title: nombreSinExtension,
          images: imagenesModelo, // Enviar todas las imágenes del modelo
          isPromo: isPromo,
        },
      });
    } catch (error) {}
  };

  // Efecto para el desplazamiento automático
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide(); // Cambia la imagen automáticamente cada 4 segundos
    }, 4000);
    return () => clearInterval(interval); // Limpia el intervalo cuando el componente se desmonta
  }, [images]);

  return (
    <div className="relative w-full h-96 overflow-hidden mt-8">
      {error ? (
        <div className="text-red-500 text-center">Error: {error}</div>
      ) : (
        <div
          className="absolute top-0 left-0 w-full h-full flex transition-transform ease-in-out duration-500"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.length > 0 ? (
            images.map((image, index) => (
              <div key={index} className="w-full h-full flex-shrink-0">
                <img
                  src={`${apiUrl}${image.url}`}
                  alt={image.nombre}
                  className="w-full h-full object-contain transform hover:scale-110 hover:shadow-lg transition-transform duration-300 ease-in-out"
                  onClick={() => handleImageClick(image.nombre)} // Manejar clic en la imagen
                  style={{ cursor: "pointer" }} // Cambiar el cursor para indicar que es clickeable
                />
              </div>
            ))
          ) : (
            <p className="text-center">Cargando imágenes...</p>
          )}
        </div>
      )}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white px-4 py-2"
      >
        Prev
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white px-4 py-2"
      >
        Next
      </button>
    </div>
  );
};

export default CarruselHome;

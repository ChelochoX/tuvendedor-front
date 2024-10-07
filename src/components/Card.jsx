import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Card({ images, title, link }) {
  const navigate = useNavigate();

  // Estado para manejar el índice de la imagen actual
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  // Función para iniciar la rotación de imágenes
  const startImageRotation = () => {
    if (images.length > 1) {
      const id = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 1000); // Cambia la imagen cada 1 segundo
      setIntervalId(id);
    }
  };

  // Función para detener la rotación de imágenes
  const stopImageRotation = () => {
    if (intervalId) {
      clearInterval(intervalId); // Detener la rotación
      setIntervalId(null);
      setCurrentImageIndex(0); // Volver a la primera imagen
    }
  };

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId); // Limpiar el intervalo al desmontar el componente
      }
    };
  }, [intervalId]);

  const handleClick = () => {
    // Navegamos y pasamos imágenes y título como estado
    navigate(link, {
      state: { images, title }
    });
  };

  // Generar la URL de la imagen actual
  const currentImage = images && images.length > 0 ? `https://localhost:7040${images[currentImageIndex]}` : 'https://via.placeholder.com/600x400';

  return (
    <div
      onClick={handleClick} // Manejar el click para navegar
      className="max-w-sm rounded overflow-hidden shadow-lg bg-gray-100 hover:bg-gray-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer group"
      onMouseEnter={startImageRotation} // Iniciar rotación de imágenes en hover
      onMouseLeave={stopImageRotation} // Detener rotación al salir del hover
    >
      <div className="overflow-hidden">
        <img
          className="w-full h-52 object-cover transform hover:scale-105 transition-transform duration-300 ease-in-out"
          src={currentImage}
          alt={title}
        />
      </div>
      <div className="px-4 py-2">
        <div className="font-bold text-xl mb-2 text-gray-600 group-hover:text-orange-600 transition-colors duration-300">
          {title}
        </div>
      </div>
    </div>
  );
}

export default Card;

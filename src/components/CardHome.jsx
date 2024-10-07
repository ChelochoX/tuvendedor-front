import React from 'react';
import { useNavigate } from 'react-router-dom';

function CardHome({ image, title, link }) {
  const navigate = useNavigate(); // Para manejar la navegación

  return (
    <div
      onClick={() => navigate(link)} // Navegar a la página al hacer click en la tarjeta
      className="max-w-sm rounded overflow-hidden shadow-lg cursor-pointer bg-gray-100 hover:bg-gray-200 transform hover:scale-105 transition-all duration-300 group border border-transparent hover:border-orange-500"
    >
      <img className="w-full h-52 object-cover" src={image} alt={title} />
      <div className="px-4 py-2 bg-gray-300"> {/* Fondo gris claro */}
        <div className="font-bold text-lg text-gray-700 group-hover:text-orange-600 transition-colors duration-300"> {/* Texto gris que cambia a naranja en hover */}
          {title}
        </div>
      </div>
    </div>
  );
}

export default CardHome;

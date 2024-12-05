import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Card({ images, title, link, isPromo }) {
  const navigate = useNavigate();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const startImageRotation = () => {
    if (images.length > 1) {
      const id = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 1000);
      setIntervalId(id);
    }
  };

  const stopImageRotation = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setCurrentImageIndex(0);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const handleClick = () => {
    navigate(link, {
      state: { images, title, isPromo },
    });
  };

  const currentImage =
    images && images.length > 0
      ? `${apiUrl}${images[currentImageIndex]}`
      : "https://via.placeholder.com/600x400";

  return (
    <div
      onClick={handleClick}
      className="relative max-w-sm rounded overflow-hidden shadow-lg bg-gray-100 hover:bg-gray-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer group"
      onMouseEnter={startImageRotation}
      onMouseLeave={stopImageRotation}
      onTouchStart={startImageRotation}
      onTouchEnd={stopImageRotation}
    >
      {/* Etiqueta de Promo */}
      {isPromo && (
        <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg z-10">
          Tanque Lleno!!
        </span>
      )}

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

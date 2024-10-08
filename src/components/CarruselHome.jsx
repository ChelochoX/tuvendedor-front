import React, { useState, useEffect } from 'react';

// Importar las imágenes
import img1 from '../assets/images/MotosCarrusel/1.jpeg';
import img2 from '../assets/images/MotosCarrusel/2.jpeg';
import img3 from '../assets/images/MotosCarrusel/3.jpeg';
import img4 from '../assets/images/MotosCarrusel/4.jpeg';
import img5 from '../assets/images/MotosCarrusel/5.jpeg';
import img6 from '../assets/images/MotosCarrusel/6.jpeg';
import img7 from '../assets/images/MotosCarrusel/7.jpeg';
import img8 from '../assets/images/MotosCarrusel/8.jpeg';
import img9 from '../assets/images/MotosCarrusel/9.jpeg';
import img10 from '../assets/images/MotosCarrusel/10.jpeg';
import img11 from '../assets/images/MotosCarrusel/11.jpeg';
import img12 from '../assets/images/MotosCarrusel/12.jpeg';
import img13 from '../assets/images/MotosCarrusel/13.jpeg';
import img14 from '../assets/images/MotosCarrusel/14.jpeg';
import img15 from '../assets/images/MotosCarrusel/15.jpeg';
import img16 from '../assets/images/MotosCarrusel/16.jpeg';
import img17 from '../assets/images/MotosCarrusel/17.jpeg';
import img18 from '../assets/images/MotosCarrusel/18.jpeg';
import img19 from '../assets/images/MotosCarrusel/19.jpeg';

const CarruselHome = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    img1, img2, img3, img4, img5, img6, img7, img8, img9, img10,
    img11, img12, img13, img14, img15, img16, img17, img18, img19
  ];

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

  // Efecto para el desplazamiento automático
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();  // Cambia la imagen automáticamente cada 3 segundos
    }, 4000);

    return () => clearInterval(interval);  // Limpia el intervalo cuando el componente se desmonta
  }, []);

  return (
    <div className="relative w-full h-96 overflow-hidden mt-8">
      <div
        className="absolute top-0 left-0 w-full h-full flex transition-transform ease-in-out duration-500"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full h-full flex-shrink-0">
            <img
              src={image}
              alt={`Slide ${index}`}
              className="w-full h-full object-contain transform hover:scale-110 hover:shadow-lg transition-transform duration-300 ease-in-out"
            />
          </div>
        ))}
      </div>
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

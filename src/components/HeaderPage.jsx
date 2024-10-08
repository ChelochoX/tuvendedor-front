import React from 'react';
import KentonLogo from '../assets/images/kentonlogo.png';  // Logo de Kenton
import YamahaLogo from '../assets/images/yamahalogo.png';  // Logo de Yamaha

function HeaderPage({ category }) {
  return (
    <header className="sticky top-0 z-50">
      {/* Barra superior negra con texto en movimiento */}
      <div className="bg-black text-white text-sm py-2 overflow-hidden relative">
        <div className="marquee-container">
          <div className="marquee">
            {/* Primer grupo de mensajes */}
            <span className="marquee-item mx-16 text-yellow-500 font-bold">
              Comunícate con <span className="text-green-400">Nosotros</span> y elige el modelo que más te guste!!
            </span>

            {/* Segundo grupo de mensajes */}
            <span className="marquee-item mx-16">
              <span className="text-yellow-500">WhatsApp</span> <span className="text-green-400">0982 12 12 69</span> - <span className="text-green-400">0991 64 58 06</span>
            </span>

            {/* Tercer grupo de mensajes */}
            <span className="marquee-item mx-16">
              ¿Quieres que tu <span className="text-yellow-500">Marca</span> sea conocida? <span className="text-green-400">Llamanos!!</span> <span className="text-green-400">0994 60 60 48</span>
            </span>

            {/* Logos de marcas alineados horizontalmente */}
            <span className="marquee-item mx-16 flex items-center whitespace-nowrap">
              <span className="text-white mr-2">Nuestras marcas:</span>
              <img src={KentonLogo} alt="Kenton Logo" className="h-6 inline-block mr-4" />
              <img src={YamahaLogo} alt="Yamaha Logo" className="h-6 inline-block" />
            </span>
          </div>
        </div>
      </div>

      {/* Encabezado principal con logo y navegación */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto flex justify-between items-center py-4 px-4">
          {/* Logo */}
          <div className="flex items-center">
            <img src="https://via.placeholder.com/100x50" alt="Logo Kenton" className="mr-4" />
          </div>

          {/* Menú de navegación */}
          <nav className="flex space-x-6">
            <a href="#" className="text-gray-700 font-semibold hover:text-orange-500">INICIO</a>
            <a href="#" className="text-gray-700 font-semibold hover:text-orange-500">NOSOTROS</a>
            <a href="#" className="text-gray-700 font-semibold hover:text-orange-500">MOTOS</a>
            <a href="#" className="text-gray-700 font-semibold hover:text-orange-500">INMUEBLES</a>
            <a href="#" className="text-gray-700 font-semibold hover:text-orange-500">VEHICULOS</a>
            <a href="#" className="text-gray-700 font-semibold hover:text-orange-500">CONTACTO</a>
          </nav>
        </div>
      </div>

      {/* Estilos para el efecto marquee */}
      <style>{`
        .marquee-container {
          overflow: hidden;
          position: relative;
          height: 30px; /* Ajusta el alto si es necesario */
        }

        .marquee {
          display: flex;
          white-space: nowrap;
          animation: scroll 60s linear infinite; /* Aumentar el tiempo de la animación para que sea más lenta */
        }

        .marquee-item {
          display: inline-block;
          visibility: visible;
        }

        /* Cambia la dirección para mover de izquierda a derecha */
        @keyframes scroll {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .h-6 {
          height: 24px; /* Ajustar la altura para asegurar que los logos se vean */
        }
      `}</style>
    </header>
  );
}

export default HeaderPage;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import KentonLogo from '../assets/images/kentonlogo.png';
import YamahaLogo from '../assets/images/yamahalogo.png';

function HeaderPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setIsMenuOpen(false); // Cierra el menú al hacer clic en un enlace
  };

  return (
    <header className="sticky top-0 z-50 bg-yellow-200">
      {/* Barra superior negra con texto en movimiento */}
      <div className="bg-black text-white text-sm py-2 overflow-hidden relative">
        <div className="marquee-container">
          <div className="marquee">
            <span className="marquee-item mx-16 text-yellow-500 font-bold">
              Comunícate con <span className="text-green-400">Nosotros</span> y elige el modelo que más te guste!!
            </span>
            <span className="marquee-item mx-16">
              <span className="text-yellow-500">WhatsApp</span> <span className="text-green-400">0982 12 12 69</span> - <span className="text-green-400">0991 64 58 06</span>
            </span>
            <span className="marquee-item mx-16">
              ¿Quieres que tu <span className="text-yellow-500">Marca</span> sea conocida? <span className="text-green-400">Llamanos!!</span> <span className="text-green-400">0994 60 60 48</span>
            </span>
          </div>
        </div>
      </div>

      {/* Encabezado principal con logo y navegación */}
      <div className="bg-yellow-200 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center py-1 px-4">
          {/* Texto animado que simula el logo */}
          <div className="flex items-center">
            <div className="animated-logo">
              <span className="logo-text text-3xl md:text-4xl">TU VENDEDOR</span>
            </div>
          </div>

          {/* Botón menú hamburguesa para móviles */}
          <button
            className="md:hidden mt-2 text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>

          {/* Menú de navegación desplegable */}
          <nav
            className={`${
              isMenuOpen ? 'block' : 'hidden'
            } mt-2 md:mt-0 md:flex md:flex-row space-y-2 md:space-y-0 md:space-x-6`}
          >
            <Link to="/" className="text-gray-700 font-semibold hover:text-orange-500 block" onClick={handleLinkClick}>
              INICIO
            </Link>
            <Link to="/nosotros" className="text-gray-700 font-semibold hover:text-orange-500 block" onClick={handleLinkClick}>
              NOSOTROS
            </Link>
            <Link to="/motos" className="text-gray-700 font-semibold hover:text-orange-500 block" onClick={handleLinkClick}>
              MOTOS
            </Link>
            <Link to="/inmuebles" className="text-gray-700 font-semibold hover:text-orange-500 block" onClick={handleLinkClick}>
              INMUEBLES
            </Link>
            <Link to="/vehiculos" className="text-gray-700 font-semibold hover:text-orange-500 block" onClick={handleLinkClick}>
              VEHICULOS
            </Link>
            <Link to="/contacto" className="text-gray-700 font-semibold hover:text-orange-500 block" onClick={handleLinkClick}>
              CONTACTO
            </Link>
          </nav>
        </div>
      </div>

      {/* Estilos para el efecto de estiramiento y animación */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bungee&display=swap');

        .animated-logo {
          text-align: center;
        }

        .logo-text {
          font-family: 'Bungee', sans-serif;
          text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.8);
        }

        .marquee-container {
          overflow: hidden;
          position: relative;
          height: 30px;
        }

        .marquee {
          display: flex;
          white-space: nowrap;
          animation: scroll 60s linear infinite;
        }

        @keyframes scroll {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </header>
  );
}

export default HeaderPage;

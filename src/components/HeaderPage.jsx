import React from 'react';
import { Link } from 'react-router-dom';
import KentonLogo from '../assets/images/kentonlogo.png';
import YamahaLogo from '../assets/images/yamahalogo.png';

function HeaderPage({ category }) {
  return (
    <header className="sticky top-0 z-50 bg-yellow-200"> {/* Fondo amarillo claro en todo el encabezado */}
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
      <div className="bg-yellow-200 shadow-md">
        <div className="container mx-auto flex justify-between items-center py-1 px-4">  {/* Reducir el padding superior/inferior */}
          {/* Texto animado que simula el logo */}
          <div className="flex items-center">
            <div className="animated-logo">
              <span className="logo-text">TU VENDEDOR</span>
            </div>
          </div>

          {/* Menú de navegación */}
          <nav className="flex space-x-6">
            <Link to="/" className="text-gray-700 font-semibold hover:text-orange-500">INICIO</Link>
            <Link to="/nosotros" className="text-gray-700 font-semibold hover:text-orange-500">NOSOTROS</Link>
            <Link to="/motos" className="text-gray-700 font-semibold hover:text-orange-500">MOTOS</Link>
            <Link to="/inmuebles" className="text-gray-700 font-semibold hover:text-orange-500">INMUEBLES</Link>
            <Link to="/vehiculos" className="text-gray-700 font-semibold hover:text-orange-500">VEHICULOS</Link>
            <Link to="/contacto" className="text-gray-700 font-semibold hover:text-orange-500">CONTACTO</Link>
          </nav>
        </div>
      </div>

      {/* Estilos para el efecto de estiramiento constante */}
      <style>{`
        /* Fuente Bungee importada desde Google Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Bungee&display=swap');

        .animated-logo {
          display: inline-block;
          padding: 0px 10px; /* Reducir el padding alrededor del texto */
          text-align: center;
        }

        .logo-text {
          font-size: 44px;
          font-weight: bold;
          color: black;
          font-family: 'Bungee', sans-serif;
          text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.8); /* Sombra */
          animation: stretchEffect 4s ease-in-out infinite; /* Animación constante de 4 segundos */
        }

        @keyframes stretchEffect {
          0%, 100% {
            transform: scale(1, 1); /* Estado normal */
          }
          50% {
            transform: scale(1.5, 1); /* Estiramiento horizontal más pronunciado */
          }
        }

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

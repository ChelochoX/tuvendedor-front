// src/pages/Home.jsx
import React from 'react';
import CardHome from '../components/CardHome.jsx';  // Cambiamos a CardHome
import motoImg from '../assets/images/spark150.jpg'; 
import vehiculoImg from '../assets/images/toyotarumium.jpg';
import inmuebleImg from '../assets/images/casa.webp';
import CarruselHome from '../components/CarruselHome';

function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"> {/* Aumenté el espacio entre las cards */}
        {/* Primera Card */}
        <CardHome
          image={motoImg}
          title="MOTOS"   
          link="/motos"       
        />
        {/* Segunda Card */}
        <CardHome
          image={vehiculoImg}
          title="VEHICULOS"    
          link="/vehiculos"       
        />
        {/* Tercera Card */}
        <CardHome
          image={inmuebleImg}
          title="INMUEBLES" 
          link="/inmuebles"        
        />
      </div>

      <div className="relative my-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 opacity-50 blur-xl transform scale-90 animate-gradient-shift"></div>
        <h2 className="relative text-4xl font-bold text-gray-900 z-10">
          ¡Descubre nuestras promociones de temporada!
        </h2>
        <p className="relative text-lg text-gray-700 mt-2 z-10">
          Ofertas irresistibles que no puedes dejar pasar. ¡Haz tu compra ahora y disfruta de descuentos exclusivos!
        </p>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradientShift 5s ease infinite;
        }
      `}</style>

      {/* CarruselHome debajo de las tarjetas */}
      <div className="mb-8">
        <CarruselHome />
      </div>
    </div>
  );
}

export default Home;

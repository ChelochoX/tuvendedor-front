// src/pages/Home.jsx
import React from "react";
import CardHome from "../components/CardHome.jsx";
import motoImg from "../assets/images/spark150.jpg";
import vehiculoImg from "../assets/images/toyotarumium.jpg";
import inmuebleImg from "../assets/images/casa.webp";
import CarruselHome from "../components/CarruselHome";
import { registrarVisita } from "../components/RegistrarVisita";

function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mensaje para seleccionar categoría */}
      <div className="text-center my-6">
        <h1 className="text-4xl font-bold text-blue-600">
          Selecciona una categoría de búsqueda
        </h1>
      </div>

      {/* Tarjetas de categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Primera Card */}
        <div onClick={() => registrarVisita("MOTOS")}>
          <CardHome image={motoImg} title="MOTOS" link="/motos" />
        </div>

        {/* Segunda Card */}
        <div onClick={() => registrarVisita("VEHICULOS")}>
          <CardHome image={vehiculoImg} title="VEHICULOS" link="/vehiculos" />
        </div>

        {/* Tercera Card */}
        <div onClick={() => registrarVisita("INMUEBLES")}>
          <CardHome image={inmuebleImg} title="INMUEBLES" link="/inmuebles" />
        </div>
      </div>

      <div className="relative my-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 opacity-50 blur-xl transform scale-90 animate-gradient-shift"></div>
        <h2 className="relative text-4xl font-bold text-gray-900 z-10">
          No dejes pasar estas <span className="promociones">PROMOCIONES</span>
        </h2>
      </div>

      {/* Estilos inline para evitar errores con el atributo `jsx` */}
      <style>
        {`
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

          .promociones {
            color: #ff5733;
            font-weight: bold;
            font-size: 1.2em;
            display: inline-block;
            position: relative;
            animation: bounce 2s infinite;
          }

          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}
      </style>

      {/* CarruselHome debajo de las tarjetas */}
      <div className="mb-8">
        <CarruselHome />
      </div>
    </div>
  );
}

export default Home;

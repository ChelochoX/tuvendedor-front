// src/components/Header.jsx
import React from 'react';
import video from '../assets/videos/video-tuvendedor.mp4'

function Header() {
  return (
    <header className="relative bg-black text-yellow-500 h-96 flex flex-col justify-center items-center">
      <div className="w-full h-full flex justify-center items-center relative">
        {/* Video como banner */}
        <video
          src={video}  // Cambia la ruta por la correcta
          className="w-full h-full object-cover"  // Asegura que el video cubra todo el contenedor
          autoPlay
          loop
          muted
        />

        {/* Contenido encima del video */}
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50">
          <h1 className="text-5xl font-bold">0982 121269</h1>
          <p className="text-xl font-semibold">@motosTuVendedor</p>
        </div>
      </div>
    </header>
  );
}

export default Header;

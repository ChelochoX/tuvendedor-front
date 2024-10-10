// src/components/Header.jsx
import React from 'react';
import video from '../assets/videos/tuvendedorvideo.mp4';
import leftImage from '../assets/images/motosheader.png';
import rightImage from '../assets/images/motosheader.png';

function Header() {
  return (
    <header className="relative bg-black text-yellow-500 w-full h-96 flex justify-center items-center">
      <div className="flex items-center justify-between w-full h-full">
        {/* Imagen izquierda: Oculta en pantallas pequeñas */}
        <img
          src={leftImage}
          alt="Imagen izquierda"
          className="hidden md:block flex-1 h-full object-cover"
        />

        {/* Video en el centro */}
        <div className="flex-1 h-full flex justify-center items-center">
          <video
            src={video}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>

        {/* Imagen derecha: Oculta en pantallas pequeñas */}
        <img
          src={rightImage}
          alt="Imagen derecha"
          className="hidden md:block flex-1 h-full object-cover"
        />
      </div>
    </header>
  );
}

export default Header;

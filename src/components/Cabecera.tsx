import React from "react";

const Cabecera: React.FC = () => {
  return (
    <header className="w-full bg-[#1a1a1a] text-white border-b-2 border-[#facc15] shadow-md sticky top-0 z-50 px-4 py-3">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
          <h1 className="text-xl font-bold text-white">TuVendedor</h1>
        </div>

        <input
          type="text"
          placeholder="Buscar productos..."
          className="w-full md:w-[400px] px-4 py-2 bg-white text-black border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <button className="text-sm text-yellow-400 hover:underline">
          Iniciar sesión
        </button>
      </div>
    </header>
  );
};

export default Cabecera;

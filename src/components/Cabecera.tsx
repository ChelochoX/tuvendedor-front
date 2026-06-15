import React, { useState } from "react";
import { useUsuario } from "../context/UsuarioContext";

interface CabeceraProps {
  busqueda: string;
  setBusqueda: (value: string) => void;
}

const Cabecera: React.FC<CabeceraProps> = ({ busqueda, setBusqueda }) => {
  const { usuario, cerrarSesion } = useUsuario();

  return (
    <header className="w-full bg-[#1a1a1a] text-white border-b-2 border-[#facc15] shadow-md sticky top-0 z-50 px-4 py-3">
      {/* ===========================================
          🔥 1) CABECERA ESCRITORIO (NO SE TOCA NADA)
      ============================================ */}
      <div className="hidden md:flex items-center justify-between">
        {/* Marca */}
        <h1 className="text-xl font-bold">Tu Vendedor</h1>

        {/* Buscador centrado */}
        <div className="flex-1 flex justify-center relative">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-[400px] px-4 py-2 pr-10 bg-white text-black border border-gray-300 rounded-full
               focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-[calc(50%-200px+12px)] top-1/2 -translate-y-1/2
                 text-gray-500 hover:text-black transition"
              aria-label="Limpiar búsqueda"
            >
              ❌
            </button>
          )}
        </div>

        {/* Usuario */}
        {usuario ? (
          <div className="flex items-center gap-4">
            <img
              src={
                usuario.fotoUrl?.trim()
                  ? usuario.fotoUrl
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              className="w-8 h-8 rounded-full object-cover"
            />

            <span className="text-sm font-semibold">
              {usuario.nombreUsuario}
            </span>

            <button
              onClick={cerrarSesion}
              className="text-sm bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-full"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <button
            onClick={() => window.dispatchEvent(new Event("abrir-login"))}
            className="text-sm bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-full"
          >
            Iniciar sesión
          </button>
        )}
      </div>

      {/* ===========================================
          🔥 2) CABECERA MOBILE (DISEÑO CUSTOM)
      ============================================ */}
      <div className="flex md:hidden flex-col gap-2">
        {/* Línea 1: menú + marca + usuario compacto */}
        <div className="flex items-center justify-between">
          {/* Botón hamburguesa */}
          <button
            onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))}
            className="text-2xl"
          >
            ☰
          </button>

          {/* Marca */}
          <h1 className="text-lg font-bold">Tu Vendedor</h1>

          {/* Usuario */}
          {usuario ? (
            <div className="flex items-center gap-2">
              <img
                src={
                  usuario.fotoUrl?.trim()
                    ? usuario.fotoUrl
                    : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                className="w-7 h-7 rounded-full object-cover"
              />

              <button
                onClick={cerrarSesion}
                className="text-xs bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded-full"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <button
              onClick={() => window.dispatchEvent(new Event("abrir-login"))}
              aria-label="Iniciar sesión"
              className="text-xs bg-yellow-400 hover:bg-yellow-300 text-black px-3 py-1 rounded-full font-semibold min-w-[76px]"
            >
              Ingresar
            </button>
          )}
        </div>

        {/* Nombre del usuario debajo */}
        {usuario && (
          <div className="text-right pr-3 text-xs font-medium opacity-90 -mt-1">
            {usuario.nombreUsuario}
          </div>
        )}

        {/* Buscador mobile */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-3 py-2 pr-9 text-sm bg-white text-black border border-gray-300 rounded-full
               focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-1/2 -translate-y-1/2
                 text-gray-500 hover:text-black transition"
              aria-label="Limpiar búsqueda"
            >
              ❌
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Cabecera;

import React from "react";
import { useUsuario } from "../context/UsuarioContext";

const Cabecera: React.FC = () => {
  const { usuario, cerrarSesion } = useUsuario();

  return (
    <header className="w-full bg-[#1a1a1a] text-white border-b-2 border-[#facc15] shadow-md sticky top-0 z-50 px-4 py-2 md:py-3">
      <div className="flex items-center justify-between">
        {/* IZQUIERDA - MENU + MARCA */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))}
          >
            ☰
          </button>

          <h1 className="text-lg md:text-xl font-bold leading-tight whitespace-nowrap">
            Tu Vendedor
          </h1>
        </div>

        {/* DERECHA - USUARIO */}
        {usuario ? (
          <div className="flex items-center gap-2 md:gap-3">
            {/* Avatar */}
            <img
              src={
                usuario.fotoUrl?.trim()
                  ? usuario.fotoUrl
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover"
            />

            {/* Nombre SOLO en escritorio */}
            <span className="hidden md:block text-sm font-medium">
              {usuario.nombreUsuario}
            </span>

            {/* Nombre SOLO en mobile debajo del avatar */}
            <span className="block md:hidden text-xs text-right leading-tight">
              {usuario.nombreUsuario}
            </span>

            {/* BOTÓN CERRAR */}
            <button
              onClick={cerrarSesion}
              className="text-xs md:text-sm bg-red-500 hover:bg-red-400 text-white px-3 py-1 md:px-4 md:py-2 rounded-full"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <button
            onClick={() => window.dispatchEvent(new Event("abrir-login"))}
            className="text-xs md:text-sm bg-yellow-400 hover:bg-yellow-300 text-black px-3 py-1 md:px-4 md:py-2 rounded-full"
          >
            Iniciar sesión
          </button>
        )}
      </div>

      {/* BUSCADOR — CENTRADO EN ESCRITORIO */}
      <div className="w-full flex justify-center">
        <input
          type="text"
          placeholder="Buscar productos..."
          className="mt-2 w-full md:w-[400px] px-4 py-2 bg-white text-black border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>
    </header>
  );
};

export default Cabecera;

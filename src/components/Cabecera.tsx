import React from "react";
import { useUsuario } from "../context/UsuarioContext";

const Cabecera: React.FC = () => {
  const { usuario, cerrarSesion } = useUsuario();

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

        {usuario ? (
          <div className="flex items-center gap-4">
            <img
              src={
                usuario.fotoUrl && usuario.fotoUrl.trim() !== ""
                  ? usuario.fotoUrl
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Perfil"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-semibold">
              {usuario.nombreUsuario}
            </span>
            <button
              onClick={cerrarSesion}
              className="text-sm bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-full"
            >
              Cerrar sesión
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
    </header>
  );
};

export default Cabecera;

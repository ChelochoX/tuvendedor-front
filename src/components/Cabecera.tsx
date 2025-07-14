import React, { useState, useEffect } from "react";
import LoginModal from "./auth/LoginModal";
import RegisterModal from "./auth/RegisterModal";

const Cabecera: React.FC = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

  // Ocultar el botón de "Crear publicación" y bloquear scroll si hay algún modal abierto
  useEffect(() => {
    const body = document.body;
    const crearBtn = document.getElementById("crear-publicacion-btn");

    if (openLogin || openRegister) {
      body.style.overflow = "hidden";
      if (crearBtn) crearBtn.style.display = "none";
    } else {
      body.style.overflow = "auto";
      if (crearBtn) crearBtn.style.display = "block";
    }
  }, [openLogin, openRegister]);

  return (
    <>
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

          <button
            onClick={() => setOpenLogin(true)}
            className="text-sm bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-full"
          >
            Iniciar sesión
          </button>
        </div>
      </header>

      <LoginModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        onSwitchToRegister={() => {
          setOpenLogin(false);
          setOpenRegister(true);
        }}
      />

      <RegisterModal
        open={openRegister}
        onClose={() => setOpenRegister(false)}
      />
    </>
  );
};

export default Cabecera;

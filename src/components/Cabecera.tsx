import React, { useState, useEffect } from "react";
import LoginModal from "./auth/LoginModal";
import RegisterModal from "./auth/RegisterModal";

const Cabecera: React.FC = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [datosPrevios, setDatosPrevios] = useState(null);
  const [usuario, setUsuario] = useState<string | null>(null);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  useEffect(() => {
    const usuarioLS = localStorage.getItem("usuario");
    const fotoPerfilLS = localStorage.getItem("fotoPerfil");
    console.log("Usuario:", usuarioLS);
    console.log("Foto:", fotoPerfilLS);
    setUsuario(usuarioLS);
    setFotoPerfil(fotoPerfilLS);
  }, [openLogin]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("fotoPerfil");
    localStorage.removeItem("permisos");
    setUsuario(null);
    setFotoPerfil(null);
  };

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

          {!usuario ? (
            <button
              onClick={() => setOpenLogin(true)}
              className="text-sm bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-full"
            >
              Iniciar sesión
            </button>
          ) : (
            <div className="flex items-center gap-4">
              {fotoPerfil && (
                <img
                  src={fotoPerfil}
                  alt="Perfil"
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span className="text-sm font-semibold">{usuario}</span>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-full"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      <LoginModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        onSwitchToRegister={(datos?: any) => {
          setDatosPrevios(datos || null);
          setOpenLogin(false);
          setOpenRegister(true);
        }}
      />

      <RegisterModal
        open={openRegister}
        onClose={() => setOpenRegister(false)}
        datosPrevios={datosPrevios}
      />
    </>
  );
};

export default Cabecera;

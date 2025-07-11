import React from "react";

interface Props {
  onToggleSidebar: () => void;
  mostrarBotonMenu?: boolean;
}

const Cabecera: React.FC<Props> = ({ onToggleSidebar, mostrarBotonMenu }) => {
  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50 px-4 py-3">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo + menú */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
          {mostrarBotonMenu && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden text-2xl text-gray-700"
            >
              ☰
            </button>
          )}
          <h1 className="text-xl font-bold">TuVendedor</h1>
        </div>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar productos..."
          className="w-full md:w-[400px] px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Login */}
        <button className="text-sm text-blue-500 hover:underline">
          Iniciar sesión
        </button>
      </div>
    </header>
  );
};

export default Cabecera;

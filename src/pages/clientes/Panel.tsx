import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Panel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-between h-full relative">
      {/* Sección superior */}
      <div className="flex flex-col gap-2 overflow-y-auto pb-20 md:pb-0">
        <h2 className="text-yellow-400 font-bold text-lg px-4 mb-3">
          Clientes
        </h2>

        {/* Dashboard general */}
        <button
          onClick={() => navigate("/clientes/dashboard")}
          className="flex items-center gap-2 px-4 py-2 rounded text-white hover:bg-yellow-500 hover:text-black transition-all"
        >
          <DashboardIcon fontSize="small" />
          Panel general
        </button>

        {/* Registrar nuevo cliente */}
        <button
          onClick={() => navigate("/clientes/cargar")}
          className="flex items-center gap-2 px-4 py-2 rounded text-white hover:bg-yellow-500 hover:text-black transition-all"
        >
          <PersonAddIcon fontSize="small" />
          Registrar cliente
        </button>
      </div>

      {/* Botón volver al marketplace */}
      <div
        className="
          hidden md:block
          mt-4
        "
      >
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold 
                     text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black 
                     transition-all duration-300"
        >
          <ArrowBackIcon fontSize="small" />
          Volver al Marketplace
        </button>
      </div>

      {/* Versión móvil fija del botón */}
      <div
        className="
          md:hidden
          fixed bottom-4 left-4 right-4
          flex justify-center
          z-30
        "
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-2 w-full bg-yellow-500 text-black font-semibold py-2 rounded-full shadow-md hover:bg-yellow-400 transition-all duration-200"
        >
          <ArrowBackIcon fontSize="small" />
          Volver al Marketplace
        </button>
      </div>
    </div>
  );
};

export default Panel;

import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupIcon from "@mui/icons-material/Group";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Panel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Sección superior */}
      <div className="flex flex-col gap-2">
        <h2 className="text-white font-bold text-lg px-4 mb-3">Clientes</h2>

        {/* Dashboard general */}
        <button
          onClick={() => navigate("/clientes")}
          className="flex items-center gap-2 px-4 py-2 rounded text-white hover:bg-yellow-500 hover:text-black transition-all"
        >
          <DashboardIcon fontSize="small" />
          Panel general
        </button>

        {/* Registrar nuevo cliente / seguimiento */}
        <button
          onClick={() => navigate("/clientes/cargar")}
          className="flex items-center gap-2 px-4 py-2 rounded text-white hover:bg-yellow-500 hover:text-black transition-all"
        >
          <PersonAddIcon fontSize="small" />
          Registrar cliente
        </button>
      </div>

      {/* Botón volver al marketplace */}
      <div className="mt-4">
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
    </div>
  );
};

export default Panel;

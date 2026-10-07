// src/pages/clientes/Panel.tsx

import React from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import GroupsIcon from "@mui/icons-material/Groups";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StoreIcon from "@mui/icons-material/Store";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CategoryIcon from "@mui/icons-material/Category";
import PercentIcon from "@mui/icons-material/Percent";

const Panel: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const itemClass = (ruta: string) =>
    `flex items-center gap-2 px-4 py-2 rounded transition-all ${
      location.pathname === ruta
        ? "bg-yellow-400 text-black font-semibold"
        : "text-white hover:bg-yellow-500 hover:text-black"
    }`;

  return (
    <div className="flex flex-col justify-between h-full relative">
      <div className="flex flex-col gap-2 overflow-y-auto pb-20 md:pb-0">
        <h2 className="text-yellow-400 font-bold text-lg px-4 mb-3">
          Gestión de clientes
        </h2>

        <button
          onClick={() =>
            navigate("/clientes/dashboard")
          }
          className={itemClass(
            "/clientes/dashboard",
          )}
        >
          <AssignmentTurnedInIcon fontSize="small" />
          Solicitudes de venta
        </button>

        <button
          onClick={() =>
            navigate("/clientes/cargar")
          }
          className={itemClass(
            "/clientes/cargar",
          )}
        >
          <GroupsIcon fontSize="small" />
          Interesados / seguimiento
        </button>

        <h2 className="text-yellow-400 font-bold text-lg px-4 mt-6 mb-3">
          Gestión Producto
        </h2>

        <button
          onClick={() =>
            navigate("/clientes/marcas")
          }
          className={itemClass(
            "/clientes/marcas",
          )}
        >
          <StoreIcon fontSize="small" />
          Marcas
        </button>

        <button
          onClick={() =>
            navigate("/clientes/modelos")
          }
          className={itemClass(
            "/clientes/modelos",
          )}
        >
          <CategoryIcon fontSize="small" />
          Modelos
        </button>

        <button
          onClick={() =>
            navigate("/clientes/precios")
          }
          className={itemClass(
            "/clientes/precios",
          )}
        >
          <LocalOfferIcon fontSize="small" />
          Precios
        </button>

        <button
          onClick={() =>
            navigate(
              "/clientes/descuentos-contado",
            )
          }
          className={itemClass(
            "/clientes/descuentos-contado",
          )}
        >
          <PercentIcon fontSize="small" />
          Descuentos contado
        </button>
      </div>

      <div className="hidden md:block mt-4">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-300"
        >
          <ArrowBackIcon fontSize="small" />
          Volver al Marketplace
        </button>
      </div>

      <div className="md:hidden fixed bottom-4 left-4 right-4 flex justify-center z-30">
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

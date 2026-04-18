import React, { useState } from "react";
import Panel from "./Panel";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PublicIcon from "@mui/icons-material/Public";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PeopleIcon from "@mui/icons-material/People";
import TimelineIcon from "@mui/icons-material/Timeline";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-900 text-white relative">
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-gray-900 border-r border-yellow-400 p-4
        transform ${menuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 transition-transform duration-300 z-20`}
      >
        <div className="flex items-center justify-between md:hidden mb-4">
          <h2 className="text-yellow-400 font-bold text-lg">Menú</h2>
          <button
            onClick={() => setMenuOpen(false)}
            className="bg-yellow-400 text-black rounded p-1"
          >
            <CloseIcon />
          </button>
        </div>

        <Panel />
      </aside>

      {!menuOpen && (
        <button
          className="absolute top-4 left-4 md:hidden z-30 bg-yellow-400 text-black rounded p-1 shadow-md"
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon />
        </button>
      )}

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 md:hidden z-10"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="flex-1 p-6 overflow-auto w-full md:ml-0 mt-14 md:mt-0">
        <h1 className="text-2xl font-bold mb-4 text-yellow-400">
          Panel del vendedor
        </h1>

        <p className="text-gray-300 mb-8 max-w-3xl">
          Desde aquí podés gestionar tus clientes, revisar tus publicaciones y
          configurar tu vitrina pública para que los visitantes conozcan tu
          perfil comercial y tus productos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/clientes/perfil-vendedor")}
            className="bg-gray-800 p-5 rounded-xl shadow-md border border-yellow-400 text-left hover:bg-yellow-400 hover:text-black transition-all group"
          >
            <PublicIcon className="text-yellow-400 group-hover:text-black" />
            <h2 className="text-lg font-bold mt-3">Mi vitrina pública</h2>
            <p className="text-sm mt-2 opacity-80">
              Editá portada, biografía, WhatsApp, redes y datos comerciales.
            </p>
          </button>

          <button
            onClick={() => navigate("/")}
            className="bg-gray-800 p-5 rounded-xl shadow-md border border-yellow-400 text-left hover:bg-yellow-400 hover:text-black transition-all group"
          >
            <StorefrontIcon className="text-yellow-400 group-hover:text-black" />
            <h2 className="text-lg font-bold mt-3">Marketplace</h2>
            <p className="text-sm mt-2 opacity-80">
              Volvé al marketplace y revisá cómo se muestran los productos.
            </p>
          </button>

          <button
            onClick={() => navigate("/clientes/cargar")}
            className="bg-gray-800 p-5 rounded-xl shadow-md border border-yellow-400 text-left hover:bg-yellow-400 hover:text-black transition-all group"
          >
            <PeopleIcon className="text-yellow-400 group-hover:text-black" />
            <h2 className="text-lg font-bold mt-3">Registrar cliente</h2>
            <p className="text-sm mt-2 opacity-80">
              Cargá nuevos interesados y gestioná tus contactos comerciales.
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-yellow-400">
            <h2 className="text-yellow-400 text-lg font-semibold">
              Clientes activos
            </h2>
            <p className="text-3xl font-bold mt-2">128</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-yellow-400">
            <h2 className="text-yellow-400 text-lg font-semibold">
              Seguimientos del mes
            </h2>
            <p className="text-3xl font-bold mt-2">47</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-yellow-400">
            <h2 className="text-yellow-400 text-lg font-semibold">
              Nuevos interesados
            </h2>
            <p className="text-3xl font-bold mt-2">22</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-yellow-400 flex flex-col items-center">
            <h3 className="text-yellow-400 font-semibold mb-4 flex items-center gap-2">
              <TimelineIcon fontSize="small" />
              Distribución de clientes
            </h3>
            <img
              src="https://quickchart.io/chart?c=%7Btype:'pie',data:%7Blabels:['Activos','Inactivos','Nuevos'],datasets:%5B%7Bdata:%5B65,20,15%5D,backgroundColor:%5B'%23FACC15','%23FB923C','%2338BDF8'%5D%7D%5D%7D%7D"
              alt="Gráfico de torta"
              className="w-64 h-64"
            />
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-yellow-400 flex flex-col items-center">
            <h3 className="text-yellow-400 font-semibold mb-4 flex items-center gap-2">
              <TimelineIcon fontSize="small" />
              Seguimientos por semana
            </h3>
            <img
              src="https://quickchart.io/chart?c=%7Btype:'bar',data:%7Blabels:['Semana%201','Semana%202','Semana%203','Semana%204'],datasets:%5B%7Blabel:'Seguimientos',data:%5B12,18,9,15%5D,backgroundColor:'%23FACC15'%7D%5D%7D%7D"
              alt="Gráfico de barras"
              className="w-72 h-64"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

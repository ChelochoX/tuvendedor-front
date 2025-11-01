import React, { useState } from "react";
import Panel from "./Panel";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const Dashboard: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900 text-white relative">
      {/* Panel lateral */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-gray-900 border-r border-yellow-400 p-4
        transform ${menuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 transition-transform duration-300 z-20`}
      >
        {/* Encabezado del menú móvil con botón cerrar */}
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

      {/* Botón menú (solo móvil) */}
      {!menuOpen && (
        <button
          className="absolute top-4 left-4 md:hidden z-30 bg-yellow-400 text-black rounded p-1 shadow-md"
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon />
        </button>
      )}

      {/* Capa semitransparente detrás del menú en móvil */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 md:hidden z-10"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <main className="flex-1 p-6 overflow-auto w-full md:ml-0 mt-14 md:mt-0">
        <h1 className="text-2xl font-bold mb-4 text-yellow-400">
          Gestión de Clientes
        </h1>

        <p className="text-gray-300 mb-8">
          Desde aquí podrás registrar nuevos interesados, agregar seguimientos y
          consultar el historial de tus clientes.
        </p>

        {/* Tarjetas estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Mockup de gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-yellow-400 flex flex-col items-center">
            <h3 className="text-yellow-400 font-semibold mb-4">
              Distribución de clientes
            </h3>
            <img
              src="https://quickchart.io/chart?c=%7Btype:'pie',data:%7Blabels:['Activos','Inactivos','Nuevos'],datasets:%5B%7Bdata:%5B65,20,15%5D,backgroundColor:%5B'%23FACC15','%23FB923C','%2338BDF8'%5D%7D%5D%7D%7D"
              alt="Gráfico de torta"
              className="w-64 h-64"
            />
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-yellow-400 flex flex-col items-center">
            <h3 className="text-yellow-400 font-semibold mb-4">
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

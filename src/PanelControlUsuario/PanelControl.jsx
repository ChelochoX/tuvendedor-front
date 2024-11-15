import React, { useState } from "react";
import { FaTachometerAlt, FaFolderOpen, FaFileAlt } from "react-icons/fa"; // Icono de Solicitudes de Crédito
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import SolicitudesCredito from "./SolicitudesCredito";
import Dashboard from "./Dashboard";

function PanelControl() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("solicitudesCredito");

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "data":
        return <h1 className="text-3xl font-bold">Gestión de Datos</h1>;
      case "solicitudesCredito":
        return <SolicitudesCredito />;
      default:
        return (
          <h1 className="text-3xl font-bold">Bienvenido al Panel de Control</h1>
        );
    }
  };

  return (
    <div className="flex h-screen bg-secondary text-primary">
      {/* Sidebar */}
      <div
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } h-full bg-secondary flex flex-col items-center p-4 transition-all duration-300`}
      >
        {isCollapsed ? (
          <img src="/logoTuVendedor.png" alt="Logo" className="w-12 mb-4" />
        ) : (
          <img src="/logoTuVendedor.png" alt="Logo" className="w-24 mb-6" />
        )}

        <div className="flex flex-col items-center text-primary">
          {!isCollapsed && (
            <>
              <div className="mb-4">
                <img
                  src="/avatar.png"
                  alt="User Profile"
                  className="rounded-full w-16 h-16"
                />
              </div>
              <h2 className="text-lg font-bold">Tu Vendedor</h2>
              <span className="text-sm text-gray-400">Rol del Usuario</span>
            </>
          )}
        </div>

        <nav className="mt-8 w-full flex-1">
          <ul className="space-y-4 w-full">
            <li className="group">
              <button
                onClick={() => setActiveView("dashboard")}
                className="flex items-center px-4 py-2 w-full text-primary group-hover:bg-yellow-50 group-hover:bg-opacity-25 rounded transition-all duration-200"
              >
                <FaTachometerAlt
                  className={`${
                    isCollapsed ? "text-xl mx-auto" : "mr-2 text-lg"
                  }`}
                />
                {!isCollapsed && "Dashboard"}
              </button>
            </li>
            <li className="group">
              <button
                onClick={() => setActiveView("data")}
                className="flex items-center px-4 py-2 w-full text-primary group-hover:bg-yellow-50 group-hover:bg-opacity-25 rounded transition-all duration-200"
              >
                <FaFolderOpen
                  className={`${
                    isCollapsed ? "text-xl mx-auto" : "mr-2 text-lg"
                  }`}
                />
                {!isCollapsed && "Gestión de Datos"}
              </button>
            </li>
            <li className="group">
              <button
                onClick={() => setActiveView("solicitudesCredito")}
                className="flex items-center px-4 py-2 w-full text-primary group-hover:bg-yellow-50 group-hover:bg-opacity-25 rounded transition-all duration-200"
              >
                <FaFileAlt
                  className={`${
                    isCollapsed ? "text-xl mx-auto" : "mr-2 text-lg"
                  }`}
                />
                {!isCollapsed && "Solicitudes de Crédito"}
              </button>
            </li>
          </ul>
        </nav>

        {/* Icono para colapsar/expandir */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-auto mb-4 text-yellow-400"
        >
          {isCollapsed ? (
            <FiChevronRight size={20} />
          ) : (
            <FiChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Contenido principal */}
      <div
        className="flex-grow p-8 text-secondary" // Añade flex-grow para que ocupe el espacio restante
        style={{ backgroundColor: "#FFFBEA" }}
      >
        {renderContent()}
      </div>
    </div>
  );
}

export default PanelControl;

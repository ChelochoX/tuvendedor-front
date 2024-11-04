import React, { useState } from "react";
import { FaTachometerAlt, FaFolderOpen, FaFilePdf } from "react-icons/fa"; // Importar iconos de react-icons
import GenerarPDF from "../PanelControlUsuario/GenerarPDF"; // Importa el componente

function PanelControl() {
  // Estado para controlar la vista activa en el panel derecho
  const [activeView, setActiveView] = useState("dashboard");

  // Función para renderizar el contenido en función de la vista activa
  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <h1 className="text-3xl font-bold">Bienvenido al Panel de Control</h1>
        );
      case "data":
        return <h1 className="text-3xl font-bold">Gestión de Datos</h1>;
      case "pdf":
        return <GenerarPDF />; // Muestra el componente GenerarPDF
      default:
        return (
          <h1 className="text-3xl font-bold">Bienvenido al Panel de Control</h1>
        );
    }
  };

  return (
    <div className="flex h-screen bg-secondary text-primary">
      {/* Sidebar */}
      <div className="w-1/4 h-full bg-secondary flex flex-col items-center p-4">
        <img
          src="/path-to-your-logo.png"
          alt="Tu Vendedor Logo"
          className="w-24 mb-6"
        />
        <div className="flex flex-col items-center text-primary">
          <div className="mb-4">
            <img
              src="/path-to-user-profile.png"
              alt="User Profile"
              className="rounded-full w-16 h-16"
            />
          </div>
          <h2 className="text-lg font-bold">Nombre Usuario</h2>
          <span className="text-sm text-gray-400">Rol del Usuario</span>
        </div>
        <nav className="mt-8 w-full">
          <ul className="space-y-4 w-full">
            <li className="group">
              <button
                onClick={() => setActiveView("dashboard")}
                className="flex items-center px-4 py-2 w-full text-primary group-hover:bg-yellow-50 group-hover:bg-opacity-25 rounded" // Ajuste de hover muy claro
              >
                <FaTachometerAlt className="mr-2" /> {/* Icono de Dashboard */}
                Dashboard
              </button>
            </li>
            <li className="group">
              <button
                onClick={() => setActiveView("data")}
                className="flex items-center px-4 py-2 w-full text-primary group-hover:bg-yellow-50 group-hover:bg-opacity-25 rounded" // Ajuste de hover muy claro
              >
                <FaFolderOpen className="mr-2" />{" "}
                {/* Icono de Gestión de Datos */}
                Gestión de Datos
              </button>
            </li>
            <li className="group">
              <button
                onClick={() => setActiveView("pdf")}
                className="flex items-center px-4 py-2 w-full text-primary group-hover:bg-yellow-50 group-hover:bg-opacity-25 rounded" // Ajuste de hover muy claro
              >
                <FaFilePdf className="mr-2" /> {/* Icono de Generar PDF */}
                Generar PDF
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Contenido principal, se mantiene en el panel derecho */}
      <div
        className="w-3/4 p-8 text-secondary"
        style={{ backgroundColor: "#FFFBEA" }}
      >
        {renderContent()}{" "}
        {/* Llama a la función que renderiza el contenido según la vista activa */}
      </div>
    </div>
  );
}

export default PanelControl;

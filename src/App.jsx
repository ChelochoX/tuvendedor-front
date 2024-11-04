import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./components/Header";
import HeaderPage from "./components/HeaderPage";
import RoutesHandler from "./components/RoutesHandler";
import Footer from "./components/Footer"; // Importa el Footer
import PanelControl from "./PanelControlUsuario/PanelControl"; // Importa tu componente PanelControl

function App() {
  const location = useLocation();

  // Define las rutas específicas que no deben mostrar Header, Footer, etc.
  const isUserPanel = location.pathname.startsWith("/panelControl");
  const isHome = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Si es la ruta del panel de control, renderiza solo el PanelControl */}
      {isUserPanel ? (
        <PanelControl />
      ) : (
        <>
          {/* Renderiza el Header correspondiente en las otras páginas */}
          {isHome ? <Header /> : <HeaderPage category={location.pathname} />}

          {/* Renderiza las rutas principales */}
          <div className="flex-grow">
            <RoutesHandler />
          </div>

          {/* Renderiza el Footer en todas las páginas, excepto en el panel de control */}
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;

import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./components/Header";
import HeaderPage from "./components/HeaderPage";
import RoutesHandler from "./components/RoutesHandler";
import Footer from "./components/Footer"; // Importa el Footer

function App() {
  const location = useLocation();

  // Muestra el Header principal solo en la página Home ("/")
  const isHome = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Renderiza el Header correspondiente */}
      {isHome ? <Header /> : <HeaderPage category={location.pathname} />}

      {/* Renderiza las rutas principales */}
      <div className="flex-grow">
        <RoutesHandler />
      </div>

      {/* Renderiza el Footer en todas las páginas */}
      <Footer />
    </div>
  );
}

export default App;

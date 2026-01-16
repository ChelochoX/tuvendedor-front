import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import RoutesHandler from "./router/RoutesHandler";

// 👇 Tipamos fbq para que TypeScript no se queje
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

function App() {
  const location = useLocation();

  // 🔥 AVISAMOS A META CADA CAMBIO DE RUTA
  useEffect(() => {
    if (window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <RoutesHandler />
    </div>
  );
}

export default App;

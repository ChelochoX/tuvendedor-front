import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import RoutesHandler from "./router";
import { registrarMetaPageViewPorRuta } from "./utils/metaPixel";

function App() {
  const location = useLocation();

  // Registramos PageView en el Pixel correcto según la ruta pública visitada.
  useEffect(() => {
    registrarMetaPageViewPorRuta(location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <RoutesHandler />
    </div>
  );
}

export default App;
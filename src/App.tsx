import React from "react";
import { useLocation } from "react-router-dom";
import RoutesHandler from "./router"; // Ruta relativa correcta al index.tsx

function App() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <RoutesHandler />
    </div>
  );
}

export default App;

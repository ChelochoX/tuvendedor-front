import { Routes, Route } from "react-router-dom";
import Marketplace from "../pages/Marketplace"; // u otras páginas que vayas agregando

const RoutesHandler = () => (
  <Routes>
    <Route path="/" element={<Marketplace />} />
    {/* Agregá más rutas acá cuando necesites */}
  </Routes>
);

export default RoutesHandler;

// src/router/index.tsx
import { Routes, Route } from "react-router-dom";
import Marketplace from "../pages/Marketplace";
import ProductDetailWrapper from "../pages/ProductDetailWrapper";
//import ClientesList from "../pages/Clientes/ClientesList";

const RoutesHandler = () => (
  <Routes>
    <Route path="/" element={<Marketplace />} />
    <Route path="/producto/:id" element={<ProductDetailWrapper />} />
    {/* <Route path="/clientes" element={<ClientesList />} /> */}
  </Routes>
);

export default RoutesHandler;

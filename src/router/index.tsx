// src/router/index.tsx
import { Routes, Route } from "react-router-dom";
import Marketplace from "../pages/Marketplace";
import ProductDetailWrapper from "../pages/ProductDetailWrapper";

// Clientes
import Dashboard from "../pages/clientes/Dashboard";
import CargaClientes from "../pages/clientes/CargaClientes";
import ListadoClientes from "../pages/clientes/ListadoClientes";

const RoutesHandler = () => (
  <Routes>
    {/* 🏠 Marketplace principal */}
    <Route path="/" element={<Marketplace />} />
    <Route path="/producto/:id" element={<ProductDetailWrapper />} />

    {/* 👥 Módulo de Clientes */}
    <Route path="/clientes" element={<Dashboard />} />
    <Route path="/clientes/cargar" element={<CargaClientes />} />
    <Route path="/clientes/listar" element={<ListadoClientes />} />
  </Routes>
);

export default RoutesHandler;

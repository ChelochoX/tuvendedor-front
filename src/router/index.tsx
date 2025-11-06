// src/router/index.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Marketplace from "../pages/Marketplace";
import ProductDetailWrapper from "../pages/ProductDetailWrapper";

// Clientes
import Dashboard from "../pages/clientes/Dashboard";
import CargaClientes from "../pages/clientes/CargaClientes";

const RoutesHandler = () => (
  <Routes>
    {/* 🏠 Marketplace principal */}
    <Route path="/" element={<Marketplace />} />
    <Route path="/producto/:id" element={<ProductDetailWrapper />} />

    {/* 👥 Módulo de Clientes */}
    <Route
      path="/clientes"
      element={<Navigate to="/clientes/dashboard" replace />}
    />
    <Route path="/clientes/dashboard" element={<Dashboard />} />
    <Route path="/clientes/cargar" element={<CargaClientes />} />
  </Routes>
);

export default RoutesHandler;

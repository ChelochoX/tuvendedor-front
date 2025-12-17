import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// 🟡 Lazy imports (CLAVE)
const Marketplace = lazy(() => import("../pages/Marketplace"));
const ProductDetailWrapper = lazy(
  () => import("../pages/ProductDetailWrapper")
);
const BridgeProduct = lazy(() => import("../pages/BridgeProduct"));

// Clientes
const Dashboard = lazy(() => import("../pages/clientes/Dashboard"));
const CargaClientes = lazy(() => import("../pages/clientes/CargaClientes"));

// Fallback ultra liviano
const PageLoader = () => <div className="min-h-screen bg-black" />;

const RoutesHandler = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* 🏠 Marketplace */}
      <Route path="/" element={<Marketplace />} />

      {/* 📦 Producto */}
      <Route path="/producto/:id" element={<ProductDetailWrapper />} />

      {/* 🌉 Bridge (la más importante para Meta) */}
      <Route path="/bridge/:id" element={<BridgeProduct />} />

      {/* 👥 Módulo Clientes */}
      <Route
        path="/clientes"
        element={<Navigate to="/clientes/dashboard" replace />}
      />
      <Route path="/clientes/dashboard" element={<Dashboard />} />
      <Route path="/clientes/cargar" element={<CargaClientes />} />
    </Routes>
  </Suspense>
);

export default RoutesHandler;

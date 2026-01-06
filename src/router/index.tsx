import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy imports usando baseUrl (CORRECTO)
const Marketplace = lazy(() => import("pages/Marketplace"));
const ProductDetailWrapper = lazy(() => import("pages/ProductDetailWrapper"));
const BridgeProduct = lazy(() => import("pages/BridgeProduct"));

// Clientes
const Dashboard = lazy(() => import("pages/clientes/Dashboard"));
const CargaClientes = lazy(() => import("pages/clientes/CargaClientes"));
const GestionMarcas = lazy(() => import("pages/clientes/GestionMarcas"));
const GestionPrecios = lazy(() => import("../pages/clientes/GestionPrecios"));
const GestionModelos = lazy(() => import("pages/clientes/GestionModelos"));

const PageLoader = () => <div className="min-h-screen bg-black" />;

const RoutesHandler = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Marketplace />} />
      <Route path="/producto/:id" element={<ProductDetailWrapper />} />
      <Route path="/bridge/:id" element={<BridgeProduct />} />

      <Route
        path="/clientes"
        element={<Navigate to="/clientes/dashboard" replace />}
      />
      <Route path="/clientes/dashboard" element={<Dashboard />} />
      <Route path="/clientes/cargar" element={<CargaClientes />} />
      <Route path="/clientes/marcas" element={<GestionMarcas />} />
      <Route path="/clientes/modelos" element={<GestionModelos />} />
      <Route path="/clientes/precios" element={<GestionPrecios />} />
    </Routes>
  </Suspense>
);

export default RoutesHandler;

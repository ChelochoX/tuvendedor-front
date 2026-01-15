import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

const Marketplace = lazy(() => import("@pages/Marketplace"));
const ProductDetailWrapper = lazy(() => import("@pages/ProductDetailWrapper"));
const BridgeProduct = lazy(() => import("@pages/BridgeProduct"));

// Dashboard global
const Dashboard = lazy(() => import("@pages/dashboard/Dashboard"));

// Clientes
const PanelClientes = lazy(() => import("@pages/clientes/Panel"));
const ListarClientes = lazy(() => import("@pages/clientes/ListarClientes"));
const CargaClientes = lazy(() => import("@pages/clientes/CargaClientes"));
const ListarInteresados = lazy(
  () => import("@pages/clientes/ListarInteresadosRoute")
);

// Productos
const GestionMarcas = lazy(() => import("@pages/productos/GestionMarcas"));
const GestionModelos = lazy(() => import("@pages/productos/GestionModelos"));
const GestionPrecios = lazy(() => import("@pages/productos/GestionPrecios"));

const PageLoader = () => <div className="min-h-screen bg-black" />;

export default function RoutesHandler() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Público */}
        <Route path="/" element={<Marketplace />} />
        <Route path="/producto/:id" element={<ProductDetailWrapper />} />
        <Route path="/bridge/:id" element={<BridgeProduct />} />

        {/* Dashboard global */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Clientes */}
        <Route path="/clientes" element={<PanelClientes />}>
          <Route index element={<Navigate to="listar" replace />} />
          <Route path="listar" element={<ListarClientes />} />
          <Route path="cargar" element={<CargaClientes />} />
          <Route path="interesados" element={<ListarInteresados />} />
        </Route>

        {/* Productos */}
        <Route path="/productos">
          <Route path="marcas" element={<GestionMarcas />} />
          <Route path="modelos" element={<GestionModelos />} />
          <Route path="precios" element={<GestionPrecios />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

/* ===============================
   PÚBLICO (MARKETPLACE)
================================ */
const Marketplace = lazy(() => import("@pages/Marketplace"));
const ProductDetailWrapper = lazy(() => import("@pages/ProductDetailWrapper"));
const BridgeProduct = lazy(() => import("@pages/BridgeProduct"));

/* ===============================
   PANEL / ADMINISTRACIÓN
================================ */
const Dashboard = lazy(() => import("@pages/dashboard/Dashboard"));

// Clientes
const ListarClientes = lazy(() => import("@pages/clientes/ListarClientes"));
const CargaClientes = lazy(() => import("@pages/clientes/CargaClientes"));
const ListarInteresados = lazy(
  () => import("@pages/clientes/ListarInteresadosRoute")
);

// Productos
const GestionMarcas = lazy(() => import("@pages/productos/GestionMarcas"));
const GestionModelos = lazy(() => import("@pages/productos/GestionModelos"));
const GestionPrecios = lazy(() => import("@pages/productos/GestionPrecios"));

// Layout del panel
const LayoutBackofficeLazy = lazy(
  () => import("@pages/backoffice/LayoutBackoffice")
);

const PageLoader = () => <div className="min-h-screen bg-black" />;

export default function RoutesHandler() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ===============================
            SITIO PÚBLICO
        ================================ */}
        <Route path="/" element={<Marketplace />} />
        <Route path="/producto/:id" element={<ProductDetailWrapper />} />
        <Route path="/bridge/:id" element={<BridgeProduct />} />

        {/* ===============================
            PANEL DE ADMINISTRACIÓN
            TODO cuelga de /panel
        ================================ */}
        <Route path="/panel" element={<LayoutBackofficeLazy />}>
          {/* 👉 Dashboard por defecto */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Clientes */}
          <Route path="clientes">
            <Route index element={<Navigate to="listar" replace />} />
            <Route path="listar" element={<ListarClientes />} />
            <Route path="cargar" element={<CargaClientes />} />
            <Route path="interesados" element={<ListarInteresados />} />
          </Route>

          {/* Productos */}
          <Route path="productos">
            <Route path="marcas" element={<GestionMarcas />} />
            <Route path="modelos" element={<GestionModelos />} />
            <Route path="precios" element={<GestionPrecios />} />
          </Route>
        </Route>

        {/* ===============================
            CATCH ALL
        ================================ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

import { Navigate, Route, Routes } from "react-router-dom";

import { lazy, Suspense } from "react";

// Marketplace
const Marketplace = lazy(() => import("pages/Marketplace"));

const ProductDetailWrapper = lazy(() => import("pages/ProductDetailWrapper"));

const BridgeProduct = lazy(() => import("pages/BridgeProduct"));

// Perfil vendedor
const PerfilVendedorPublico = lazy(
  () => import("pages/perfilVendedor/PerfilVendedorPublico"),
);

const MiPerfilVendedor = lazy(
  () => import("pages/perfilVendedor/MiPerfilVendedor"),
);

// Administración
const ServiciosPremiumAdmin = lazy(
  () => import("pages/admin/ServiciosPremiumAdmin"),
);

const BannersPublicitariosAdmin = lazy(
  () => import("pages/admin/BannersPublicitariosAdmin"),
);

const DashboardComercial = lazy(() => import("pages/admin/DashboardComercial"));

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
      {/* Marketplace público */}
      <Route path="/" element={<Marketplace />} />

      <Route path="/producto/:id" element={<ProductDetailWrapper />} />

      <Route path="/bridge/:id" element={<BridgeProduct />} />

      {/* Perfil público del vendedor */}
      <Route path="/vendedor/:slug" element={<PerfilVendedorPublico />} />

      {/* Panel privado */}
      <Route
        path="/clientes"
        element={<Navigate to="/clientes/dashboard" replace />}
      />

      <Route path="/clientes/dashboard" element={<Dashboard />} />

      <Route path="/clientes/cargar" element={<CargaClientes />} />

      <Route path="/clientes/marcas" element={<GestionMarcas />} />

      <Route path="/clientes/modelos" element={<GestionModelos />} />

      <Route path="/clientes/precios" element={<GestionPrecios />} />

      <Route path="/clientes/perfil-vendedor" element={<MiPerfilVendedor />} />

      {/* Administración */}
      <Route
        path="/admin/servicios-premium"
        element={<ServiciosPremiumAdmin />}
      />

      <Route
        path="/admin/banners-publicitarios"
        element={<BannersPublicitariosAdmin />}
      />

      <Route
        path="/admin/dashboard-comercial"
        element={<DashboardComercial />}
      />
    </Routes>
  </Suspense>
);

export default RoutesHandler;

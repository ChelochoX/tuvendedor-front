import React, { useState } from "react";
import CategoriasPanel from "../components/CategoriasPanel";
import ProductoCard from "../components/ProductoCard";
import { productosMock } from "../mocks/productos.mock";
import { Producto } from "../types/producto";
import { Categoria } from "../types/categoria";
import Cabecera from "../components/Cabecera";

const categorias: Categoria[] = [
  { id: "1", nombre: "Vehículos", icono: "🚗" },
  { id: "2", nombre: "Propiedades", icono: "🏠" },
  { id: "3", nombre: "Electrodomésticos", icono: "🔌" },
];

const Marketplace: React.FC = () => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const productosFiltrados: Producto[] = categoriaSeleccionada
    ? productosMock.filter((p) => p.categoria === categoriaSeleccionada.nombre)
    : productosMock;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Cabecera
        onToggleSidebar={() => setSidebarAbierto(!sidebarAbierto)}
        mostrarBotonMenu
      />

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-gray-200 p-4 w-64 
        fixed top-[80px] left-0 h-[calc(100vh-80px)] z-50 
        ${sidebarAbierto ? "block" : "hidden"} 
        md:relative md:top-0 md:left-0 md:h-auto md:block`}
        >
          <CategoriasPanel
            categorias={categorias}
            onSelect={(cat) => {
              setCategoriaSeleccionada(cat);
              setSidebarAbierto(false); // cerrar en modo móvil
            }}
          />
        </aside>

        {/* Zona de productos */}
        <main className="flex-1 p-4 mt-2 md:mt-4 md:ml-0 ml-0">
          <h2 className="text-2xl font-semibold mb-4">
            {categoriaSeleccionada?.nombre || "Todos los productos"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productosFiltrados.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Marketplace;

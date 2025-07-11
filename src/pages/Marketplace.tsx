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
  { id: "3", nombre: "Electrodomésticos", icono: "💡" },
];

const Marketplace: React.FC = () => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const productosFiltrados: Producto[] = categoriaSeleccionada
    ? productosMock.filter((p) => p.categoria === categoriaSeleccionada.nombre)
    : productosMock;

  return (
    <div className="bg-[#f1f2f6] min-h-screen">
      <Cabecera
        onToggleSidebar={() => setSidebarAbierto(!sidebarAbierto)}
        mostrarBotonMenu
      />

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed top-[64px] md:static bg-[#2f3542] text-white border-r border-gray-500 p-4 w-64 z-50 md:z-0 md:block h-[calc(100vh-64px)] md:h-auto transition-transform duration-300 ease-in-out ${
            sidebarAbierto ? "block" : "hidden"
          }`}
        >
          <CategoriasPanel
            categorias={categorias}
            categoriaSeleccionada={categoriaSeleccionada}
            onSelect={(cat) => {
              setCategoriaSeleccionada(cat);
              setSidebarAbierto(false);
            }}
          />
        </aside>

        {/* Zona de productos */}
        <main className="flex-1 p-4 mt-2 md:mt-4">
          <h2 className="text-2xl font-semibold mb-4 text-[#1a1a1a]">
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

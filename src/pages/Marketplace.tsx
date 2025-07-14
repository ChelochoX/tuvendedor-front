import React, { useState, useEffect } from "react";
import Cabecera from "../components/Cabecera";
import CategoriasPanel from "../components/CategoriasPanel";
import ProductoCard from "../components/ProductoCard";
import CrearPublicacionModal from "../components/publicaciones/CrearPublicacionModal";
import { productosMock } from "../mocks/productos.mock";
import { Producto } from "../types/producto";
import { Categoria } from "../types/categoria";

const categorias: Categoria[] = [
  { id: "1", nombre: "Vehículos", icono: "🚗" },
  { id: "2", nombre: "Propiedades", icono: "🏠" },
  { id: "3", nombre: "Electrodomésticos", icono: "💡" },
];

const Marketplace: React.FC = () => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const productosFiltrados: Producto[] = categoriaSeleccionada
    ? productosMock.filter((p) => p.categoria === categoriaSeleccionada.nombre)
    : productosMock;

  const handleCrearPublicacion = () => {
    setModalOpen(true);
  };

  const handlePublicar = (nuevaPublicacion: any) => {
    console.log("Publicar:", nuevaPublicacion);
    setModalOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "auto";
    const crearBtn = document.getElementById("crear-publicacion-btn");
    if (crearBtn) {
      crearBtn.style.display =
        !modalOpen && window.innerWidth < 768 ? "block" : "none";
    }
  }, [modalOpen]);

  return (
    <div className="bg-[#1e1f23] min-h-screen text-white">
      <Cabecera />

      {/* Categorías scrollable en móvil */}
      <div className="md:hidden overflow-x-auto whitespace-nowrap px-4 py-2 flex gap-2 bg-[#1f2937] border-b border-gray-700">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            className={`px-4 py-1 rounded-full border text-sm transition ${
              categoriaSeleccionada?.id === cat.id
                ? "bg-yellow-400 text-black font-semibold"
                : "bg-[#2d3748] text-white"
            }`}
            onClick={() => setCategoriaSeleccionada(cat)}
          >
            {cat.icono} {cat.nombre}
          </button>
        ))}
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed top-[64px] md:static bg-[#1e1f23] text-white border-r-2 border-yellow-400 p-4 w-64 z-50 md:z-0 md:block h-[calc(100vh-64px)] md:h-auto transition-transform duration-300 ease-in-out ${
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
            onCrearPublicacion={handleCrearPublicacion}
          />
        </aside>

        {/* Zona de productos */}
        <main className="flex-1 p-4 mt-2 md:mt-4">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            {categoriaSeleccionada?.nombre || "Todos los productos"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productosFiltrados.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
        </main>
      </div>

      <CrearPublicacionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        categorias={categorias}
        onPublicar={handlePublicar}
      />

      {/* Botón flotante Crear publicación en móvil con animación pulse */}
      <button
        id="crear-publicacion-btn"
        onClick={handleCrearPublicacion}
        className="fixed bottom-6 right-6 z-50 bg-yellow-400 text-black font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-yellow-300 transition animate-pulse-slow block md:hidden"
      >
        + Crear publicación
      </button>
    </div>
  );
};

export default Marketplace;

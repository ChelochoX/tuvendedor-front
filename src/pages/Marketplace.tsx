import React, { useState, useEffect } from "react";
import Cabecera from "../components/Cabecera";
import CategoriasPanel from "../components/CategoriasPanel";
import ProductoCard from "../components/ProductoCard";
import CrearPublicacionModal from "../components/publicaciones/CrearPublicacionModal";
import { Producto } from "../types/producto";
import { Categoria } from "../types/categoria";
import LoginModal from "../components/auth/LoginModal";
import RegisterModal from "../components/auth/RegisterModal";
import { obtenerPublicaciones } from "../api/publicacionesService";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";

const categorias: Categoria[] = [
  { id: "0", nombre: "Todos", icono: "🌐" },
  { id: "1", nombre: "Vehículos/Motos", icono: "🚗" },
  { id: "2", nombre: "Propiedades", icono: "🏠" },
  { id: "3", nombre: "Electrodomésticos", icono: "💡" },
];

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [datosPrevios, setDatosPrevios] = useState(null);
  const [quierePublicar, setQuierePublicar] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);

  // 🔥 Consumir API cada vez que cambie categoría o búsqueda
  useEffect(() => {
    const fetchProductos = async () => {
      setCargando(true);
      try {
        const categoria =
          categoriaSeleccionada && categoriaSeleccionada.nombre !== "Todos"
            ? categoriaSeleccionada.nombre
            : undefined;

        const data = await obtenerPublicaciones(
          categoria,
          busqueda || undefined
        );
        setProductos(data);
      } catch (error) {
        console.error("Error al obtener publicaciones:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchProductos();
  }, [categoriaSeleccionada, busqueda]);

  const handleCrearPublicacion = () => {
    const token = localStorage.getItem("token");

    if (token) {
      setModalOpen(true); // abre modal de publicación
    } else {
      setQuierePublicar(true); // guarda intención
      setOpenLogin(true); // abre modal login
    }
  };

  const handlePublicar = async (nuevaPublicacion: any) => {
    setModalOpen(false);
    // ✅ Refrescar publicaciones inmediatamente
    const data = await obtenerPublicaciones(
      categoriaSeleccionada?.nombre !== "Todos"
        ? categoriaSeleccionada?.nombre
        : undefined,
      busqueda || undefined
    );
    setProductos(data);
  };

  useEffect(() => {
    const handleAbrirLogin = () => {
      setOpenLogin(true);
    };

    window.addEventListener("abrir-login", handleAbrirLogin);
    return () => {
      window.removeEventListener("abrir-login", handleAbrirLogin);
    };
  }, []);

  useEffect(() => {
    const handleLoginExitoso = () => {
      if (quierePublicar) {
        setModalOpen(true);
        setQuierePublicar(false);
      }
    };

    window.addEventListener("login-exitoso", handleLoginExitoso);
    return () => {
      window.removeEventListener("login-exitoso", handleLoginExitoso);
    };
  }, [quierePublicar]);

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
        {/* 👤 Gestionar Clientes */}
        <button
          onClick={() => navigate("/clientes")}
          className="px-4 py-1 rounded-full border text-sm bg-[#2d3748] text-white hover:bg-yellow-400 hover:text-black transition"
        >
          <PersonIcon fontSize="small" className="mr-1" />
          Gestionar Clientes
        </button>
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

          <div className="max-w-screen-xl mx-auto">
            {cargando ? (
              <div className="flex justify-center items-center py-10 text-yellow-400">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400 border-opacity-70 mr-3"></div>
                Cargando publicaciones...
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
                {productos.map((p) => (
                  <ProductoCard key={p.id} producto={p} />
                ))}
              </div>
            )}
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

      <LoginModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        onSwitchToRegister={(datos?: any) => {
          setDatosPrevios(datos || null);
          setOpenLogin(false);
          setOpenRegister(true);
        }}
      />

      <RegisterModal
        open={openRegister}
        onClose={() => setOpenRegister(false)}
        datosPrevios={datosPrevios}
      />
    </div>
  );
};

export default Marketplace;

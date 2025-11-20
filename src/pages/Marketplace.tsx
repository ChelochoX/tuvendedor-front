import React, { useState, useEffect } from "react";
import Cabecera from "../components/Cabecera";
import CategoriasPanel from "../components/CategoriasPanel";
import ProductoCard from "../components/ProductoCard";
import CrearPublicacionModal from "../components/publicaciones/CrearPublicacionModal";
import { Producto } from "../types/producto";
import { Categoria } from "../types/categoria";
import LoginModal from "../components/auth/LoginModal";
import RegisterModal from "../components/auth/RegisterModal";
import {
  obtenerPublicaciones,
  obtenerMisPublicaciones,
  obtenerCategorias,
  // 👇 NUEVO: import de los especiales globales
  obtenerPublicacionesEspeciales,
} from "../api/publicacionesService";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import { useUsuario } from "../context/UsuarioContext";
import CambiarClaveModal from "../components/auth/CambiarClaveModal";
import { obtenerIconoCategoria } from "../utils/categoriaIconos";
import CarruselEspeciales from "../components/CarruselEspeciales";

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
  const [mostrarSoloMias, setMostrarSoloMias] = useState(false);
  const { esVisitante, puedePublicar, puedeVerClientes } = useUsuario();
  const { usuario } = useUsuario();
  const [openRecuperar, setOpenRecuperar] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // 👇 NUEVO: lista de especiales globales (independiente del filtro actual)
  const [especialesGlobales, setEspecialesGlobales] = useState<Producto[]>([]);

  const productosEspeciales = productos.filter((p) => p.esTemporada);
  const productosNormales = productos.filter((p) => !p.esTemporada);
  const itemsEnGrid = mostrarSoloMias ? productos : productosNormales;

  // ==============================================================
  // 0️⃣ Cargar categorías desde el backend y preparar lista completa
  // ==============================================================
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await obtenerCategorias();

        const categoriasConIconos = data.map((c) => ({
          ...c,
          icono: obtenerIconoCategoria(c.nombre),
        }));

        setCategorias([
          { id: 0, nombre: "Todos", icono: "🌐" },
          ...categoriasConIconos,
        ]);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };

    cargarCategorias();
  }, []);

  // 👇 NUEVO: 0.5️⃣ Cargar ESPECIALES GLOBALES una sola vez
  useEffect(() => {
    let cancelado = false;

    const cargarEspeciales = async () => {
      try {
        const data = await obtenerPublicacionesEspeciales();
        if (!cancelado) setEspecialesGlobales(data);
      } catch (e) {
        console.error("Error al cargar especiales globales:", e);
        if (!cancelado) setEspecialesGlobales([]);
      }
    };

    cargarEspeciales();
    return () => {
      cancelado = true;
    };
  }, []);

  // ==============================================================
  // 1️⃣ Cargar publicaciones según categoría, búsqueda o usuario
  // ==============================================================
  useEffect(() => {
    const fetchProductos = async () => {
      setCargando(true);
      try {
        let data: Producto[] = [];

        if (mostrarSoloMias) {
          data = await obtenerMisPublicaciones();
        } else {
          const categoria =
            categoriaSeleccionada && categoriaSeleccionada.nombre !== "Todos"
              ? categoriaSeleccionada.nombre
              : undefined;

          data = await obtenerPublicaciones(categoria, busqueda || undefined);
        }

        setProductos(data);
      } catch (error) {
        console.error("Error al obtener publicaciones:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchProductos();
  }, [categoriaSeleccionada, busqueda, mostrarSoloMias, usuario]);

  // ==============================================================
  // 2️⃣ Eventos globales (login, recuperar, mis publicaciones...)
  // ==============================================================
  useEffect(() => {
    const handleAbrirLogin = () => setOpenLogin(true);
    window.addEventListener("abrir-login", handleAbrirLogin);
    return () => window.removeEventListener("abrir-login", handleAbrirLogin);
  }, []);

  useEffect(() => {
    const handleAbrirRecuperar = () => setOpenRecuperar(true);
    window.addEventListener("abrir-recuperar", handleAbrirRecuperar);
    return () =>
      window.removeEventListener("abrir-recuperar", handleAbrirRecuperar);
  }, []);

  useEffect(() => {
    const handleLoginExitoso = () => {
      if (quierePublicar) {
        setModalOpen(true);
        setQuierePublicar(false);
      }
    };
    window.addEventListener("login-exitoso", handleLoginExitoso);
    return () =>
      window.removeEventListener("login-exitoso", handleLoginExitoso);
  }, [quierePublicar]);

  useEffect(() => {
    const handleVerMisPublicaciones = () => setMostrarSoloMias(true);
    window.addEventListener("ver-mis-publicaciones", handleVerMisPubliciciones);
    function handleVerMisPubliciciones() {
      setMostrarSoloMias(true);
    }
    return () =>
      window.removeEventListener(
        "ver-mis-publicaciones",
        handleVerMisPubliciciones
      );
  }, []);

  // ==============================================================
  // 🔄 6️⃣ Escuchar actualización global de publicaciones
  // ==============================================================
  useEffect(() => {
    const actualizar = () => {
      // 🔁 Le damos un pequeño delay para asegurar que el backend actualizó antes del reload
      setTimeout(() => window.location.reload(), 200);
    };

    window.addEventListener("actualizar-publicaciones", actualizar);

    return () =>
      window.removeEventListener("actualizar-publicaciones", actualizar);
  }, []);

  const handleCrearPublicacion = () => {
    const token = localStorage.getItem("token");

    if (token) {
      setModalOpen(true);
    } else {
      setQuierePublicar(true);
      setOpenLogin(true);
    }
  };

  const handlePublicar = async () => {
    setModalOpen(false);
    const data = await obtenerPublicaciones(
      categoriaSeleccionada?.nombre !== "Todos"
        ? categoriaSeleccionada?.nombre
        : undefined,
      busqueda || undefined
    );
    setProductos(data);
  };

  const puedeActivarEspecial = !!usuario?.permisos?.includes(
    "CrearPublicacionTemporada"
  );

  const showFab = !modalOpen && puedePublicar;

  // ==============================================================
  // RENDER
  // ==============================================================
  return (
    <div className="bg-[#1e1f23] min-h-screen text-white">
      <Cabecera />

      {/* CATEGORÍAS EN MÓVIL (compactado) */}
      <div className="md:hidden overflow-x-auto whitespace-nowrap px-2 py-1 flex gap-1 bg-[#1f2937] border-b border-gray-700">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            className={`px-3 py-1 rounded-full border text-sm transition ${
              categoriaSeleccionada?.id === cat.id
                ? "bg-yellow-400 text-black font-semibold"
                : "bg-[#2d3748] text-white"
            }`}
            onClick={() => {
              setCategoriaSeleccionada(cat);
              setMostrarSoloMias(false);
            }}
          >
            {cat.icono} {cat.nombre}
          </button>
        ))}

        {!esVisitante && puedePublicar && (
          <button
            onClick={() =>
              window.dispatchEvent(new Event("ver-mis-publicaciones"))
            }
            className="px-3 py-1 rounded-full border text-sm font-semibold 
            text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black transition"
          >
            📚 Mis publicaciones
          </button>
        )}

        {puedeVerClientes && (
          <button
            onClick={() => navigate("/clientes")}
            className="px-3 py-1 rounded-full border text-sm font-semibold 
            text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black transition"
          >
            <PersonIcon fontSize="small" className="mr-1" />
            Gestionar Clientes
          </button>
        )}
      </div>

      <div className="flex">
        {/* SIDEBAR — ahora ancho, scroll vertical y sin romper nada */}
        <aside
          className={`fixed md:fixed md:left-0 top-[64px] bg-[#1e1f23] text-white 
    border-r-2 border-yellow-400 p-4 w-72 z-50 
    h-[calc(100vh-64px)] overflow-y-auto
    ${sidebarAbierto ? "block" : "hidden md:block"}`}
        >
          <CategoriasPanel
            categorias={categorias}
            categoriaSeleccionada={categoriaSeleccionada}
            onSelect={(cat) => {
              setCategoriaSeleccionada(cat);
              setSidebarAbierto(false);
              setMostrarSoloMias(false);
            }}
            onCrearPublicacion={handleCrearPublicacion}
          />
        </aside>

        {/* ZONA DE PRODUCTOS */}
        <main
          className={`flex-1 p-4 mt-2 md:mt-4 md:ml-72 overflow-x-hidden
          ${showFab ? "pb-28 md:pb-0" : ""}`}
        >
          <div
            className="w-full max-w-[1280px] mx-auto px-2"
            style={{
              // asegura margen extra en móviles con notch cuando el FAB está
              paddingBottom: showFab
                ? "calc(7rem + env(safe-area-inset-bottom, 0px))"
                : undefined,
            }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {mostrarSoloMias
                ? "Mis publicaciones"
                : categoriaSeleccionada?.nombre || "Todos los productos"}
            </h2>

            {mostrarSoloMias && (
              <button
                onClick={() => setMostrarSoloMias(false)}
                className="mb-3 text-yellow-400 hover:text-yellow-500 underline"
              >
                ← Volver al marketplace
              </button>
            )}

            {/* 🚀 CARRUSEL DE PUBLICACIONES ESPECIALES — SIEMPRE visible (salvo en mis publicaciones) */}
            {!mostrarSoloMias && especialesGlobales.length > 0 && (
              <CarruselEspeciales
                productos={especialesGlobales}
                mostrarAcciones={false} // en el home no mostramos acciones
                onEliminarProducto={(id) =>
                  setProductos((prev) => prev.filter((x) => x.id !== id))
                }
              />
            )}

            {cargando ? (
              <div className="flex justify-center items-center py-10 text-yellow-400">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400 border-opacity-70 mr-3"></div>
                Cargando publicaciones...
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
                {itemsEnGrid.map((p) => (
                  <ProductoCard
                    key={p.id}
                    producto={p}
                    onEliminado={(id) =>
                      setProductos((prev) => prev.filter((x) => x.id !== id))
                    }
                    mostrarAcciones={mostrarSoloMias}
                    variant={mostrarSoloMias ? "compact" : "default"}
                    puedeActivarEspecial={puedeActivarEspecial}
                  />
                ))}

                {/* Spacer para que el FAB no tape la última card en móvil */}
                {showFab && (
                  <div className="h-28 md:hidden" aria-hidden="true" />
                )}
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

      {!modalOpen && puedePublicar && (
        <button
          id="crear-publicacion-btn"
          onClick={handleCrearPublicacion}
          className="fixed bottom-6 right-6 z-50 bg-yellow-400 text-black font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-yellow-300 transition animate-pulse-slow block md:hidden"
        >
          + Crear publicación
        </button>
      )}

      <LoginModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        onSwitchToRegister={(datos?: any) => {
          setDatosPrevios(null);
          setTimeout(() => {
            setDatosPrevios(datos || null);
            setOpenLogin(false);
            setOpenRegister(true);
          }, 0);
        }}
      />

      <RegisterModal
        open={openRegister}
        onClose={() => setOpenRegister(false)}
        datosPrevios={datosPrevios}
      />

      <CambiarClaveModal
        open={openRecuperar}
        onClose={() => setOpenRecuperar(false)}
      />
    </div>
  );
};

export default Marketplace;

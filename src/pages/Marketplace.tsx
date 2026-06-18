import React, { Fragment, useState, useEffect, useCallback } from "react";
import Cabecera from "../components/Cabecera";
import CategoriasPanel from "../components/CategoriasPanel";
import ProductoCard from "../components/ProductoCard";
import CarruselEspeciales from "../components/CarruselEspeciales";
import CrearPublicacionModal from "../components/publicaciones/CrearPublicacionModal";
import LoginModal from "../components/auth/LoginModal";
import RegisterModal from "../components/auth/RegisterModal";
import CambiarClaveModal from "../components/auth/CambiarClaveModal";
import { BannerPublicidadCarousel } from "../components/banners/BannerPublicidadCarousel";

import { Producto } from "../types/producto";
import { Categoria } from "../types/categoria";
import { PublicacionEditable } from "../types/publicacion.types";
import PromocionBannersCTA from "../components/banners/PromocionBannersCTA";

import {
  obtenerPublicaciones,
  obtenerMisPublicaciones,
  obtenerCategorias,
} from "../api/publicacionesService";

import { useUsuario } from "../context/UsuarioContext";
import { useBannersHome } from "../hooks/useBannersHome";
import { obtenerIconoCategoria } from "../utils/categoriaIconos";

type DatosPreviosRegistro = {
  email?: string;
  nombre?: string;
  fotoUrl?: string;
  tipoLogin?: string;
  proveedor?: string;
  proveedorId?: string;
} | null;

const mapearProductoAEditable = (producto: Producto): PublicacionEditable => {
  const planCreditoNormalizado = Array.isArray(producto.planCredito)
    ? producto.planCredito.map((plan: any) => ({
        cuotas: plan?.cuotas,
        valorCuota: plan?.valorCuota,
      }))
    : Array.isArray((producto.planCredito as any)?.opciones)
      ? (producto.planCredito as any).opciones.map((plan: any) => ({
          cuotas: plan?.cuotas,
          valorCuota: plan?.valorCuota,
        }))
      : [];

  const imagenesExistentes = Array.isArray(producto.imagenes)
    ? producto.imagenes.map((img: any) => ({
        mainUrl: img?.mainUrl || img?.url || "",
        thumbUrl: img?.thumbUrl || img?.mainUrl || img?.url || "",
      }))
    : [];

  return {
    id: producto.id,
    titulo: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    categoria: producto.categoria,
    ubicacion: producto.ubicacion,
    mostrarBotonesCompra: producto.mostrarBotonesCompra,
    planCredito: planCreditoNormalizado,
    latitud: (producto as any).latitud ?? null,
    longitud: (producto as any).longitud ?? null,
    googleMapsUrl: (producto as any).googleMapsUrl ?? null,
    imagenesExistentes,
  };
};

const Marketplace: React.FC = () => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null);

  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [openRecuperar, setOpenRecuperar] = useState(false);

  const [publicacionAEditar, setPublicacionAEditar] =
    useState<PublicacionEditable | null>(null);

  const [datosPreviosRegistro, setDatosPreviosRegistro] =
    useState<DatosPreviosRegistro>(null);

  const [quierePublicar, setQuierePublicar] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [cargando, setCargando] = useState(false);
  const [mostrarSoloMias, setMostrarSoloMias] = useState(false);

  const { usuario, puedePublicar } = useUsuario();

  /*
    NUEVO:
    Consume GET /api/banners-publicitarios/home
    y separa los anuncios según su ubicación.
  */
  const { homeTop, homeInline } = useBannersHome();

  const productosEspeciales = productos.filter((p) => p.esTemporada);
  const productosNormales = productos.filter((p) => !p.esTemporada);

  const itemsEnGrid = mostrarSoloMias ? productos : productosNormales;

  const mostrarCarruselEspeciales =
    !mostrarSoloMias && productosEspeciales.length > 0;

  /*
    Los banners comerciales aparecen solamente en la vitrina pública.
    No se muestran dentro de "Mis publicaciones".
  */
  const mostrarBannersPublicitarios = !mostrarSoloMias;

  const showFab = !modalOpen && puedePublicar && !sidebarAbierto;

  const cargarPublicaciones = useCallback(async () => {
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

      setProductos(data || []);
    } catch (error) {
      console.error("Error al obtener publicaciones:", error);
      setProductos([]);
    } finally {
      setCargando(false);
    }
  }, [categoriaSeleccionada, busqueda, mostrarSoloMias]);

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
        setCategorias([{ id: 0, nombre: "Todos", icono: "🌐" }]);
      }
    };

    void cargarCategorias();
  }, []);

  useEffect(() => {
    void cargarPublicaciones();
  }, [cargarPublicaciones, usuario]);

  useEffect(() => {
    const handleAbrirLogin = () => setOpenLogin(true);

    window.addEventListener("abrir-login", handleAbrirLogin);

    return () => {
      window.removeEventListener("abrir-login", handleAbrirLogin);
    };
  }, []);

  useEffect(() => {
    const handleAbrirRecuperar = () => setOpenRecuperar(true);

    window.addEventListener("abrir-recuperar", handleAbrirRecuperar);

    return () => {
      window.removeEventListener("abrir-recuperar", handleAbrirRecuperar);
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

  useEffect(() => {
    const handleVerMisPublicaciones = () => {
      setMostrarSoloMias(true);
      setCategoriaSeleccionada(null);
      setBusqueda("");
    };

    window.addEventListener("ver-mis-publicaciones", handleVerMisPublicaciones);

    return () => {
      window.removeEventListener(
        "ver-mis-publicaciones",
        handleVerMisPublicaciones,
      );
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const texto = customEvent.detail || "";

      setBusqueda(texto);
      setCategoriaSeleccionada(null);
      setMostrarSoloMias(false);
    };

    window.addEventListener("buscar-productos", handler as EventListener);

    return () => {
      window.removeEventListener("buscar-productos", handler as EventListener);
    };
  }, []);

  useEffect(() => {
    const actualizar = () => {
      void cargarPublicaciones();
    };

    window.addEventListener("actualizar-publicaciones", actualizar);

    return () => {
      window.removeEventListener("actualizar-publicaciones", actualizar);
    };
  }, [cargarPublicaciones]);

  useEffect(() => {
    const toggle = () => {
      if (window.innerWidth < 768) {
        setSidebarAbierto((prev) => !prev);
      }
    };

    const close = () => {
      setSidebarAbierto(false);
    };

    window.addEventListener("toggle-sidebar", toggle);
    window.addEventListener("cerrar-sidebar", close);

    return () => {
      window.removeEventListener("toggle-sidebar", toggle);
      window.removeEventListener("cerrar-sidebar", close);
    };
  }, []);

  const handleCrearPublicacion = () => {
    const token = localStorage.getItem("token");

    if (token) {
      setPublicacionAEditar(null);
      setModalOpen(true);
      return;
    }

    setQuierePublicar(true);
    setOpenLogin(true);
  };

  const handleEditarPublicacion = (producto: Producto) => {
    setPublicacionAEditar(mapearProductoAEditable(producto));
    setModalOpen(true);
  };

  const handlePublicacionGuardada = async () => {
    setModalOpen(false);
    setPublicacionAEditar(null);
    await cargarPublicaciones();
  };

  return (
    <div className="min-h-screen bg-[#1e1f23] text-white">
      <Cabecera busqueda={busqueda} setBusqueda={setBusqueda} />

      <div className="flex">
        <aside
          className={`fixed top-[64px] z-50 h-[calc(100vh-64px)] w-72 overflow-y-auto border-r-2 border-yellow-400 bg-[#1e1f23] p-4 text-white md:left-0
            ${sidebarAbierto ? "block" : "hidden md:block"}`}
        >
          <div className="flex h-full flex-col">
            <CategoriasPanel
              categorias={categorias}
              categoriaSeleccionada={categoriaSeleccionada}
              onSelect={(cat) => {
                setCategoriaSeleccionada(cat);
                setSidebarAbierto(false);
                setMostrarSoloMias(false);
              }}
              onCrearPublicacion={handleCrearPublicacion}
              onCerrarSidebar={() => setSidebarAbierto(false)}
            />
          </div>
        </aside>

        <main
          className={`mt-2 flex-1 overflow-x-hidden p-4 md:ml-72 md:mt-4 ${
            showFab ? "pb-28 md:pb-0" : ""
          }`}
        >
          <div
            className="mx-auto w-full max-w-[1280px] px-2"
            style={{
              paddingBottom: showFab
                ? "calc(7rem + env(safe-area-inset-bottom, 0px))"
                : undefined,
            }}
          >
            {/*
              NUEVO:
              Banner superior grande del marketplace.
            */}
            {mostrarBannersPublicitarios && homeTop.length > 0 && (
              <BannerPublicidadCarousel
                banners={homeTop}
                ubicacion="HOME_TOP"
                intervaloMs={5000}
              />
            )}

            {mostrarBannersPublicitarios && (
              <PromocionBannersCTA variant="mobile" />
            )}

            <h2 className="mb-4 text-2xl font-semibold text-white">
              {mostrarSoloMias
                ? "Mis publicaciones"
                : categoriaSeleccionada?.nombre || "Todos los productos"}
            </h2>

            {mostrarSoloMias && (
              <button
                onClick={() => {
                  setMostrarSoloMias(false);
                  setCategoriaSeleccionada(null);
                  setBusqueda("");
                }}
                className="mb-3 text-yellow-400 underline hover:text-yellow-500"
              >
                ← Volver al marketplace
              </button>
            )}

            {cargando ? (
              <div className="flex items-center justify-center py-10 text-yellow-400">
                <div className="mr-3 h-8 w-8 animate-spin rounded-full border-t-2 border-yellow-400 border-opacity-70" />
                Cargando publicaciones...
              </div>
            ) : (
              <>
                {mostrarCarruselEspeciales && (
                  <CarruselEspeciales productos={productosEspeciales} />
                )}

                {itemsEnGrid.length === 0 ? (
                  !mostrarCarruselEspeciales && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-gray-300">
                      No hay publicaciones disponibles.
                    </div>
                  )
                ) : (
                  <div className="grid grid-flow-row-dense grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
                    {itemsEnGrid.map((p, index) => (
                      <Fragment key={p.id}>
                        <ProductoCard
                          producto={p}
                          onEliminado={(id) =>
                            setProductos((prev) =>
                              prev.filter((x) => x.id !== id),
                            )
                          }
                          onEditar={handleEditarPublicacion}
                          mostrarAcciones={mostrarSoloMias}
                          variant={mostrarSoloMias ? "compact" : "default"}
                        />

                        {/*
                          NUEVO:
                          Banner intermedio después de la sexta
                          publicación normal.
                        */}
                        {mostrarBannersPublicitarios &&
                          index === 5 &&
                          homeInline.length > 0 && (
                            <div className="home__banner-inline">
                              <BannerPublicidadCarousel
                                banners={homeInline}
                                ubicacion="HOME_INLINE"
                                intervaloMs={4000}
                              />
                            </div>
                          )}
                      </Fragment>
                    ))}

                    {/*
                      Si existen menos de seis publicaciones,
                      igualmente mostramos el banner intermedio
                      al final del grid.
                    */}
                    {mostrarBannersPublicitarios &&
                      itemsEnGrid.length <= 5 &&
                      homeInline.length > 0 && (
                        <div className="home__banner-inline">
                          <BannerPublicidadCarousel
                            banners={homeInline}
                            ubicacion="HOME_INLINE"
                            intervaloMs={4000}
                          />
                        </div>
                      )}

                    {showFab && (
                      <div className="h-28 md:hidden" aria-hidden="true" />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <CrearPublicacionModal
        abierto={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPublicacionAEditar(null);
        }}
        onCreado={handlePublicacionGuardada}
        onActualizada={handlePublicacionGuardada}
        modo="marketplace"
        publicacionAEditar={publicacionAEditar}
        categorias={categorias.filter((c) => c.nombre !== "Todos")}
      />

      {showFab && (
        <button
          id="crear-publicacion-btn"
          onClick={handleCrearPublicacion}
          className="fixed bottom-6 right-6 z-50 block animate-pulse rounded-full bg-yellow-400 px-4 py-2 font-semibold text-black shadow-lg transition hover:bg-yellow-300 md:hidden"
        >
          + Crear publicación
        </button>
      )}

      <LoginModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        onSwitchToRegister={(datos?: any) => {
          setDatosPreviosRegistro(null);

          setTimeout(() => {
            setDatosPreviosRegistro(datos || null);
            setOpenLogin(false);
            setOpenRegister(true);
          }, 0);
        }}
      />

      <RegisterModal
        open={openRegister}
        onClose={() => setOpenRegister(false)}
        datosPrevios={datosPreviosRegistro}
      />

      <CambiarClaveModal
        open={openRecuperar}
        onClose={() => setOpenRecuperar(false)}
      />
    </div>
  );
};

export default Marketplace;

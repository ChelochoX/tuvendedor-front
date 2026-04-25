import React, { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import ProductoCard from "../../components/ProductoCard";
import CrearPublicacionModal from "../../components/publicaciones/CrearPublicacionModal";
import { obtenerMisPublicaciones } from "../../api/publicacionesService";
import { Producto } from "../../types/producto";
import { PublicacionEditable } from "../../types/publicacion.types";

interface Props {
  slug?: string | null;
}

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
    moneda: producto.moneda ?? "PYG",
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

const GestionPublicacionesVitrina: React.FC<Props> = ({ slug }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const publicacionesRef = useRef<HTMLElement | null>(null);

  const [publicaciones, setPublicaciones] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [publicacionAEditar, setPublicacionAEditar] =
    useState<PublicacionEditable | null>(null);

  const cargarPublicaciones = async () => {
    try {
      setCargando(true);

      const data = await obtenerMisPublicaciones();
      setPublicaciones(data);
    } catch (error) {
      console.error("Error al cargar publicaciones de la vitrina:", error);

      Swal.fire({
        icon: "error",
        title: "No se pudo cargar",
        text: "No se pudieron obtener tus publicaciones.",
        background: "#111827",
        color: "#fff",
        confirmButtonColor: "#facc15",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPublicaciones();
  }, []);

  useEffect(() => {
    const actualizar = async () => {
      await cargarPublicaciones();
    };

    window.addEventListener("actualizar-publicaciones", actualizar);

    return () => {
      window.removeEventListener("actualizar-publicaciones", actualizar);
    };
  }, []);

  useEffect(() => {
    if (location.hash !== "#publicaciones") return;

    const timer = window.setTimeout(() => {
      publicacionesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [location.hash, cargando, publicaciones.length]);

  const handleEditar = (producto: Producto) => {
    setPublicacionAEditar(mapearProductoAEditable(producto));
    setModalOpen(true);
  };

  const handleVerDetalle = (producto: Producto) => {
    const slugSeguro = slug?.trim();

    if (!slugSeguro) {
      navigate(`/producto/${producto.id}`);
      return;
    }

    navigate(`/vendedor/${slugSeguro}?producto=${producto.id}`, {
      state: {
        returnTo: "/clientes/perfil-vendedor#publicaciones",
        origen: "gestion-vendedor",
      },
    });
  };

  const handleGuardado = async () => {
    setModalOpen(false);
    setPublicacionAEditar(null);

    await cargarPublicaciones();

    window.dispatchEvent(new Event("actualizar-publicaciones"));
  };

  return (
    <>
      <section
        id="publicaciones"
        ref={publicacionesRef}
        className="mt-8 scroll-mt-32 rounded-[28px] border border-white/10 bg-[#0f1724] p-5 shadow-xl"
      >
        <div className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-300">
            Gestión premium
          </p>

          <h3 className="mt-2 text-2xl font-semibold text-white">
            Tus publicaciones
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Desde acá podés editar, eliminar, destacar y administrar tu
            catálogo.
          </p>
        </div>

        {cargando ? (
          <div className="flex items-center justify-center py-10 text-yellow-300">
            Cargando publicaciones...
          </div>
        ) : publicaciones.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-slate-400">
            Todavía no tenés publicaciones cargadas en tu vitrina.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
            {publicaciones.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                onEditar={handleEditar}
                onVerDetalle={handleVerDetalle}
                onEliminado={(id: number) =>
                  setPublicaciones((prev) => prev.filter((x) => x.id !== id))
                }
                mostrarAcciones
                variant="compact"
              />
            ))}
          </div>
        )}
      </section>

      <CrearPublicacionModal
        abierto={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPublicacionAEditar(null);
        }}
        onCreado={handleGuardado}
        onActualizada={handleGuardado}
        modo="perfil-vendedor"
        publicacionAEditar={publicacionAEditar}
      />
    </>
  );
};

export default GestionPublicacionesVitrina;

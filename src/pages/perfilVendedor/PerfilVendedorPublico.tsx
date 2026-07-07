import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { obtenerPerfilPublicoVendedor } from "../../api/perfilVendedorService";
import { obtenerPublicaciones } from "../../api/publicacionesService";
import {
  PublicacionPerfilVendedor,
  PerfilPublicoVendedor,
} from "../../types/perfilVendedor.types";
import PerfilVendedorHeader from "../../components/perfilVendedor/PerfilVendedorHeader";
import PerfilVendedorPublicaciones from "../../components/perfilVendedor/PerfilVendedorPublicaciones";
import PerfilPublicacionDetalleModal from "./PerfilPublicacionDetalleModal";
import VitrinaCarritoWhatsapp, {
  CarritoPedidoItem,
} from "../../components/perfilVendedor/VitrinaCarritoWhatsapp";

const normalizarTexto = (valor?: string | null): string => {
  return (valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const esCategoriaSinCarrito = (publicacion: PublicacionPerfilVendedor) => {
  const texto = normalizarTexto(
    `${publicacion.categoria || ""} ${publicacion.titulo || ""}`,
  );

  return [
    "moto",
    "motos",
    "vehiculo",
    "vehículos",
    "vehiculos",
    "auto",
    "autos",
    "camioneta",
    "inmueble",
    "inmuebles",
    "casa",
    "casas",
    "terreno",
    "terrenos",
    "departamento",
    "duplex",
    "dúplex",
    "propiedad",
    "propiedades",
  ].some((palabra) => texto.includes(palabra));
};

const PASO_CANTIDAD_PEDIDO = 0.25;
const CANTIDAD_MINIMA_PEDIDO = 0.25;

const normalizarCantidadPedido = (cantidad: number): number => {
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return CANTIDAD_MINIMA_PEDIDO;
  }

  const cantidadRedondeada = Math.round(cantidad * 100) / 100;

  return cantidadRedondeada < CANTIDAD_MINIMA_PEDIDO
    ? CANTIDAD_MINIMA_PEDIDO
    : cantidadRedondeada;
};

const vendedorOfreceDelivery = (perfil?: PerfilPublicoVendedor | null) => {
  return Boolean(perfil?.ofreceDelivery ?? perfil?.OfreceDelivery);
};

const productoPermitePedido = (
  publicacion: PublicacionPerfilVendedor,
  perfil?: PerfilPublicoVendedor | null,
) => {
  const productoTieneDelivery = Boolean(
    publicacion.permiteDelivery ?? publicacion.PermiteDelivery,
  );

  return (
    vendedorOfreceDelivery(perfil) &&
    productoTieneDelivery &&
    !esCategoriaSinCarrito(publicacion)
  );
};

const PerfilVendedorPublico: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [perfil, setPerfil] = useState<PerfilPublicoVendedor | null>(null);
  const [publicacionSeleccionada, setPublicacionSeleccionada] =
    useState<PublicacionPerfilVendedor | null>(null);
  const [carrito, setCarrito] = useState<CarritoPedidoItem[]>([]);
  const [feedbackCarrito, setFeedbackCarrito] = useState<string | null>(null);
  const feedbackCarritoTimeoutRef = useRef<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storageKey = useMemo(
    () => `tuvendedor-carrito-${slug || "default"}`,
    [slug],
  );

  useEffect(() => {
    return () => {
      if (feedbackCarritoTimeoutRef.current) {
        window.clearTimeout(feedbackCarritoTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(storageKey);

      if (guardado) {
        const datos = JSON.parse(guardado);

        if (Array.isArray(datos)) {
          setCarrito(
            datos
              .filter((item) => item?.publicacion?.id)
              .map((item) => ({
                ...item,
                cantidad: normalizarCantidadPedido(Number(item.cantidad)),
              })),
          );
        }
      }
    } catch {
      setCarrito([]);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(carrito));
    } catch {
      // localStorage puede fallar en modo privado.
    }
  }, [carrito, storageKey]);

  useEffect(() => {
    const cargarPerfil = async () => {
      if (!slug) {
        setError("No se recibió el identificador del perfil.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError(null);

        const [perfilData, publicacionesMarketplace] = await Promise.all([
          obtenerPerfilPublicoVendedor(slug),
          obtenerPublicaciones(),
        ]);

        const mapaMarketplace = new Map(
          (publicacionesMarketplace || []).map((p: any) => [p.id, p]),
        );

        const publicacionesEnriquecidas = (perfilData.publicaciones || []).map(
          (pub: any) => {
            const full = mapaMarketplace.get(pub.id) as any;

            if (!full) {
              return {
                ...pub,
                moneda: pub.moneda ?? pub.Moneda ?? "PYG",
                imagenes: pub.imagenes || [],
                permiteDelivery:
                  pub.permiteDelivery ?? pub.PermiteDelivery ?? false,
                PermiteDelivery:
                  pub.PermiteDelivery ?? pub.permiteDelivery ?? false,
              };
            }

            return {
              ...pub,
              titulo: full.nombre || full.titulo || pub.titulo,
              descripcion: full.descripcion ?? pub.descripcion,
              precio: full.precio ?? pub.precio,
              moneda: full.moneda ?? pub.moneda ?? "PYG",
              categoria: full.categoria ?? pub.categoria,
              ubicacion: full.ubicacion ?? pub.ubicacion,
              estado: full.estado ?? pub.estado,
              imagenPrincipal:
                full.imagenes?.[0]?.mainUrl || pub.imagenPrincipal,
              thumbUrl: full.imagenes?.[0]?.thumbUrl || pub.thumbUrl,
              esDestacada: full.esDestacada ?? pub.esDestacada,
              latitud: full.latitud ?? pub.latitud ?? null,
              longitud: full.longitud ?? pub.longitud ?? null,
              googleMapsUrl: full.googleMapsUrl ?? pub.googleMapsUrl ?? null,
              permiteDelivery:
                full.permiteDelivery ??
                full.PermiteDelivery ??
                pub.permiteDelivery ??
                pub.PermiteDelivery ??
                false,
              PermiteDelivery:
                full.PermiteDelivery ??
                full.permiteDelivery ??
                pub.PermiteDelivery ??
                pub.permiteDelivery ??
                false,
              imagenes: Array.isArray(full.imagenes) ? full.imagenes : [],
              esFavorito: full.esFavorito ?? pub.esFavorito ?? false,
              cantidadFavoritos:
                full.cantidadFavoritos ?? pub.cantidadFavoritos ?? 0,
              cantidadVistas: full.cantidadVistas ?? pub.cantidadVistas ?? 0,
              cantidadClicksWhatsapp:
                full.cantidadClicksWhatsapp ?? pub.cantidadClicksWhatsapp ?? 0,
            };
          },
        );

        setPerfil({
          ...perfilData,
          publicaciones: publicacionesEnriquecidas,
        });
      } catch (err) {
        console.error("Error al cargar perfil público:", err);
        setError("No se pudo cargar el perfil del vendedor.");
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, [slug]);

  useEffect(() => {
    const productoId = searchParams.get("producto");

    if (!productoId) {
      setPublicacionSeleccionada(null);
      return;
    }

    if (!perfil?.publicaciones?.length) return;

    const publicacion = perfil.publicaciones.find(
      (p) => p.id === Number(productoId),
    );

    if (publicacion) {
      setPublicacionSeleccionada(publicacion);
    }
  }, [searchParams, perfil]);

  const abrirDetalle = (publicacion: PublicacionPerfilVendedor) => {
    setPublicacionSeleccionada(publicacion);

    if (slug) {
      navigate(`/vendedor/${slug}?producto=${publicacion.id}`, {
        replace: false,
      });
    }
  };

  const agregarAlPedido = (publicacion: PublicacionPerfilVendedor) => {
    if (!productoPermitePedido(publicacion, perfil)) {
      abrirDetalle(publicacion);
      return;
    }

    let feedback = "Producto agregado";

    setCarrito((actual) => {
      const existente = actual.find(
        (item) => Number(item.publicacion.id) === Number(publicacion.id),
      );

      if (existente) {
        const nuevaCantidad = existente.cantidad + 1;

        feedback = "Cantidad actualizada";

        return actual.map((item) =>
          Number(item.publicacion.id) === Number(publicacion.id)
            ? { ...item, cantidad: nuevaCantidad }
            : item,
        );
      }

      return [
        ...actual,
        {
          publicacion,
          cantidad: 1,
        },
      ];
    });

    setFeedbackCarrito(feedback);

    if (feedbackCarritoTimeoutRef.current) {
      window.clearTimeout(feedbackCarritoTimeoutRef.current);
    }

    feedbackCarritoTimeoutRef.current = window.setTimeout(() => {
      setFeedbackCarrito(null);
      feedbackCarritoTimeoutRef.current = null;
    }, 1800);
  };

  const incrementarItem = (idPublicacion: number) => {
    setCarrito((actual) =>
      actual.map((item) =>
        Number(item.publicacion.id) === Number(idPublicacion)
          ? {
              ...item,
              cantidad: normalizarCantidadPedido(
                item.cantidad + PASO_CANTIDAD_PEDIDO,
              ),
            }
          : item,
      ),
    );
  };

  const disminuirItem = (idPublicacion: number) => {
    setCarrito((actual) =>
      actual
        .map((item) =>
          Number(item.publicacion.id) === Number(idPublicacion)
            ? {
                ...item,
                cantidad:
                  Math.round((item.cantidad - PASO_CANTIDAD_PEDIDO) * 100) /
                  100,
              }
            : item,
        )
        .filter((item) => item.cantidad >= CANTIDAD_MINIMA_PEDIDO),
    );
  };

  const actualizarCantidadItem = (
    idPublicacion: number,
    cantidadSolicitada: number,
  ) => {
    setCarrito((actual) =>
      actual.map((item) =>
        Number(item.publicacion.id) === Number(idPublicacion)
          ? {
              ...item,
              cantidad: normalizarCantidadPedido(cantidadSolicitada),
            }
          : item,
      ),
    );
  };

  const eliminarItem = (idPublicacion: number) => {
    setCarrito((actual) =>
      actual.filter(
        (item) => Number(item.publicacion.id) !== Number(idPublicacion),
      ),
    );
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const location = useLocation();

  const state = location.state as
    | {
        returnTo?: string;
        origen?: string;
      }
    | undefined;

  const cerrarDetalle = () => {
    setPublicacionSeleccionada(null);

    if (state?.returnTo) {
      navigate(state.returnTo, { replace: true });
      return;
    }

    if (slug) {
      navigate(`/vendedor/${slug}`, {
        replace: true,
      });
    }
  };

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-gray-300 shadow-xl">
          <Loader2 className="animate-spin text-yellow-300" />
          <span className="font-medium">Cargando perfil del vendedor...</span>
        </div>
      </main>
    );
  }

  if (error || !perfil) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-5 text-center text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-gray-900 p-8 shadow-2xl">
          <h1 className="text-2xl font-semibold text-white">
            Perfil no disponible
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            {error || "No encontramos el perfil solicitado."}
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-full bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:bg-yellow-300"
          >
            Volver al marketplace
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 pb-28 text-white antialiased">
      <PerfilVendedorHeader perfil={perfil} />

      <PerfilVendedorPublicaciones
        publicaciones={perfil.publicaciones || []}
        onVerDetalle={abrirDetalle}
        onAgregarAlPedido={agregarAlPedido}
        productoPermitePedido={(publicacion) =>
          productoPermitePedido(publicacion, perfil)
        }
      />

      <VitrinaCarritoWhatsapp
        perfil={perfil}
        items={carrito}
        onIncrementar={incrementarItem}
        onDisminuir={disminuirItem}
        onActualizarCantidad={actualizarCantidadItem}
        onEliminar={eliminarItem}
        onVaciar={vaciarCarrito}
        feedbackAgregado={feedbackCarrito}
      />

      {publicacionSeleccionada && (
        <PerfilPublicacionDetalleModal
          perfil={perfil}
          publicacion={publicacionSeleccionada}
          onClose={cerrarDetalle}
        />
      )}
    </main>
  );
};

export default PerfilVendedorPublico;

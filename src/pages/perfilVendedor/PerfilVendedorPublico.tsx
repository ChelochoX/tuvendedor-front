import React, { useEffect, useState } from "react";
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

const PerfilVendedorPublico: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [perfil, setPerfil] = useState<PerfilPublicoVendedor | null>(null);
  const [publicacionSeleccionada, setPublicacionSeleccionada] =
    useState<PublicacionPerfilVendedor | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            const full = mapaMarketplace.get(pub.id);

            if (!full) {
              return {
                ...pub,
                moneda: pub.moneda ?? "PYG",
                imagenes: pub.imagenes || [],
              };
            }

            return {
              ...pub,
              titulo: full.nombre || pub.titulo,
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
              imagenes: Array.isArray(full.imagenes) ? full.imagenes : [],
              // ❤️ Favoritos / interacciones
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
    <main className="min-h-screen bg-gray-950 text-white antialiased">
      <PerfilVendedorHeader perfil={perfil} />

      <PerfilVendedorPublicaciones
        publicaciones={perfil.publicaciones || []}
        onVerDetalle={abrirDetalle}
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

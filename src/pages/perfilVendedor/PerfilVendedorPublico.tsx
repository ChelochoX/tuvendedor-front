import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { obtenerPerfilPublicoVendedor } from "../../api/perfilVendedorService";
import { PerfilPublicoVendedor } from "../../types/perfilVendedor.types";
import PerfilVendedorHeader from "../../components/PerfilVendedorHeader";
import PerfilVendedorPublicaciones from "../../components/PerfilVendedorPublicaciones";

const PerfilVendedorPublico: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState<PerfilPublicoVendedor | null>(null);
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

        const data = await obtenerPerfilPublicoVendedor(slug);
        setPerfil(data);
      } catch (err) {
        console.error("Error al cargar perfil público:", err);
        setError("No se pudo cargar el perfil del vendedor.");
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, [slug]);

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-gray-300 shadow-xl">
          <Loader2 className="animate-spin text-yellow-300" />
          <span className="font-semibold">Cargando perfil del vendedor...</span>
        </div>
      </main>
    );
  }

  if (error || !perfil) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-5 text-center text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-gray-900 p-8 shadow-2xl">
          <h1 className="text-2xl font-extrabold text-white">
            Perfil no disponible
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            {error || "No encontramos el perfil solicitado."}
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-full bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
          >
            Volver al marketplace
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Botón flotante para volver a edición */}
      <div className="fixed left-4 top-4 z-50">
        <button
          onClick={() => navigate("/clientes/perfil-vendedor")}
          className="rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-extrabold text-black shadow-xl transition hover:-translate-y-0.5 hover:bg-yellow-300"
        >
          Editar mi vitrina
        </button>
      </div>

      <PerfilVendedorHeader perfil={perfil} />

      <PerfilVendedorPublicaciones publicaciones={perfil.publicaciones} />
    </main>
  );
};

export default PerfilVendedorPublico;

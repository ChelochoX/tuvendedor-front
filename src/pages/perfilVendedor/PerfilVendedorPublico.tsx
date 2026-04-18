import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="flex items-center gap-3 text-gray-300">
          <Loader2 className="animate-spin" />
          Cargando perfil del vendedor...
        </div>
      </div>
    );
  }

  if (error || !perfil) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-5 text-center text-white">
        <h1 className="text-2xl font-bold">Perfil no disponible</h1>
        <p className="mt-2 max-w-md text-gray-400">
          {error || "No encontramos el perfil solicitado."}
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-6 flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-3 font-bold text-black hover:bg-yellow-300"
        >
          <ArrowLeft size={18} />
          Volver al marketplace
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="fixed left-4 top-4 z-50">
        <button
          onClick={() => navigate("/clientes/perfil-vendedor")}
          className="rounded-full bg-yellow-400 px-5 py-2 text-sm font-bold text-black shadow-lg transition hover:bg-yellow-300"
        >
          Editar mi vitrina
        </button>
      </div>

      <PerfilVendedorHeader perfil={perfil} />

      <div className="mx-auto max-w-7xl">
        <PerfilVendedorPublicaciones publicaciones={perfil.publicaciones} />
      </div>
    </main>
  );
};

export default PerfilVendedorPublico;

import React from "react";
import { MapPin, MessageCircle, Star, Instagram, Facebook } from "lucide-react";
import { PerfilPublicoVendedor } from "../types/perfilVendedor.types";

interface Props {
  perfil: PerfilPublicoVendedor;
}

const PerfilVendedorHeader: React.FC<Props> = ({ perfil }) => {
  const banner =
    perfil.bannerUrl ||
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab";

  const foto =
    perfil.fotoPerfil ||
    "https://ui-avatars.com/api/?name=Vendedor&background=111827&color=fff";

  const whatsappUrl = perfil.whatsapp
    ? `https://wa.me/${perfil.whatsapp}`
    : undefined;

  return (
    <section className="relative overflow-hidden rounded-b-[2rem] bg-gray-950 text-white shadow-2xl">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: `url(${banner})` }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/45 to-gray-950" />

      <div className="relative z-10 px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex justify-between items-start gap-4">
          <span className="rounded-full bg-black/60 px-4 py-2 text-xs font-semibold backdrop-blur">
            Tu Vendedor Premium
          </span>

          {perfil.esPremium && (
            <span className="flex items-center gap-1 rounded-full border border-yellow-400/70 bg-yellow-400/10 px-4 py-2 text-xs font-semibold text-yellow-300">
              <Star size={14} />
              Premium
            </span>
          )}
        </div>

        <div className="mt-16 flex flex-col gap-5 sm:flex-row sm:items-end">
          <img
            src={foto}
            alt={perfil.nombreNegocio}
            className="h-24 w-24 rounded-2xl border-2 border-white/70 object-cover shadow-xl"
          />

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold sm:text-3xl">
                {perfil.nombreNegocio}
              </h1>

              {perfil.esPremium && (
                <span className="rounded-full bg-yellow-400 px-2 py-1 text-[10px] font-bold uppercase text-black">
                  Premium
                </span>
              )}
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-100">
              {perfil.descripcion}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {perfil.ciudadVisible && (
                <span className="flex items-center gap-1 rounded-full bg-black/50 px-3 py-2">
                  <MapPin size={14} />
                  {perfil.ciudadVisible}
                </span>
              )}

              {perfil.rubro && (
                <span className="rounded-full bg-black/50 px-3 py-2">
                  {perfil.rubro}
                </span>
              )}

              <span className="rounded-full bg-black/50 px-3 py-2">
                +{perfil.cantidadPublicaciones} publicaciones
              </span>

              <span className="rounded-full bg-black/50 px-3 py-2">
                Respuesta rápida
              </span>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-bold text-black shadow-lg transition hover:bg-green-400"
            >
              <MessageCircle size={18} />
              Hablar por WhatsApp
            </a>
          )}

          <a
            href="#catalogo"
            className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Ver catálogo completo
          </a>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur">
            <p className="text-xs text-gray-400">Subdominio público</p>
            <p className="mt-2 break-all font-bold text-yellow-300">
              {perfil.slug}.tuvendedor.com.py
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur">
            <p className="text-xs text-gray-400">Categoría principal</p>
            <p className="mt-2 font-bold">{perfil.rubro || "General"}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur">
            <p className="text-xs text-gray-400">Redes</p>
            <div className="mt-2 flex gap-3">
              {perfil.instagramUrl && (
                <a
                  href={perfil.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-bold hover:text-yellow-300"
                >
                  <Instagram size={16} />
                  Instagram
                </a>
              )}

              {perfil.facebookUrl && (
                <a
                  href={perfil.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-bold hover:text-yellow-300"
                >
                  <Facebook size={16} />
                  Facebook
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerfilVendedorHeader;

import React from "react";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  Store,
} from "lucide-react";
import { PerfilPublicoVendedor } from "../../types/perfilVendedor.types";
import {
  abrirWhatsapp,
  limpiarTelefonoWhatsapp,
} from "../../utils/whatsappShare";
import PortadaPredeterminada from "./PortadaPredeterminada";

interface Props {
  perfil: PerfilPublicoVendedor;
}

const PerfilVendedorHeader: React.FC<Props> = ({ perfil }) => {
  const banner = perfil.bannerUrl?.trim() || "";
  const tieneBanner = Boolean(banner);

  const foto =
    perfil.fotoPerfil ||
    "https://ui-avatars.com/api/?name=Vendedor&background=111827&color=fff";

  const telefonoComercial = perfil.whatsapp || perfil.telefono || "";
  const telefonoComercialLimpio = limpiarTelefonoWhatsapp(telefonoComercial);

  const esVideoBanner =
    tieneBanner &&
    (perfil.bannerTipo?.toUpperCase() === "VIDEO" ||
      /\.(mp4|webm|mov)(\?.*)?$/i.test(banner));

  const handleWhatsapp = () => {
    abrirWhatsapp(
      telefonoComercial,
      "Hola, vi tu vitrina y me interesa conocer más detalles sobre tus publicaciones disponibles.",
    );
  };

  return (
    <section className="relative overflow-hidden bg-gray-950 text-white shadow-2xl">
      <div className="absolute inset-0">
        {tieneBanner ? (
          esVideoBanner ? (
            <video
              src={banner}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover opacity-70"
            />
          ) : (
            <div
              className="h-full w-full bg-cover bg-center opacity-75"
              style={{ backgroundImage: `url(${banner})` }}
            />
          )
        ) : (
          <PortadaPredeterminada />
        )}
      </div>

      <div
        className={[
          "absolute inset-0 bg-gradient-to-b",
          tieneBanner
            ? "from-black/20 via-black/40 to-gray-950/75"
            : "from-black/08 via-black/18 to-gray-950/70",
        ].join(" ")}
      />

      <div
        className={[
          "absolute inset-0 bg-gradient-to-r",
          tieneBanner
            ? "from-black/45 via-black/18 to-black/35"
            : "from-black/22 via-transparent to-black/20",
        ].join(" ")}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-8 pt-20 sm:px-8 sm:pb-8 lg:px-10 lg:pb-3 lg:pt-16">
        <div className="mb-7 flex items-center justify-between gap-4 sm:mb-9 lg:mb-5">
          <span className="rounded-full bg-black/45 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-md">
            Tu Vendedor Premium
          </span>

          {perfil.esPremium && (
            <span className="hidden items-center gap-2 rounded-full border border-yellow-400/70 bg-yellow-400/15 px-4 py-2 text-xs font-bold text-yellow-300 shadow-lg backdrop-blur-md sm:flex">
              <Star size={14} />
              Premium
            </span>
          )}
        </div>

        <div className="grid gap-7 lg:grid-cols-[230px_1fr_330px] lg:items-start">
          <div className="flex justify-center lg:justify-start">
            <div className="relative overflow-hidden rounded-[2rem] border-2 border-white/70 bg-gray-900 shadow-2xl">
              <img
                src={foto}
                alt={perfil.nombreNegocio || "Perfil vendedor"}
                className="h-44 w-44 object-cover object-center sm:h-56 sm:w-56 lg:h-56 lg:w-56"
              />
            </div>
          </div>

          <div className="text-center lg:pt-4 lg:text-left">
            <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl lg:mx-0 lg:text-5xl">
              {perfil.nombreNegocio || perfil.nombreUsuario || "Vendedor"}
            </h1>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-gray-100 sm:text-base lg:mx-0">
              {perfil.descripcion ||
                "Conocé este negocio, explorá sus publicaciones y encontrá sus formas de contacto en un solo lugar."}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-semibold lg:justify-start">
              {perfil.ciudadVisible && (
                <span className="flex items-center gap-1 rounded-full bg-black/45 px-4 py-2 backdrop-blur-md">
                  <MapPin size={14} />
                  {perfil.ciudadVisible}
                </span>
              )}

              {perfil.rubro && (
                <span className="flex items-center gap-1 rounded-full bg-black/45 px-4 py-2 backdrop-blur-md">
                  <Store size={14} />
                  {perfil.rubro}
                </span>
              )}

              <span className="rounded-full bg-black/45 px-4 py-2 backdrop-blur-md">
                +{perfil.cantidadPublicaciones} publicaciones
              </span>

              <span className="rounded-full bg-black/45 px-4 py-2 backdrop-blur-md">
                Respuesta rápida
              </span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none lg:pt-2">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-300 lg:text-left">
              Contacto directo
            </p>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-2.5">
              {perfil.instagramUrl && (
                <a
                  href={perfil.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-h-[52px] items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:border-yellow-400/60 hover:bg-yellow-400 hover:text-black lg:min-h-[48px] lg:py-2.5"
                >
                  <span className="flex items-center gap-2">
                    <Instagram
                      size={18}
                      className="text-yellow-300 group-hover:text-black"
                    />
                    Instagram
                  </span>
                  <span className="text-xs opacity-70">Abrir</span>
                </a>
              )}

              {perfil.facebookUrl && (
                <a
                  href={perfil.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-h-[52px] items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:border-yellow-400/60 hover:bg-yellow-400 hover:text-black lg:min-h-[48px] lg:py-2.5"
                >
                  <span className="flex items-center gap-2">
                    <Facebook
                      size={18}
                      className="text-yellow-300 group-hover:text-black"
                    />
                    Facebook
                  </span>
                  <span className="text-xs opacity-70">Abrir</span>
                </a>
              )}

              {perfil.email && (
                <a
                  href={`mailto:${perfil.email}`}
                  title={perfil.email}
                  className="group col-span-2 flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:border-yellow-400/60 hover:bg-yellow-400 hover:text-black lg:col-span-1 lg:min-h-[48px] lg:py-2.5"
                >
                  <span className="flex shrink-0 items-center gap-2">
                    <Mail
                      size={18}
                      className="text-yellow-300 group-hover:text-black"
                    />
                    Correo
                  </span>

                  <span className="min-w-0 flex-1 truncate text-right text-xs font-semibold opacity-90">
                    {perfil.email}
                  </span>
                </a>
              )}

              {telefonoComercial && perfil.mostrarTelefono && (
                <div className="col-span-2 flex min-h-[54px] items-center justify-between gap-3 rounded-2xl border border-yellow-400/40 bg-yellow-400 px-4 py-3 text-black shadow-xl backdrop-blur-md lg:col-span-1 lg:min-h-[48px] lg:py-2.5">
                  <span className="flex shrink-0 items-center gap-2 text-sm font-extrabold">
                    <Phone size={19} />
                    Teléfono
                  </span>

                  <span className="text-right text-xl font-black leading-none tracking-wide sm:text-2xl lg:text-xl">
                    {telefonoComercial}
                  </span>
                </div>
              )}

              {telefonoComercialLimpio && (
                <button
                  type="button"
                  onClick={handleWhatsapp}
                  className="group col-span-2 flex min-h-[52px] items-center justify-between rounded-2xl border border-green-400/30 bg-green-500/15 px-4 py-3 text-sm font-bold text-green-200 shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-green-500 hover:text-black lg:col-span-1 lg:min-h-[48px] lg:py-2.5"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle size={18} />
                    WhatsApp
                  </span>
                  <span className="text-xs opacity-80">Chat</span>
                </button>
              )}

              {!perfil.instagramUrl &&
                !perfil.facebookUrl &&
                !perfil.email &&
                !telefonoComercial && (
                  <div className="col-span-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-gray-300 backdrop-blur-md lg:col-span-1">
                    Sin redes configuradas.
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerfilVendedorHeader;

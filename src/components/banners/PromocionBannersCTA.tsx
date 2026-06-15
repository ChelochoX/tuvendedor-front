import React from "react";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import { ADMIN_WHATSAPP } from "../../config/comercialConfig";
import { construirLinkWhatsapp } from "../../utils/whatsapp";

interface PromocionBannersCTAProps {
  variant?: "desktop" | "mobile";
  className?: string;
}

const MENSAJE_WHATSAPP =
  "Hola, quiero información sobre los espacios publicitarios y banners de Tu Vendedor.";

const PromocionBannersCTA: React.FC<PromocionBannersCTAProps> = ({
  variant = "desktop",
  className = "",
}) => {
  const whatsappHref =
    construirLinkWhatsapp(ADMIN_WHATSAPP, MENSAJE_WHATSAPP) || "#";

  if (variant === "mobile") {
    return (
      <section
        className={`md:hidden mb-4 rounded-2xl border border-yellow-400/30 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.10),transparent_35%),linear-gradient(135deg,rgba(10,12,16,0.98)_0%,rgba(17,24,39,0.98)_100%)] p-3 shadow-[0_12px_28px_rgba(0,0,0,0.28)] ${className}`}
        aria-label="Promoción de banners publicitarios"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-400/25 bg-yellow-400/10 text-yellow-300">
            <CampaignRoundedIcon fontSize="small" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold leading-tight text-white">
              Anunciá tu negocio
            </h3>
            <p className="mt-0.5 text-[11px] leading-4 text-gray-300">
              Espacios de banners disponibles en Tu Vendedor.
            </p>
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full bg-yellow-400 px-3 py-2 text-[11px] font-bold text-black shadow hover:bg-yellow-300 transition-all"
          >
            Anunciar
          </a>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`rounded-2xl border border-yellow-400/35 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.12),transparent_35%),linear-gradient(135deg,rgba(10,12,16,0.98)_0%,rgba(17,24,39,0.98)_60%,rgba(3,7,18,0.98)_100%)] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.30)] ${className}`}
      aria-label="Promoción de banners publicitarios"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-yellow-400/25 bg-yellow-400/10 text-yellow-300">
          <CampaignRoundedIcon />
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-bold text-white">
            Anunciá tu negocio
          </h3>
          <p className="mt-1 text-sm leading-5 text-gray-300">
            Tu empresa puede aparecer en banners dentro de Tu Vendedor y llegar
            a más personas desde la portada del marketplace.
          </p>
        </div>
      </div>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-yellow-400 px-4 py-2.5 text-sm font-bold text-black shadow hover:bg-yellow-300 transition-all"
      >
        Consultar espacios
      </a>
    </section>
  );
};

export default PromocionBannersCTA;
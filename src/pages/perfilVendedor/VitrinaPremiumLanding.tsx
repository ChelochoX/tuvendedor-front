import React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Globe2,
  Link2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Store,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ADMIN_WHATSAPP } from "../../config/comercialConfig";
import { abrirWhatsapp } from "../../utils/whatsapp";
import { intentarRegistrarSolicitudPremium } from "../../api/serviciosPremiumService";
import { TIPOS_SERVICIO_PREMIUM } from "../../types/servicioPremium.types";

interface VitrinaPremiumLandingProps {
  idVendedor?: number;
  nombreNegocio?: string;
}

const VitrinaPremiumLanding: React.FC<VitrinaPremiumLandingProps> = ({
  idVendedor,
  nombreNegocio,
}) => {
  const navigate = useNavigate();

  const solicitarActivacion = async () => {
    await intentarRegistrarSolicitudPremium({
      tipoServicio: TIPOS_SERVICIO_PREMIUM.VITRINA_PROFESIONAL,
      observacion:
        "Solicitud enviada desde la pantalla comercial de vitrina profesional.",
    });

    const mensaje = `Hola 👋 Quiero activar la vitrina pública profesional de mi negocio en Tu Vendedor.

Negocio: ${nombreNegocio || "Sin especificar"}
Código de vendedor: ${idVendedor || "Sin especificar"}

Quisiera conocer el precio y las formas de pago.`;

    abrirWhatsapp(ADMIN_WHATSAPP, mensaje);
  };

  const beneficios = [
    {
      icon: Globe2,
      titulo: "Página pública",
      texto: "Tu negocio con enlace propio para compartir.",
    },
    {
      icon: Store,
      titulo: "Catálogo comercial",
      texto: "Mostrá tus productos en una vitrina ordenada.",
    },
    {
      icon: MessageCircle,
      titulo: "WhatsApp directo",
      texto: "Los clientes pueden consultarte al instante.",
    },
    {
      icon: Link2,
      titulo: "Link personalizado",
      texto: "Ideal para redes sociales, estados y campañas.",
    },
    {
      icon: Sparkles,
      titulo: "Imagen profesional",
      texto: "Portada, logo, datos comerciales y presencia de marca.",
    },
    {
      icon: ShieldCheck,
      titulo: "Más confianza",
      texto: "Tu perfil se ve más serio y fácil de contactar.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050914] px-3 py-4 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-black text-white transition hover:border-yellow-400/40 hover:bg-yellow-400 hover:text-black sm:text-sm"
        >
          <ArrowLeft size={16} />
          Volver al marketplace
        </button>

        <section className="overflow-hidden rounded-[26px] border border-yellow-400/20 bg-[#0b111c] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="relative overflow-hidden">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />
            <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />

            <div className="relative z-10 grid gap-6 px-4 py-6 sm:px-8 sm:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-yellow-300">
                  <Zap size={14} />
                  Servicio Premium
                </div>

                <h1 className="mt-4 max-w-2xl text-[28px] font-black leading-[1.05] tracking-[-0.05em] text-white sm:text-5xl">
                  Convertí tu negocio en una{" "}
                  <span className="text-yellow-300">vitrina profesional</span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-gray-300 sm:text-base sm:leading-7">
                  Mostrá todos tus productos en un solo lugar, compartí tu
                  propio enlace y recibí consultas directamente por WhatsApp.
                </p>

                <div className="mt-5 rounded-3xl border border-yellow-400/15 bg-yellow-400/[0.06] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-black">
                      <Sparkles size={21} />
                    </div>

                    <div>
                      <h2 className="text-sm font-black text-white sm:text-base">
                        Activación posterior al pago
                      </h2>

                      <p className="mt-1 text-xs leading-5 text-gray-300 sm:text-sm">
                        Solicitá el servicio por WhatsApp. Te enviaremos los
                        planes disponibles, formas de pago y pasos para activar
                        tu vitrina.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {beneficios.map((beneficio) => {
                    const Icon = beneficio.icon;

                    return (
                      <div
                        key={beneficio.titulo}
                        className="rounded-2xl border border-white/10 bg-white/[0.045] p-3.5"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-yellow-400/25 bg-yellow-400/10 text-yellow-300">
                            <Icon size={18} />
                          </div>

                          <div>
                            <h3 className="text-sm font-black text-white">
                              {beneficio.titulo}
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-gray-400">
                              {beneficio.texto}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={solicitarActivacion}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-5 py-3.5 text-sm font-black text-white shadow-[0_14px_30px_rgba(34,197,94,0.22)] transition hover:-translate-y-0.5 hover:from-green-400 hover:to-green-600 sm:w-auto sm:px-7 sm:text-base"
                >
                  <MessageCircle size={20} />
                  Consultar por WhatsApp
                </button>

                <p className="mt-3 text-center text-xs text-gray-500 sm:text-left">
                  Sin compromiso. Te pasamos precio, duración y forma de
                  activación.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-black/25 p-3 shadow-2xl sm:p-5">
                <div className="overflow-hidden rounded-[22px] border border-yellow-400/15 bg-[#111827]">
                  <div className="relative h-36 bg-gradient-to-r from-[#202b3d] via-[#384459] to-[#111827] sm:h-44">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.18),transparent_36%)]" />

                    <div className="absolute left-4 top-4 rounded-full border border-yellow-400/25 bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-yellow-300">
                      Vista previa
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="-mt-12 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-yellow-300 bg-black text-lg font-black text-yellow-300 shadow-xl">
                      {nombreNegocio
                        ? nombreNegocio
                            .trim()
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((parte) => parte[0])
                            .join("")
                            .toUpperCase()
                        : "TV"}
                    </div>

                    <h2 className="mt-4 text-xl font-black text-white">
                      {nombreNegocio || "Tu negocio"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Catálogo profesional dentro de Tu Vendedor
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
                        >
                          <div className="h-16 bg-gradient-to-br from-gray-700 to-gray-900" />
                          <div className="space-y-1.5 p-2">
                            <div className="h-2 rounded-full bg-white/20" />
                            <div className="h-2 w-2/3 rounded-full bg-yellow-300/50" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                          <CheckCircle2 size={15} className="text-yellow-300" />
                          Productos
                        </div>
                        <p className="mt-1 text-lg font-black text-white">
                          24+
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                          <MessageCircle size={15} className="text-green-400" />
                          Consultas
                        </div>
                        <p className="mt-1 text-lg font-black text-white">
                          WhatsApp
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-center text-sm font-black text-white shadow-[0_12px_24px_rgba(34,197,94,0.18)]">
                      Contactar por WhatsApp
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VitrinaPremiumLanding;

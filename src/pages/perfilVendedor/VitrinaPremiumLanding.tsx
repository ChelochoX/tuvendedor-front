import React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ADMIN_WHATSAPP } from "../../config/comercialConfig";
import { abrirWhatsapp } from "../../utils/whatsapp";

interface VitrinaPremiumLandingProps {
  idVendedor?: number;
  nombreNegocio?: string;
}

const VitrinaPremiumLanding: React.FC<VitrinaPremiumLandingProps> = ({
  idVendedor,
  nombreNegocio,
}) => {
  const navigate = useNavigate();

  const solicitarActivacion = () => {
    const mensaje = `Hola 👋 Quiero activar la vitrina pública profesional de mi negocio en Tu Vendedor.

Negocio: ${nombreNegocio || "Sin especificar"}
Código de vendedor: ${idVendedor || "Sin especificar"}

Quisiera conocer el precio y las formas de pago.`;

    abrirWhatsapp(ADMIN_WHATSAPP, mensaje);
  };

  const beneficios = [
    "Página pública personalizada para tu negocio",
    "Portada profesional con imagen o video",
    "Foto o logo comercial",
    "Catálogo completo de tus productos",
    "Enlace personalizado para compartir",
    "Botón directo a WhatsApp",
    "Redes sociales y correo comercial",
    "Herramientas para compartir campañas",
  ];

  return (
    <div className="min-h-screen bg-[#050914] px-4 py-5 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-yellow-400 hover:text-black sm:text-sm"
        >
          <ArrowLeft size={16} />
          Volver al marketplace
        </button>

        <section className="overflow-hidden rounded-[28px] border border-yellow-400/25 bg-[#101722] shadow-2xl">
          <div className="relative overflow-hidden px-5 py-10 sm:px-10 sm:py-14">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-yellow-300">
                  <Sparkles size={15} />
                  Servicio Premium
                </div>

                <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
                  Convertí tu perfil en una{" "}
                  <span className="text-yellow-300">
                    vitrina profesional
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base">
                  Mostrá todos tus productos en un solo lugar, compartí tu
                  propio enlace y recibí consultas directamente desde tu
                  catálogo comercial.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {beneficios.map((beneficio) => (
                    <div
                      key={beneficio}
                      className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3"
                    >
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0 text-yellow-300"
                      />

                      <span className="text-xs leading-5 text-gray-200 sm:text-sm">
                        {beneficio}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={solicitarActivacion}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 px-5 py-3.5 text-sm font-black text-black shadow-lg transition hover:-translate-y-0.5 hover:bg-yellow-300 sm:w-auto sm:px-7 sm:text-base"
                >
                  <MessageCircle size={19} />
                  Solicitar activación por WhatsApp
                </button>

                <p className="mt-3 text-xs text-gray-400">
                  Te enviaremos los detalles del servicio y las formas de pago.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/25 p-4 shadow-xl sm:p-5">
                <p className="text-xs font-black uppercase tracking-wide text-yellow-300">
                  Vista previa
                </p>

                <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-[#151c28]">
                  <div className="h-32 bg-gradient-to-r from-[#1d2533] via-[#394151] to-[#171d27] sm:h-40" />

                  <div className="p-4">
                    <div className="-mt-12 h-16 w-16 rounded-2xl border-2 border-white/80 bg-gray-700 shadow-lg" />

                    <h2 className="mt-3 text-lg font-black">
                      {nombreNegocio || "Tu negocio"}
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">
                      Tu catálogo profesional dentro de Tu Vendedor
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]"
                        >
                          <div className="h-16 bg-gray-700/70" />
                          <div className="space-y-1.5 p-2">
                            <div className="h-2 rounded-full bg-white/20" />
                            <div className="h-2 w-2/3 rounded-full bg-yellow-300/50" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-full bg-green-500 px-4 py-2 text-center text-xs font-black text-white">
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
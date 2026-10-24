import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = { className?: string };

/** Un mismo regreso al dashboard de clientes para los módulos comerciales. */
export default function BotonVolverPanel({ className = "" }: Props) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      title="Volver al panel de clientes"
      aria-label="Volver al panel de clientes"
      onClick={() => navigate("/clientes/dashboard")}
      className={`grid h-[37px] w-[37px] shrink-0 place-items-center rounded-[11px] border border-white/20 bg-white/[0.07] text-white transition-colors hover:border-amber-400/60 hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${className}`}
    >
      <ArrowLeft size={18} aria-hidden="true" />
    </button>
  );
}

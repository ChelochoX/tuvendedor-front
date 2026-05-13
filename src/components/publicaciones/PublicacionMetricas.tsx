type Props = {
  cantidadFavoritos?: number;
  cantidadVistas?: number;
  cantidadClicksWhatsapp?: number;
};

export default function PublicacionMetricas({
  cantidadFavoritos = 0,
  cantidadVistas = 0,
  cantidadClicksWhatsapp = 0,
}: Props) {
  const itemClass =
    "flex items-center justify-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-gray-700 shadow-sm ring-1 ring-gray-100";

  return (
    <div className="mt-3 grid grid-cols-3 gap-1">
      <span className={itemClass}>
        <span className="text-red-500">❤️</span>
        <span>{cantidadFavoritos}</span>
        <span className="hidden sm:inline">favoritos</span>
      </span>

      <span className={itemClass}>
        <span>👁️</span>
        <span>{cantidadVistas}</span>
        <span className="hidden sm:inline">vistas</span>
      </span>

      <span className={itemClass}>
        <span>📲</span>
        <span>{cantidadClicksWhatsapp}</span>
        <span className="hidden sm:inline">WhatsApp</span>
      </span>
    </div>
  );
}
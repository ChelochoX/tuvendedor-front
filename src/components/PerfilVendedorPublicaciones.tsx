import React from "react";
import { Eye, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PerfilPublicoPublicacion } from "../types/perfilVendedor.types";

interface Props {
  publicaciones: PerfilPublicoPublicacion[];
}

const formatearPrecio = (precio: number, categoria: string) => {
  const esDolar =
    categoria.toLowerCase().includes("casa") ||
    categoria.toLowerCase().includes("departamento");

  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: esDolar ? "USD" : "PYG",
    maximumFractionDigits: 0,
  }).format(precio);
};

const PerfilVendedorPublicaciones: React.FC<Props> = ({ publicaciones }) => {
  const navigate = useNavigate();

  if (!publicaciones.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-gray-900 p-8 text-center text-gray-300">
        Este vendedor todavía no tiene publicaciones activas.
      </div>
    );
  }

  return (
    <section id="catalogo" className="px-5 py-8 sm:px-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white">
            Productos destacados
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Una vista rápida del catálogo del vendedor.
          </p>
        </div>

        <div className="flex gap-2">
          <span className="rounded-full border border-yellow-400/50 px-4 py-2 text-xs font-semibold text-yellow-300">
            Destacados
          </span>
          <span className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300">
            Todos
          </span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {publicaciones.map((item) => (
          <article
            key={item.id}
            className="group overflow-hidden rounded-3xl border border-white/10 bg-gray-900 shadow-xl transition hover:-translate-y-1 hover:border-yellow-400/40"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={
                  item.thumbUrl ||
                  item.imagenPrincipal ||
                  "https://images.unsplash.com/photo-1560518883-ce09059eeffa"
                }
                alt={item.titulo}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {item.esDestacada && (
                <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
                  <Star size={13} />
                  Destacado
                </span>
              )}

              <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {item.categoria}
              </span>
            </div>

            <div className="p-4">
              <h3 className="line-clamp-1 text-lg font-bold text-white">
                {item.titulo}
              </h3>

              <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                {item.descripcion}
              </p>

              <p className="mt-2 text-xs text-gray-500">{item.ubicacion}</p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-lg font-extrabold text-yellow-300">
                  {formatearPrecio(item.precio, item.categoria)}
                </p>

                <button
                  onClick={() => navigate(`/producto/${item.id}`)}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-400 hover:text-black"
                >
                  <Eye size={15} />
                  Ver más
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PerfilVendedorPublicaciones;

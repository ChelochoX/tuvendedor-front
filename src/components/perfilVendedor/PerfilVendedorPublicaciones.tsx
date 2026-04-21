import React, { useMemo, useState } from "react";
import { Eye, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PerfilPublicoPublicacion } from "../types/perfilVendedor.types";

interface Props {
  publicaciones: PerfilPublicoPublicacion[];
}

const categoriasBaseInmuebles = [
  "Terrenos",
  "Casas",
  "Departamentos",
  "Dúplex",
  "Salones",
  "Locales",
  "Oficinas",
  "Quintas",
  "Lotes",
  "Depósitos",
  "Tinglados",
  "Campos",
  "Alquileres",
  "Locales comerciales",
  "Propiedades en pozo",
  "Inversiones",
  "Monoambientes",
  "Habitaciones",
  "Garajes",
];

const formatearPrecio = (precio: number, categoria: string) => {
  const categoriaNormalizada = categoria?.toLowerCase() || "";

  const esDolar =
    categoriaNormalizada.includes("casa") ||
    categoriaNormalizada.includes("departamento") ||
    categoriaNormalizada.includes("dúplex") ||
    categoriaNormalizada.includes("duplex") ||
    categoriaNormalizada.includes("inmueble") ||
    categoriaNormalizada.includes("local") ||
    categoriaNormalizada.includes("oficina") ||
    categoriaNormalizada.includes("quinta") ||
    categoriaNormalizada.includes("campo") ||
    categoriaNormalizada.includes("inversión") ||
    categoriaNormalizada.includes("inversion");

  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: esDolar ? "USD" : "PYG",
    maximumFractionDigits: 0,
  }).format(precio);
};

const normalizar = (valor: string) => valor.trim().toLowerCase();

const PerfilVendedorPublicaciones: React.FC<Props> = ({ publicaciones }) => {
  const navigate = useNavigate();
  const [categoriaActiva, setCategoriaActiva] = useState<string>("Todos");

  const categorias = useMemo(() => {
    const categoriasReales = publicaciones
      .map((item) => item.categoria?.trim())
      .filter((categoria): categoria is string => Boolean(categoria));

    const mezcladas = [...categoriasReales, ...categoriasBaseInmuebles];

    const unicas = mezcladas.filter(
      (categoria, index, array) =>
        array.findIndex((x) => normalizar(x) === normalizar(categoria)) ===
        index,
    );

    return ["Todos", ...unicas];
  }, [publicaciones]);

  const publicacionesFiltradas = useMemo(() => {
    if (categoriaActiva === "Todos") return publicaciones;

    return publicaciones.filter(
      (item) =>
        normalizar(item.categoria || "") === normalizar(categoriaActiva),
    );
  }, [categoriaActiva, publicaciones]);

  const cantidadPorCategoria = (categoria: string) => {
    if (categoria === "Todos") return publicaciones.length;

    return publicaciones.filter(
      (item) => normalizar(item.categoria || "") === normalizar(categoria),
    ).length;
  };

  if (!publicaciones.length) {
    return (
      <section id="catalogo" className="px-5 pt-4 pb-10 sm:px-8 sm:pt-5">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-gray-900 p-8 text-center text-gray-300">
          <h2 className="text-xl font-bold text-white">
            Todavía no hay publicaciones activas
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Cuando este vendedor cargue productos, aparecerán en esta vitrina.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="catalogo" className="px-5 pt-4 pb-10 sm:px-8 sm:pt-4 lg:pt-2">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Productos disponibles
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Filtrá las publicaciones por tipo de producto.
          </p>
        </div>

        {/* Chips de categorías visibles, sin scroll */}
        <div className="mb-7 flex flex-wrap gap-2">
          {categorias.map((categoria) => {
            const activo = categoriaActiva === categoria;
            const cantidad = cantidadPorCategoria(categoria);
            const sinPublicaciones = cantidad === 0;

            return (
              <button
                key={categoria}
                onClick={() => setCategoriaActiva(categoria)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold transition-all sm:text-sm ${
                  activo
                    ? "border-yellow-400 bg-yellow-400 text-black shadow-lg"
                    : sinPublicaciones
                      ? "border-white/5 bg-white/[0.03] text-gray-500 hover:border-yellow-400/30 hover:bg-yellow-400/5 hover:text-yellow-300"
                      : "border-white/10 bg-white/5 text-gray-300 hover:border-yellow-400/60 hover:bg-yellow-400/10 hover:text-yellow-300"
                }`}
              >
                <span className="whitespace-nowrap">{categoria}</span>

                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                    activo
                      ? "bg-black/15 text-black"
                      : sinPublicaciones
                        ? "bg-white/5 text-gray-600"
                        : "bg-white/10 text-gray-400"
                  }`}
                >
                  {cantidad}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {publicacionesFiltradas.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-gray-900 shadow-xl transition hover:-translate-y-1 hover:border-yellow-400/40"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={
                    item.thumbUrl ||
                    item.imagenPrincipal ||
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa"
                  }
                  alt={item.titulo}
                  className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                {item.esDestacada && (
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-xs font-extrabold text-black shadow-lg">
                    <Star size={13} />
                    Destacado
                  </span>
                )}

                {item.categoria && (
                  <span className="absolute right-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    {item.categoria}
                  </span>
                )}
              </div>

              <div className="p-4">
                <h3 className="line-clamp-1 text-lg font-extrabold text-white">
                  {item.titulo}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-400">
                  {item.descripcion}
                </p>

                {item.ubicacion && (
                  <p className="mt-2 text-xs font-semibold text-gray-500">
                    {item.ubicacion}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-lg font-black text-yellow-300">
                    {formatearPrecio(item.precio, item.categoria)}
                  </p>

                  <button
                    onClick={() => navigate(`/producto/${item.id}`)}
                    className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-yellow-400 hover:text-black"
                  >
                    <Eye size={15} />
                    Ver más
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!publicacionesFiltradas.length && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-gray-900 p-8 text-center">
            <h3 className="text-lg font-bold text-white">
              No hay publicaciones en esta categoría
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              Este vendedor todavía no tiene publicaciones cargadas en{" "}
              <span className="font-bold text-yellow-300">
                {categoriaActiva}
              </span>
              .
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PerfilVendedorPublicaciones;

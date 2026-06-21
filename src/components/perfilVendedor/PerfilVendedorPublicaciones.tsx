import React, { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Filter,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
} from "lucide-react";

import { PublicacionPerfilVendedor } from "../../types/perfilVendedor.types";
import { Producto } from "../../types/producto";
import FavoritoButton from "../publicaciones/FavoritoButton";
import VitrinaMedia from "./VitrinaMedia";

interface Props {
  publicaciones?: PublicacionPerfilVendedor[];
  onVerDetalle?: (publicacion: PublicacionPerfilVendedor) => void;
}

const normalizarTexto = (valor?: string | null): string => {
  return (valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const CATEGORIA_TODOS = "Todos";
const CATEGORIA_SIN_DEFINIR = "Sin categoría";

const obtenerCategoriaVisible = (categoria?: string | null): string => {
  return categoria?.trim() || CATEGORIA_SIN_DEFINIR;
};

const perteneceACategoria = (
  publicacion: PublicacionPerfilVendedor,
  categoriaActiva: string,
): boolean => {
  if (categoriaActiva === CATEGORIA_TODOS) return true;

  return (
    normalizarTexto(obtenerCategoriaVisible(publicacion.categoria)) ===
    normalizarTexto(categoriaActiva)
  );
};

const formatearPrecio = (
  precio?: number | null,
  moneda?: string | null,
): string => {
  if (!precio || precio <= 0) return "Consultar precio";

  const monedaNormalizada = moneda?.trim().toUpperCase() || "PYG";

  if (monedaNormalizada === "USD") {
    return `USD ${Number(precio).toLocaleString("es-PY", {
      maximumFractionDigits: 0,
    })}`;
  }

  return `Gs. ${Number(precio).toLocaleString("es-PY", {
    maximumFractionDigits: 0,
  })}`;
};

const obtenerUrlImagen = (item: PublicacionPerfilVendedor): string => {
  const anyItem = item as any;

  return (
    item.imagenPrincipal ||
    item.thumbUrl ||
    anyItem.imagenes?.[0]?.thumbUrl ||
    anyItem.imagenes?.[0]?.mainUrl ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=900"
  );
};

const obtenerMediaPrincipal = (item: PublicacionPerfilVendedor): any => {
  const anyItem = item as any;

  return (
    item.imagenPrincipal ||
    item.thumbUrl ||
    anyItem.imagenes?.[0] ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=900"
  );
};

const adaptarProductoFavorito = (item: PublicacionPerfilVendedor): Producto => {
  const anyItem = item as any;
  const imagen = obtenerUrlImagen(item);

  const imagenes =
    Array.isArray(anyItem.imagenes) && anyItem.imagenes.length > 0
      ? anyItem.imagenes
      : [
          {
            mainUrl: item.imagenPrincipal || imagen,
            thumbUrl: item.thumbUrl || imagen,
          },
        ];

  return {
    id: item.id,
    nombre: item.titulo || "Publicación disponible",
    precio: item.precio ?? 0,
    moneda: item.moneda ?? "PYG",
    categoria: item.categoria || "",
    ubicacion: item.ubicacion || "",
    descripcion: item.descripcion || "",
    estado: anyItem.estado || "Activo",

    vendedor: {
      nombre: "Tu Vendedor",
      avatar: "",
      telefono: "",
    },

    imagenes,

    esDestacada: item.esDestacada,
    esFavorito: anyItem.esFavorito ?? false,
    cantidadFavoritos: Number(anyItem.cantidadFavoritos ?? 0),
    cantidadVistas: Number(anyItem.cantidadVistas ?? 0),
    cantidadClicksWhatsapp: Number(anyItem.cantidadClicksWhatsapp ?? 0),
  } as Producto;
};

const obtenerEtiquetaRubro = (item: PublicacionPerfilVendedor): string => {
  const texto = normalizarTexto(`${item.categoria || ""} ${item.titulo || ""}`);

  if (
    ["moto", "vehiculo", "auto", "camioneta"].some((p) => texto.includes(p))
  ) {
    return "Ficha vehicular";
  }

  if (
    ["inmueble", "casa", "terreno", "departamento", "duplex", "dúplex"].some(
      (p) => texto.includes(p),
    )
  ) {
    return "Ficha inmobiliaria";
  }

  if (
    ["pan", "torta", "comida", "bebida", "minimercado", "despensa"].some((p) =>
      texto.includes(p),
    )
  ) {
    return "Pedido rápido";
  }

  if (
    ["software", "servicio", "desarrollo", "sistema", "diseño", "diseno"].some(
      (p) => texto.includes(p),
    )
  ) {
    return "Cotización";
  }

  return "Producto premium";
};

const PerfilVendedorPublicaciones: React.FC<Props> = ({
  publicaciones = [],
  onVerDetalle,
}) => {
  const [categoriaActiva, setCategoriaActiva] = useState(CATEGORIA_TODOS);
  const [busqueda, setBusqueda] = useState("");

  const categorias = useMemo(() => {
    const conteos = new Map<
      string,
      {
        nombre: string;
        cantidad: number;
      }
    >();

    publicaciones.forEach((publicacion) => {
      const nombre = obtenerCategoriaVisible(publicacion.categoria);
      const clave = normalizarTexto(nombre);

      const categoriaExistente = conteos.get(clave);

      if (categoriaExistente) {
        categoriaExistente.cantidad += 1;
        return;
      }

      conteos.set(clave, {
        nombre,
        cantidad: 1,
      });
    });

    const categoriasDelNegocio = Array.from(conteos.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es"),
    );

    return [
      {
        nombre: CATEGORIA_TODOS,
        cantidad: publicaciones.length,
      },
      ...categoriasDelNegocio,
    ];
  }, [publicaciones]);

  const mostrarFiltroCategorias = categorias.length > 2;

  useEffect(() => {
    const categoriaSigueDisponible = categorias.some(
      (categoria) =>
        normalizarTexto(categoria.nombre) === normalizarTexto(categoriaActiva),
    );

    if (!categoriaSigueDisponible) {
      setCategoriaActiva(CATEGORIA_TODOS);
    }
  }, [categorias, categoriaActiva]);

  const publicacionesFiltradas = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    return publicaciones.filter((item) => {
      const coincideCategoria = perteneceACategoria(item, categoriaActiva);

      const coincideBusqueda =
        !texto ||
        normalizarTexto(item.titulo).includes(texto) ||
        normalizarTexto(item.descripcion).includes(texto) ||
        normalizarTexto(item.categoria).includes(texto) ||
        normalizarTexto(item.ubicacion).includes(texto);

      return coincideCategoria && coincideBusqueda;
    });
  }, [busqueda, categoriaActiva, publicaciones]);

  const totalDestacadas = publicaciones.filter((p) => p.esDestacada).length;

  if (!publicaciones.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <p className="text-xl font-black text-white">
            Esta vitrina todavía no tiene publicaciones activas.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Cuando el negocio cargue publicaciones, aparecerán en esta sección.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.07),transparent_55%)]" />

      <div className="mb-6 rounded-[28px] border border-white/10 bg-[#0b111c]/80 p-4 shadow-2xl shadow-black/25 backdrop-blur md:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-yellow-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-wide text-yellow-300 ring-1 ring-yellow-400/20">
              <SlidersHorizontal size={14} />
              Catálogo premium
            </p>

            <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
              Publicaciones disponibles
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
              Explorá esta vitrina por categoría, buscá rápido y abrí cada ficha
              con una presentación adaptada al rubro del producto.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center lg:min-w-[420px]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <PackageCheck className="mx-auto text-yellow-300" size={18} />
              <p className="mt-1 text-lg font-black text-white">
                {publicaciones.length}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                Publicaciones
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <Star className="mx-auto text-yellow-300" size={18} />
              <p className="mt-1 text-lg font-black text-white">
                {totalDestacadas}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                Destacadas
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <ShieldCheck className="mx-auto text-green-300" size={18} />
              <p className="mt-1 text-lg font-black text-white">Directo</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                Contacto
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por nombre, categoría o ubicación..."
              className="w-full rounded-2xl border border-yellow-400/25 bg-black/25 py-3 pl-11 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400 focus:bg-black/35"
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-gray-300">
            <Filter size={17} className="text-yellow-300" />
            {categoriaActiva}
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-gray-300">
            <Sparkles size={17} className="text-yellow-300" />
            Más recientes
          </div>
        </div>
      </div>

      {mostrarFiltroCategorias && (
        <div className="tv-scroll mb-7 flex gap-2 overflow-x-auto pb-1">
          {categorias.map((categoria) => {
            const activo = categoriaActiva === categoria.nombre;

            return (
              <button
                key={categoria.nombre}
                type="button"
                onClick={() => setCategoriaActiva(categoria.nombre)}
                className={[
                  "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition",
                  activo
                    ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                    : "border border-white/10 bg-white/[0.05] text-gray-300 hover:bg-white/[0.09] hover:text-white",
                ].join(" ")}
              >
                {categoria.nombre}

                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[10px]",
                    activo ? "bg-black/15" : "bg-black/30 text-gray-400",
                  ].join(" ")}
                >
                  {categoria.cantidad}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {!publicacionesFiltradas.length ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <p className="font-black text-white">No encontramos publicaciones.</p>
          <p className="mt-2 text-sm text-gray-400">
            Probá con otra categoría o cambiá el texto de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {publicacionesFiltradas.map((item) => {
            const mediaPrincipal = obtenerMediaPrincipal(item);
            const productoFavorito = adaptarProductoFavorito(item);
            const etiquetaRubro = obtenerEtiquetaRubro(item);

            return (
              <article
                key={item.id}
                onClick={() => onVerDetalle?.(item)}
                className="group cursor-pointer overflow-hidden rounded-[26px] border border-white/10 bg-[#101722] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/40 hover:shadow-yellow-400/10"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-black">
                  <VitrinaMedia
                    media={mediaPrincipal}
                    alt={item.titulo}
                    className="h-full w-full transition duration-500 group-hover:scale-105"
                    objectFit="cover"
                    controls={false}
                    showVideoBadge
                    showPlayIcon
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    {item.esDestacada && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-[11px] font-black text-black">
                        <Star size={12} fill="currentColor" />
                        Promo
                      </span>
                    )}

                    <span className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[11px] font-black text-white backdrop-blur">
                      {etiquetaRubro}
                    </span>
                  </div>

                  {item.categoria && (
                    <span className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-black text-white ring-1 ring-white/10">
                      {item.categoria}
                    </span>
                  )}

                  <FavoritoButton
                    producto={productoFavorito}
                    mostrarCantidad
                    className="absolute bottom-3 right-3"
                  />
                </div>

                <div className="flex min-h-[218px] flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-[17px] font-black leading-tight text-white">
                      {item.titulo}
                    </h3>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-400">
                    {item.descripcion ||
                      "Publicación disponible en esta vitrina."}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-gray-400">
                    {item.ubicacion && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2.5 py-1 ring-1 ring-white/10">
                        <MapPin size={13} className="text-yellow-300" />
                        {item.ubicacion}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2.5 py-1 ring-1 ring-white/10">
                      <Store size={13} className="text-green-300" />
                      Contacto directo
                    </span>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                        Precio
                      </p>
                      <p className="mt-1 text-[21px] font-black leading-none text-yellow-300">
                        {formatearPrecio(item.precio, item.moneda)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onVerDetalle?.(item);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-yellow-400 hover:text-black"
                    >
                      <Eye size={15} />
                      Ver ficha
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PerfilVendedorPublicaciones;

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CategoriaPublicacionOption,
  CrearPublicacionForm,
} from "../../../types/publicacion.types";

interface Props {
  form: CrearPublicacionForm;
  categorias: CategoriaPublicacionOption[];
  esInmobiliario: boolean;
  vendedorOfreceDelivery?: boolean;
  onCampo: <K extends keyof CrearPublicacionForm>(
    campo: K,
    valor: CrearPublicacionForm[K],
  ) => void;
  onPrecio: (valor: string) => void;
}

const normalizarTexto = (valor?: string | null): string => {
  return (valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const esCategoriaVehiculoOInmueble = (valor?: string | null): boolean => {
  const texto = normalizarTexto(valor);

  return [
    "moto",
    "motos",
    "vehiculo",
    "vehículos",
    "vehiculos",
    "auto",
    "autos",
    "camioneta",
    "inmueble",
    "inmuebles",
    "casa",
    "casas",
    "terreno",
    "terrenos",
    "departamento",
    "departamentos",
    "duplex",
    "dúplex",
    "propiedad",
    "propiedades",
    "alquiler",
  ].some((palabra) => texto.includes(palabra));
};

const categoriaPuedeTenerDelivery = (valor?: string | null): boolean => {
  const texto = normalizarTexto(valor);

  if (!texto) return false;
  if (esCategoriaVehiculoOInmueble(texto)) return false;

  return [
    "bebida",
    "bebidas",
    "despensa",
    "almacen",
    "almacén",
    "minimercado",
    "supermercado",
    "bodega",
    "panaderia",
    "panadería",
    "confiteria",
    "confitería",
    "rotiseria",
    "rotisería",
    "comida",
    "comidas",
    "alimento",
    "alimentos",
    "heladeria",
    "heladería",
    "farmacia",
    "ferreteria",
    "ferretería",
    "herramienta",
    "herramientas",
    "ropa",
    "calzado",
    "calzados",
    "moda",
    "accesorio",
    "accesorios",
    "electronica",
    "electrónica",
    "celular",
    "celulares",
    "informatica",
    "informática",
    "hogar",
    "mueble",
    "muebles",
    "mascota",
    "mascotas",
    "libreria",
    "librería",
    "oficina",
    "artesania",
    "artesanía",
    "artesanias",
    "artesanías",
    "emprendedores",
    "producto",
    "productos",
  ].some((palabra) => texto.includes(palabra));
};

const PublicacionDatosBasicos: React.FC<Props> = ({
  form,
  categorias,
  esInmobiliario,
  vendedorOfreceDelivery = false,
  onCampo,
  onPrecio,
}) => {
  const [categoriaAbierta, setCategoriaAbierta] = useState(false);
  const [categoriaBusqueda, setCategoriaBusqueda] = useState("");

  const categoriaRef = useRef<HTMLDivElement | null>(null);
  const categoriaBusquedaRef = useRef<HTMLInputElement | null>(null);

  const categoriaSeleccionada = useMemo(
    () => categorias.find((categoria) => categoria.nombre === form.categoria),
    [categorias, form.categoria],
  );

  const categoriasFiltradas = useMemo(() => {
    const busqueda = normalizarTexto(categoriaBusqueda);

    if (!busqueda) return categorias;

    return categorias.filter((categoria) => {
      return normalizarTexto(categoria.nombre).includes(busqueda);
    });
  }, [categorias, categoriaBusqueda]);

  const categoriaSoportaDelivery = categoriaPuedeTenerDelivery(form.categoria);
  const puedeMostrarDelivery =
    vendedorOfreceDelivery && categoriaSoportaDelivery;

  useEffect(() => {
    if (!puedeMostrarDelivery && form.permiteDelivery) {
      onCampo("permiteDelivery", false);
    }
  }, [puedeMostrarDelivery, form.permiteDelivery, onCampo]);

  useEffect(() => {
    if (!categoriaAbierta) return;

    const cerrarSiClickAfuera = (event: MouseEvent | TouchEvent) => {
      if (
        categoriaRef.current &&
        !categoriaRef.current.contains(event.target as Node)
      ) {
        setCategoriaAbierta(false);
      }
    };

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCategoriaAbierta(false);
      }
    };

    document.addEventListener("mousedown", cerrarSiClickAfuera);
    document.addEventListener("touchstart", cerrarSiClickAfuera);
    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.removeEventListener("mousedown", cerrarSiClickAfuera);
      document.removeEventListener("touchstart", cerrarSiClickAfuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [categoriaAbierta]);

  useEffect(() => {
    if (!categoriaAbierta) {
      setCategoriaBusqueda("");
      return;
    }

    const timer = window.setTimeout(() => {
      categoriaBusquedaRef.current?.focus();
    }, 80);

    return () => {
      window.clearTimeout(timer);
    };
  }, [categoriaAbierta]);

  const seleccionarCategoria = (nombre: string) => {
    onCampo("categoria", nombre);

    if (!categoriaPuedeTenerDelivery(nombre)) {
      onCampo("permiteDelivery", false);
    }

    setCategoriaBusqueda("");
    setCategoriaAbierta(false);
  };

  const abrirCerrarCategorias = () => {
    setCategoriaAbierta((actual) => !actual);
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-lg font-black text-yellow-300">
          Datos principales
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Información básica para que el producto se entienda rápido.
        </p>
      </div>

      <div className="grid gap-3">
        <input
          value={form.titulo}
          onChange={(e) => onCampo("titulo", e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-[#070b13] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/70 focus:bg-black"
          placeholder={
            esInmobiliario
              ? "Ej: Casa familiar en zona residencial"
              : "Título del producto"
          }
        />

        <textarea
          value={form.descripcion}
          onChange={(e) => onCampo("descripcion", e.target.value)}
          rows={4}
          className="w-full resize-none rounded-2xl border border-white/10 bg-[#070b13] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/70 focus:bg-black"
          placeholder={
            esInmobiliario
              ? "Describí la propiedad, ubicación, ventajas y detalles importantes..."
              : "Descripción clara del producto, estado, beneficios o detalles importantes..."
          }
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={form.precio}
            onChange={(e) => onPrecio(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#070b13] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/70 focus:bg-black"
            placeholder="Precio"
          />

          <div ref={categoriaRef} className="relative">
            <button
              type="button"
              onClick={abrirCerrarCategorias}
              aria-haspopup="listbox"
              aria-expanded={categoriaAbierta}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border bg-[#070b13] px-4 py-3 text-left text-white outline-none transition ${
                categoriaAbierta
                  ? "border-yellow-400/80 bg-black shadow-[0_0_0_3px_rgba(250,204,21,0.08)]"
                  : "border-white/10 hover:border-yellow-400/45"
              }`}
            >
              <span
                className={`min-w-0 truncate ${
                  categoriaSeleccionada ? "text-white" : "text-gray-400"
                }`}
              >
                {categoriaSeleccionada ? (
                  <>
                    {categoriaSeleccionada.icono && (
                      <span className="mr-2">
                        {categoriaSeleccionada.icono}
                      </span>
                    )}
                    {categoriaSeleccionada.nombre}
                  </>
                ) : (
                  "Seleccioná una categoría"
                )}
              </span>

              <span
                className={`shrink-0 text-yellow-300 transition-transform ${
                  categoriaAbierta ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>

            {categoriaAbierta && (
              <div className="absolute left-0 right-0 top-full z-[90] mt-2 overflow-hidden rounded-2xl border border-yellow-400/30 bg-[#05070b] shadow-[0_18px_45px_rgba(0,0,0,0.55)]">
                <div className="border-b border-white/10 p-2">
                  <input
                    ref={categoriaBusquedaRef}
                    value={categoriaBusqueda}
                    onChange={(e) => setCategoriaBusqueda(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && categoriasFiltradas.length > 0) {
                        e.preventDefault();
                        seleccionarCategoria(categoriasFiltradas[0].nombre);
                      }
                    }}
                    className="w-full rounded-xl border border-white/10 bg-[#070b13] px-3 py-2 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/70 focus:bg-black"
                    placeholder="Buscar categoría..."
                  />
                </div>

                <div
                  role="listbox"
                  className="tv-categoria-scroll max-h-[260px] overflow-y-auto p-1.5"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={!form.categoria}
                    onClick={() => seleccionarCategoria("")}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                      !form.categoria
                        ? "bg-yellow-400 text-black font-bold"
                        : "text-gray-300 hover:bg-yellow-400/10 hover:text-yellow-200"
                    }`}
                  >
                    <span>✨</span>
                    <span className="truncate">Seleccioná una categoría</span>
                  </button>

                  {categoriasFiltradas.length > 0 ? (
                    categoriasFiltradas.map((categoria) => {
                      const activa = categoria.nombre === form.categoria;

                      return (
                        <button
                          key={categoria.nombre}
                          type="button"
                          role="option"
                          aria-selected={activa}
                          onClick={() => seleccionarCategoria(categoria.nombre)}
                          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                            activa
                              ? "bg-yellow-400 text-black font-bold"
                              : "text-white hover:bg-yellow-400/10 hover:text-yellow-200"
                          }`}
                        >
                          <span className="w-5 shrink-0 text-base">
                            {categoria.icono || "📦"}
                          </span>
                          <span className="min-w-0 truncate">
                            {categoria.nombre}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-3 py-4 text-center text-xs leading-5 text-gray-400">
                      No encontramos categorías con ese texto.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <input
          value={form.ubicacion}
          onChange={(e) => onCampo("ubicacion", e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-[#070b13] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/70 focus:bg-black"
          placeholder={
            esInmobiliario ? "Ciudad, barrio o zona" : "Ubicación visible"
          }
        />

        {puedeMostrarDelivery && (
          <button
            type="button"
            onClick={() => onCampo("permiteDelivery", !form.permiteDelivery)}
            className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
              form.permiteDelivery
                ? "border-green-400/40 bg-green-500/15"
                : "border-white/10 bg-white/[0.04] hover:border-green-400/30 hover:bg-green-500/10"
            }`}
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                form.permiteDelivery
                  ? "border-green-300 bg-green-400 text-black"
                  : "border-white/25 bg-black/20"
              }`}
            >
              {form.permiteDelivery ? "✓" : ""}
            </span>

            <span>
              <span className="block text-sm font-black text-white">
                🛵 Este producto se puede enviar por delivery
              </span>
              <span className="mt-1 block text-xs leading-5 text-gray-400">
                En la vitrina aparecerá como “Enviar por delivery”. El cliente
                podrá compartir su ubicación o escribir su dirección por
                WhatsApp.
              </span>
            </span>
          </button>
        )}

        {!vendedorOfreceDelivery && form.categoria && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-5 text-gray-500">
            Para ofrecer delivery en productos, primero activá “Mi negocio
            ofrece delivery” desde el perfil de tu vitrina.
          </div>
        )}

        {vendedorOfreceDelivery &&
          !categoriaSoportaDelivery &&
          form.categoria && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-5 text-gray-500">
              Para esta categoría no se habilita delivery desde Tu Vendedor.
            </div>
          )}
      </div>
    </section>
  );
};

export default PublicacionDatosBasicos;

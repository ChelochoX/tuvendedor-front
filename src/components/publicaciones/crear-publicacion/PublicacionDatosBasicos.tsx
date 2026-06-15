import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CategoriaPublicacionOption,
  CrearPublicacionForm,
} from "../../../types/publicacion.types";

interface Props {
  form: CrearPublicacionForm;
  categorias: CategoriaPublicacionOption[];
  esInmobiliario: boolean;
  onCampo: <K extends keyof CrearPublicacionForm>(
    campo: K,
    valor: CrearPublicacionForm[K],
  ) => void;
  onPrecio: (valor: string) => void;
}

const PublicacionDatosBasicos: React.FC<Props> = ({
  form,
  categorias,
  esInmobiliario,
  onCampo,
  onPrecio,
}) => {
  const [categoriaAbierta, setCategoriaAbierta] = useState(false);
  const categoriaRef = useRef<HTMLDivElement | null>(null);

  const categoriaSeleccionada = useMemo(
    () => categorias.find((categoria) => categoria.nombre === form.categoria),
    [categorias, form.categoria],
  );

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

  const seleccionarCategoria = (nombre: string) => {
    onCampo("categoria", nombre);
    setCategoriaAbierta(false);
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
              onClick={() => setCategoriaAbierta((actual) => !actual)}
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

                  {categorias.map((categoria) => {
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
                  })}
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
      </div>
    </section>
  );
};

export default PublicacionDatosBasicos;

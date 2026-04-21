import React from "react";
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

          <select
            value={form.categoria}
            onChange={(e) => onCampo("categoria", e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#070b13] px-4 py-3 text-white outline-none transition focus:border-yellow-400/70 focus:bg-black"
          >
            <option value="">Seleccioná una categoría</option>

            {categorias.map((categoria) => (
              <option key={categoria.nombre} value={categoria.nombre}>
                {categoria.icono ? `${categoria.icono} ` : ""}
                {categoria.nombre}
              </option>
            ))}
          </select>
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

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
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h3 className="mb-4 text-lg font-bold text-yellow-300">
        Datos principales
      </h3>

      <div className="grid gap-4">
        <input
          value={form.titulo}
          onChange={(e) => onCampo("titulo", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
          placeholder={
            esInmobiliario ? "Ej: Terreno en Valle Pucú" : "Título del producto"
          }
        />

        <textarea
          value={form.descripcion}
          onChange={(e) => onCampo("descripcion", e.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
          placeholder={
            esInmobiliario
              ? "Describí la propiedad, ubicación, ventajas y detalles importantes..."
              : "Descripción detallada"
          }
        />

        <input
          value={form.precio}
          onChange={(e) => onPrecio(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
          placeholder="Precio"
        />

        <select
          value={form.categoria}
          onChange={(e) => onCampo("categoria", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
        >
          <option value="">Seleccioná una categoría</option>

          {categorias.map((categoria) => (
            <option key={categoria.nombre} value={categoria.nombre}>
              {categoria.icono ? `${categoria.icono} ` : ""}
              {categoria.nombre}
            </option>
          ))}
        </select>

        <input
          value={form.ubicacion}
          onChange={(e) => onCampo("ubicacion", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
          placeholder={
            esInmobiliario ? "Ciudad, barrio o zona" : "Ubicación visible"
          }
        />
      </div>
    </section>
  );
};

export default PublicacionDatosBasicos;

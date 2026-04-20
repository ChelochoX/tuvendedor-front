import React from "react";
import { CrearPublicacionForm } from "../../../types/publicacion.types";

interface Props {
  form: CrearPublicacionForm;
  onCampoInmueble: (
    campo: keyof CrearPublicacionForm["camposInmuebles"],
    valor: string,
  ) => void;
}

const PublicacionCamposInmuebles: React.FC<Props> = ({
  form,
  onCampoInmueble,
}) => {
  const inmueble = form.camposInmuebles;

  return (
    <section className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-yellow-300">
          Detalles inmobiliarios
        </h3>

        <p className="text-sm text-gray-400">
          Estos datos ayudan a cargar mejor una propiedad. Luego podemos
          persistirlos en una tabla propia para búsquedas avanzadas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <select
          value={inmueble.tipoOperacion}
          onChange={(e) => onCampoInmueble("tipoOperacion", e.target.value)}
          className="rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
        >
          <option value="">Operación</option>
          <option value="Venta">Venta</option>
          <option value="Alquiler">Alquiler</option>
          <option value="Venta o alquiler">Venta o alquiler</option>
        </select>

        <select
          value={inmueble.tipoPropiedad}
          onChange={(e) => onCampoInmueble("tipoPropiedad", e.target.value)}
          className="rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
        >
          <option value="">Tipo de propiedad</option>
          <option value="Terreno">Terreno</option>
          <option value="Casa">Casa</option>
          <option value="Departamento">Departamento</option>
          <option value="Dúplex">Dúplex</option>
          <option value="Local comercial">Local comercial</option>
          <option value="Oficina">Oficina</option>
          <option value="Quinta">Quinta</option>
          <option value="Tinglado">Tinglado</option>
          <option value="Campo">Campo</option>
        </select>

        <input
          value={inmueble.barrio}
          onChange={(e) => onCampoInmueble("barrio", e.target.value)}
          className="rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
          placeholder="Barrio / zona"
        />

        <select
          value={inmueble.moneda}
          onChange={(e) => onCampoInmueble("moneda", e.target.value)}
          className="rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
        >
          <option value="PYG">Guaraníes</option>
          <option value="USD">Dólares</option>
        </select>

        <input
          value={inmueble.superficieTerreno}
          onChange={(e) => onCampoInmueble("superficieTerreno", e.target.value)}
          className="rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
          placeholder="Superficie terreno m²"
        />

        <input
          value={inmueble.superficieConstruida}
          onChange={(e) =>
            onCampoInmueble("superficieConstruida", e.target.value)
          }
          className="rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
          placeholder="Superficie construida m²"
        />

        <input
          value={inmueble.dormitorios}
          onChange={(e) => onCampoInmueble("dormitorios", e.target.value)}
          className="rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
          placeholder="Dormitorios"
        />

        <input
          value={inmueble.banos}
          onChange={(e) => onCampoInmueble("banos", e.target.value)}
          className="rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
          placeholder="Baños"
        />

        <input
          value={inmueble.cocheras}
          onChange={(e) => onCampoInmueble("cocheras", e.target.value)}
          className="rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-white outline-none focus:border-yellow-400 md:col-span-2"
          placeholder="Cocheras"
        />
      </div>
    </section>
  );
};

export default PublicacionCamposInmuebles;

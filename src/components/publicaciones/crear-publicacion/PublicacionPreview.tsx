import React from "react";
import { CreditCard } from "lucide-react";
import { CrearPublicacionForm } from "../../../types/publicacion.types";

interface PreviewArchivo {
  archivo: File;
  url: string;
  esVideo: boolean;
}

interface Props {
  form: CrearPublicacionForm;
  previews: PreviewArchivo[];
}

const PublicacionPreview: React.FC<Props> = ({ form, previews }) => {
  const principal = previews[0];

  return (
    <section className="flex h-full min-h-[420px] flex-col rounded-3xl border border-white/10 bg-[#070b13] p-4">
      <h3 className="mb-4 text-lg font-black text-yellow-300">Vista previa</h3>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gray-900 shadow-xl">
        <div className="h-56 bg-gray-800">
          {principal ? (
            principal.esVideo ? (
              <video
                src={principal.url}
                className="h-full w-full object-cover"
                controls
              />
            ) : (
              <img
                src={principal.url}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              Previsualización del producto
            </div>
          )}
        </div>

        <div className="p-4">
          <h4 className="line-clamp-1 text-lg font-extrabold text-white">
            {form.titulo || "Título de la publicación"}
          </h4>

          <p className="mt-2 line-clamp-2 text-sm text-gray-400">
            {form.descripcion || "Descripción breve de la publicación."}
          </p>

          <p className="mt-3 text-xs font-semibold text-gray-500">
            {form.ubicacion || "Ubicación"}
          </p>

          <p className="mt-4 text-xl font-black text-yellow-300">
            {form.precio ? `Gs. ${form.precio}` : "Gs. 0"}
          </p>

          {form.mostrarBotonesCompra && form.planCredito.length > 0 && (
            <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-3">
              <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-yellow-300">
                <CreditCard size={15} />
                Planes disponibles
              </p>

              <div className="space-y-2">
                {form.planCredito.map((plan, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2 text-sm"
                  >
                    <span className="text-gray-300">
                      {plan.cuotas || "0"} cuotas
                    </span>

                    <span className="font-black text-white">
                      Gs. {plan.valorCuota || "0"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-gray-400">
        Esta vista es una aproximación de cómo se verá la publicación.
      </div>
    </section>
  );
};

export default PublicacionPreview;

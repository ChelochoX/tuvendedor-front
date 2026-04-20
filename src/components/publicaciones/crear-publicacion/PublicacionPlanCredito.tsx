import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { CrearPublicacionForm } from "../../../types/publicacion.types";

interface Props {
  form: CrearPublicacionForm;
  onMostrarCompra: (valor: boolean) => void;
  onAgregarPlan: () => void;
  onActualizarPlan: (
    index: number,
    campo: "cuotas" | "valorCuota",
    valor: number,
  ) => void;
  onEliminarPlan: (index: number) => void;
}

const PublicacionPlanCredito: React.FC<Props> = ({
  form,
  onMostrarCompra,
  onAgregarPlan,
  onActualizarPlan,
  onEliminarPlan,
}) => {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={form.mostrarBotonesCompra}
          onChange={(e) => onMostrarCompra(e.target.checked)}
          className="h-5 w-5 accent-yellow-400"
        />

        <span className="font-bold text-white">
          Mostrar botón de compra y plan de crédito
        </span>
      </label>

      {form.mostrarBotonesCompra && (
        <div className="mt-4 space-y-3">
          {form.planCredito.map((plan, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl border border-white/10 bg-gray-950 p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <input
                type="number"
                value={plan.cuotas}
                onChange={(e) =>
                  onActualizarPlan(index, "cuotas", Number(e.target.value))
                }
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                placeholder="Cuotas"
              />

              <input
                type="number"
                value={plan.valorCuota}
                onChange={(e) =>
                  onActualizarPlan(index, "valorCuota", Number(e.target.value))
                }
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                placeholder="Valor cuota"
              />

              <button
                type="button"
                onClick={() => onEliminarPlan(index)}
                className="rounded-xl bg-red-500/15 px-4 py-3 text-red-300 hover:bg-red-500 hover:text-white"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={onAgregarPlan}
            className="flex items-center gap-2 rounded-full border border-yellow-400 px-4 py-2 font-bold text-yellow-300 hover:bg-yellow-400 hover:text-black"
          >
            <Plus size={18} />
            Agregar plan
          </button>
        </div>
      )}
    </section>
  );
};

export default PublicacionPlanCredito;

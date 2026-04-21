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
    valor: string,
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
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
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
              className="grid gap-3 rounded-2xl border border-white/10 bg-[#070b13] p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <input
                inputMode="numeric"
                value={plan.cuotas}
                onFocus={() => {
                  if (plan.cuotas === "0") {
                    onActualizarPlan(index, "cuotas", "");
                  }
                }}
                onChange={(e) =>
                  onActualizarPlan(index, "cuotas", e.target.value)
                }
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/70"
                placeholder="Cuotas"
              />

              <input
                inputMode="numeric"
                value={plan.valorCuota}
                onFocus={() => {
                  if (plan.valorCuota === "0") {
                    onActualizarPlan(index, "valorCuota", "");
                  }
                }}
                onChange={(e) =>
                  onActualizarPlan(index, "valorCuota", e.target.value)
                }
                className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400/70"
                placeholder="Valor de cuota"
              />

              <button
                type="button"
                onClick={() => onEliminarPlan(index)}
                className="rounded-xl bg-red-500/15 px-4 py-3 text-red-300 transition hover:bg-red-500 hover:text-white"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={onAgregarPlan}
            className="inline-flex items-center gap-2 rounded-full border border-yellow-400/60 px-4 py-2 text-sm font-bold text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
          >
            <Plus size={17} />
            Agregar plan
          </button>
        </div>
      )}
    </section>
  );
};

export default PublicacionPlanCredito;

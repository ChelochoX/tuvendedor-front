// src/pages/clientes/components/PreciosTable.tsx
import { PrecioBlock, PrecioModelo } from "types/precioProducto";
import { PrecioRow } from "./PrecioRow";
import { AddPromoRow } from "./AddPromoRow";

type Props = {
  precios: PrecioModelo;

  onChange: (
    tipo: "normal" | "promo",
    field: keyof PrecioBlock,
    value: string
  ) => void;

  onGuardar: (tipo: "normal" | "promo") => void;
  onAgregarPromo: () => void;

  onActivar: (id: number) => void;
  onDesactivar: (id: number) => void;
};

export const PreciosTable: React.FC<Props> = ({
  precios,
  onChange,
  onGuardar,
  onAgregarPromo,
  onActivar,
  onDesactivar,
}) => {
  return (
    <div className="overflow-x-auto border border-gray-700 rounded-xl">
      <table className="min-w-[1100px] w-full">
        <thead className="bg-gray-200 text-gray-900 text-xs">
          <tr>
            <th>Tipo</th>
            <th>Público</th>
            <th>Distrib.</th>
            <th>Base</th>
            <th>Entrega</th>
            <th>Cuota</th>
            <th>Interés</th>
            <th>Plan</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <PrecioRow
            tipo="normal"
            block={precios.normal}
            onChange={(f, v) => onChange("normal", f, v)}
            onGuardar={() => onGuardar("normal")}
            onActivar={() =>
              precios.normal.idListaPrecio &&
              onActivar(precios.normal.idListaPrecio)
            }
            onDesactivar={() =>
              precios.normal.idListaPrecio &&
              onDesactivar(precios.normal.idListaPrecio)
            }
          />

          {precios.promo ? (
            <PrecioRow
              tipo="promo"
              block={precios.promo}
              onChange={(f, v) => onChange("promo", f, v)}
              onGuardar={() => onGuardar("promo")}
              onActivar={() =>
                precios.promo?.idListaPrecio &&
                onActivar(precios.promo.idListaPrecio)
              }
              onDesactivar={() =>
                precios.promo?.idListaPrecio &&
                onDesactivar(precios.promo.idListaPrecio)
              }
            />
          ) : (
            <AddPromoRow onAgregarPromo={onAgregarPromo} />
          )}
        </tbody>
      </table>
    </div>
  );
};

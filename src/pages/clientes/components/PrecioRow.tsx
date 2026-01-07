// src/pages/clientes/components/PrecioRow.tsx
import { PrecioBlock } from "types/precioProducto";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckIcon from "@mui/icons-material/Check";

type Props = {
  tipo: "normal" | "promo";
  block: PrecioBlock;

  onChange: (field: keyof PrecioBlock, value: string) => void;
  onGuardar: () => void;

  onActivar?: () => void;
  onDesactivar?: () => void;
};

const money = (v: string) => (v ? Number(v).toLocaleString("es-PY") : "");

export const PrecioRow: React.FC<Props> = ({
  tipo,
  block,
  onChange,
  onGuardar,
  onActivar,
  onDesactivar,
}) => {
  return (
    <tr className="text-sm text-white border-b border-gray-700">
      <td className="px-2 py-2 font-semibold capitalize">{tipo}</td>

      {["precioPublico", "precioDistribuidor", "precioBase"].map((f) => (
        <td key={f} className="px-2 py-1">
          <input
            className="w-full bg-transparent border-b border-gray-600 focus:border-yellow-400 outline-none"
            value={money(block[f as keyof PrecioBlock] as string)}
            onChange={(e) =>
              onChange(
                f as keyof PrecioBlock,
                e.target.value.replace(/\D/g, "")
              )
            }
          />
        </td>
      ))}

      <td className="px-2 py-1">
        <input
          className="w-full bg-transparent border-b border-gray-600"
          value={money(block.entregaInicial)}
          onChange={(e) =>
            onChange("entregaInicial", e.target.value.replace(/\D/g, ""))
          }
        />
      </td>

      <td className="px-2 py-1">
        <input
          className="w-full bg-transparent border-b border-gray-600"
          value={money(block.importeCuota)}
          onChange={(e) =>
            onChange("importeCuota", e.target.value.replace(/\D/g, ""))
          }
        />
      </td>

      <td className="px-2 py-1">
        <input
          className="w-full bg-transparent border-b border-gray-600 focus:border-yellow-400 outline-none"
          value={block.interes ?? ""}
          placeholder="0"
          onChange={(e) => {
            const value = e.target.value
              .replace(",", ".") // permitir coma
              .replace(/[^0-9.]/g, ""); // permitir solo números y punto

            onChange("interes", value);
          }}
        />
      </td>

      <td className="px-2 py-1">
        <input
          className="w-full bg-transparent border-b border-gray-600 focus:border-yellow-400 outline-none"
          value={block.codigoPlan ?? ""}
          placeholder="Ej: C30C"
          onChange={(e) => onChange("codigoPlan", e.target.value.toUpperCase())}
        />
      </td>

      <td className="px-2 py-1">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold
          ${
            block.estado === "Activo"
              ? "bg-green-500 text-black"
              : block.estado === "Inactivo"
              ? "bg-red-500 text-white"
              : "bg-gray-400 text-black"
          }`}
        >
          {block.estado ?? "Nuevo"}
        </span>
      </td>

      <td className="px-2 py-1 flex gap-2 justify-center">
        <button
          onClick={onGuardar}
          title={block.idListaPrecio ? "Editar precio" : "Guardar precio"}
          className={`w-8 h-8 flex items-center justify-center rounded-full
    ${
      block.idListaPrecio
        ? "bg-blue-500 hover:bg-blue-600 text-white"
        : "bg-yellow-400 hover:bg-yellow-500 text-black"
    }`}
        >
          {block.idListaPrecio ? (
            <EditIcon fontSize="small" />
          ) : (
            <CheckIcon fontSize="small" />
          )}
        </button>

        {block.estado === "Activo" && onDesactivar && (
          <button onClick={onDesactivar} title="Inactivar">
            <BlockIcon fontSize="small" />
          </button>
        )}

        {block.estado === "Inactivo" && onActivar && (
          <button onClick={onActivar} title="Activar">
            <CheckIcon fontSize="small" />
          </button>
        )}
      </td>
    </tr>
  );
};

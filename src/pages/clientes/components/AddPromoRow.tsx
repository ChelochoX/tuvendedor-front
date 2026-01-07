// src/pages/clientes/components/AddPromoRow.tsx
type Props = {
  onAgregarPromo: () => void;
};

export const AddPromoRow: React.FC<Props> = ({ onAgregarPromo }) => (
  <tr>
    <td colSpan={10} className="py-3 text-center">
      <button
        onClick={onAgregarPromo}
        className="px-4 py-1 rounded-md border border-yellow-400
        text-yellow-400 hover:bg-yellow-400 hover:text-black transition text-sm"
      >
        + Agregar precio PROMO
      </button>
    </td>
  </tr>
);

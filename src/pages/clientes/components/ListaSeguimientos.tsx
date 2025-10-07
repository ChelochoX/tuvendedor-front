import React from "react";
import { Seguimiento } from "../../../types/clientes";

interface Props {
  seguimientos: Seguimiento[];
}

const ListaSeguimientos: React.FC<Props> = ({ seguimientos }) => {
  if (seguimientos.length === 0) {
    return (
      <p className="text-gray-400">
        No hay seguimientos registrados para este interesado.
      </p>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-yellow-400 mb-3">
        Seguimientos
      </h3>
      <ul className="divide-y divide-gray-700">
        {seguimientos.map((s) => (
          <li key={s.id} className="py-2">
            <p className="text-gray-300">{s.comentario}</p>
            <div className="text-xs text-gray-500 mt-1">
              📅 {new Date(s.fecha).toLocaleDateString()} — 👤{" "}
              {s.usuario || "Sin usuario"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListaSeguimientos;

import React, { useEffect, useState } from "react";
import {
  obtenerInteresados,
  obtenerSeguimientos,
} from "../../api/clientesService";
import { Interesado, Seguimiento } from "../../types/clientes";
import ListaSeguimientos from "./components/ListaSeguimientos";

const ListadoClientes: React.FC = () => {
  const [interesados, setInteresados] = useState<Interesado[]>([]);
  const [seleccionado, setSeleccionado] = useState<Interesado | null>(null);
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);

  useEffect(() => {
    (async () => {
      const { items } = await obtenerInteresados({
        numeroPagina: 1,
        registrosPorPagina: 10,
      });
      setInteresados(items);
    })();
  }, []);

  const handleSeleccionar = async (interesado: Interesado) => {
    setSeleccionado(interesado);
    const data = await obtenerSeguimientos(interesado.id);
    setSeguimientos(data);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Panel izquierdo - lista */}
      <aside className="w-1/3 p-4 border-r border-yellow-400 overflow-y-auto">
        <h2 className="text-yellow-400 text-xl mb-2 font-semibold">
          Interesados
        </h2>
        <ul className="divide-y divide-gray-700">
          {interesados.map((i) => (
            <li
              key={i.id}
              onClick={() => handleSeleccionar(i)}
              className={`p-3 cursor-pointer hover:bg-gray-700 rounded ${
                seleccionado?.id === i.id
                  ? "bg-gray-700 border-l-4 border-yellow-400"
                  : ""
              }`}
            >
              <strong>{i.nombre}</strong> — {i.ciudad || "Sin ciudad"}
            </li>
          ))}
        </ul>
      </aside>

      {/* Panel derecho - detalle */}
      <main className="flex-1 p-6 overflow-auto">
        {seleccionado ? (
          <>
            <h2 className="text-2xl text-yellow-400 mb-3">
              {seleccionado.nombre}
            </h2>
            <p className="text-gray-400 mb-2">
              Producto: {seleccionado.productoInteres || "—"}
            </p>
            <p className="text-gray-400 mb-6">
              Ciudad: {seleccionado.ciudad || "—"}
            </p>

            <ListaSeguimientos seguimientos={seguimientos} />
          </>
        ) : (
          <p className="text-gray-400 italic">
            Selecciona un interesado para ver sus seguimientos
          </p>
        )}
      </main>
    </div>
  );
};

export default ListadoClientes;

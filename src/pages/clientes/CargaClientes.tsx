// src/pages/clientes/GestionClientes.tsx
import React, { useState } from "react";
import ListarInteresados from "./ListarInteresados";
import FormularioInteresado from "./FormularioInteresado";
import { Interesado, Seguimiento } from "../../types/clientes";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GestionClientes: React.FC = () => {
  const navigate = useNavigate();

  const [seleccionado, setSeleccionado] = useState<Interesado | null>(null);
  const [recargarLista, setRecargarLista] = useState(false);

  // 🔹 Agregar estos dos estados
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-gray-900 text-white">
      <ListarInteresados
        seleccionado={seleccionado}
        setSeleccionado={setSeleccionado}
        recargarLista={recargarLista}
        setRecargarLista={setRecargarLista}
      />

      <FormularioInteresado
        seleccionado={seleccionado}
        setSeleccionado={setSeleccionado}
        setRecargarLista={setRecargarLista}
        seguimientos={seguimientos}
        setSeguimientos={setSeguimientos}
      />

      {/* 🔹 Botón Volver */}
      <div className="md:absolute md:bottom-4 md:left-4 md:mb-0 mb-6 flex justify-center md:justify-start">
        <button
          onClick={() => navigate("/clientes")}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-4 rounded-full shadow-md transition-all duration-200"
        >
          <ArrowLeft size={18} />
          <span>Volver al panel</span>
        </button>
      </div>
    </div>
  );
};

export default GestionClientes;

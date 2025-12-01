// src/components/SugerenciaModal.tsx
import React, { useState } from "react";
import ReactDOM from "react-dom";

interface Props {
  abierto: boolean;
  onClose: () => void;
  onEnviar: (comentario: string) => Promise<void>;
}

const SugerenciaModal: React.FC<Props> = ({ abierto, onClose, onEnviar }) => {
  const [comentario, setComentario] = useState("");

  // si está cerrado, no rendereamos nada
  if (!abierto) return null;

  const manejarEnvio = async () => {
    if (!comentario.trim()) {
      // acá no uso Swal para no duplicar mensajes, solo corto
      return;
    }

    // llamamos al callback que ya maneja el SweetAlert en CategoriasPanel
    await onEnviar(comentario);

    // limpiamos textarea y cerramos el modal
    setComentario("");
    onClose();
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      // fondo oscuro bien marcado
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
    >
      <div className="bg-[#1e1e1e] text-white w-full max-w-md rounded-xl p-6 border border-yellow-500 shadow-xl animate-popup relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-300 hover:text-white text-lg"
        >
          ✕
        </button>

        {/* Título */}
        <h2 className="text-xl font-bold text-yellow-400 mb-2 text-center">
          Enviar sugerencia
        </h2>

        <p className="text-sm text-gray-300 mb-4 text-center">
          Tu opinión nos ayuda a mejorar TuVendedor.com.py ✨
        </p>

        {/* Textarea */}
        <textarea
          className="w-full h-32 p-3 bg-[#2a2a2a] rounded-lg border border-gray-600 text-gray-200 
          focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none"
          placeholder="Escribí tu idea, comentario o sugerencia..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />

        {/* Botón enviar */}
        <button
          onClick={manejarEnvio}
          className="mt-4 w-full bg-yellow-400 text-black font-semibold py-2 rounded-lg hover:bg-yellow-300 transition"
        >
          Enviar sugerencia
        </button>
      </div>
    </div>
  );

  // 🔥 Portal: el modal se monta directo en <body>, por eso ya no se “mete” dentro del card
  return ReactDOM.createPortal(modal, document.body);
};

export default SugerenciaModal;

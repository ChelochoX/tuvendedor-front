// src/components/auth/CambiarClaveModal.tsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import { cambiarClave } from "../../api/authService";

interface Props {
  open: boolean;
  onClose: () => void;
}

const CambiarClaveModal: React.FC<Props> = ({ open, onClose }) => {
  const [loginInput, setLoginInput] = useState("");
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [cargando, setCargando] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    const trimmedInput = loginInput.trim();

    if (!trimmedInput) {
      Swal.fire("Atención", "Debes ingresar tu correo o usuario.", "warning");
      return;
    }

    if (nuevaClave.length < 6) {
      Swal.fire(
        "Contraseña demasiado corta",
        "La nueva contraseña debe tener al menos 6 caracteres.",
        "warning"
      );
      return;
    }

    if (nuevaClave !== confirmarClave) {
      Swal.fire("Error", "Las contraseñas no coinciden.", "error");
      return;
    }

    setCargando(true);

    try {
      const payload: any = {
        nuevaClave,
        confirmarClave,
      };

      if (trimmedInput.includes("@")) {
        payload.email = trimmedInput;
      } else {
        payload.usuarioLogin = trimmedInput;
      }

      await cambiarClave(payload);

      Swal.fire({
        icon: "success",
        title: "¡Listo!",
        text: "Tu contraseña ha sido actualizada correctamente.",
        confirmButtonColor: "#facc15",
      });

      onClose();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.message ||
          "Ocurrió un error al intentar actualizar tu contraseña.",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-[#1a1a1a] p-6 rounded-lg w-[90%] max-w-md text-white relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-white text-xl"
        >
          ×
        </button>

        <h2 className="text-xl font-bold mb-4 text-yellow-400 text-center">
          Recuperar Contraseña
        </h2>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm text-white">Correo o usuario</label>
            <input
              type="text"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white text-black"
            />
          </div>

          <div>
            <label className="text-sm text-white">Nueva contraseña</label>
            <input
              type="password"
              value={nuevaClave}
              onChange={(e) => setNuevaClave(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-2 rounded bg-white text-black"
            />
          </div>

          <div>
            <label className="text-sm text-white">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmarClave}
              onChange={(e) => setConfirmarClave(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white text-black"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={cargando}
            className={`${
              cargando
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-300"
            } text-black font-semibold py-2 rounded transition`}
          >
            {cargando ? "Procesando..." : "CAMBIAR CONTRASEÑA"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CambiarClaveModal;

import React, { useState } from "react";
import { register } from "../../api/authService";
import Swal from "sweetalert2";

interface Props {
  open: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<Props> = ({ open, onClose }) => {
  const [esVendedor, setEsVendedor] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    telefono: "",
    ciudad: "",
    direccion: "",
    nombreNegocio: "",
    ruc: "",
    rubro: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await register({ ...formData, esVendedor });
      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "Ya podés iniciar sesión",
        timer: 2000,
        showConfirmButton: false,
      });
      onClose();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text: error.message || "Ocurrió un problema",
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#1a1a1a] p-6 rounded-lg w-[90%] max-w-md text-white relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-white text-xl z-10"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Registrarse</h2>

        <div className="flex flex-col gap-3 pb-6">
          {/* campos comunes */}
          {[
            "nombre",
            "email",
            "password",
            "telefono",
            "ciudad",
            "direccion",
          ].map((name) => (
            <>
              <label className="text-sm text-white capitalize">{name}</label>
              <input
                type="text"
                name={name}
                value={(formData as any)[name]}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-white text-black"
              />
            </>
          ))}

          <label className="inline-flex items-center mt-2">
            <input
              type="checkbox"
              checked={esVendedor}
              onChange={() => setEsVendedor(!esVendedor)}
              className="mr-2"
            />
            Deseo vender productos en la plataforma
          </label>

          {esVendedor && (
            <>
              {["nombreNegocio", "ruc", "rubro"].map((name) => (
                <>
                  <label className="text-sm text-white capitalize">
                    {name}
                  </label>
                  <input
                    type="text"
                    name={name}
                    value={(formData as any)[name]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded bg-white text-black"
                  />
                </>
              ))}
            </>
          )}

          <button
            onClick={handleSubmit}
            className="bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-300"
          >
            REGISTRARSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;

// src/components/auth/RegisterModal.tsx
import React, { useState } from "react";

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
    // Solo si es vendedor
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
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, esVendedor }),
      });

      if (!response.ok) {
        throw new Error("Error al registrar usuario");
      }

      alert("Usuario registrado con éxito");
      onClose();
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 overflow-y-auto">
      <div className="bg-[#1a1a1a] p-6 rounded-lg w-[90%] max-w-md text-white relative mt-10 mb-10">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-white text-xl"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Registrarse</h2>

        <div className="flex flex-col gap-3">
          <label className="text-sm text-white">Nombre completo</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-white text-black"
          />

          <label className="text-sm text-white">Correo electrónico</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-white text-black"
          />

          <label className="text-sm text-white">Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-white text-black"
          />

          <label className="text-sm text-white">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-white text-black"
          />

          <label className="text-sm text-white">Ciudad</label>
          <input
            type="text"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-white text-black"
          />

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
              <label className="text-sm text-white mt-2">
                Nombre del negocio
              </label>
              <input
                type="text"
                name="nombreNegocio"
                value={formData.nombreNegocio}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-white text-black"
              />

              <label className="text-sm text-white">RUC</label>
              <input
                type="text"
                name="ruc"
                value={formData.ruc}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-white text-black"
              />

              <label className="text-sm text-white">Rubro / Categoría</label>
              <input
                type="text"
                name="rubro"
                value={formData.rubro}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-white text-black"
              />
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

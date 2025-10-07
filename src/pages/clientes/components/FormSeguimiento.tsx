// src/pages/clientes/components/FormSeguimiento.tsx
import React, { useState } from "react";
import { registrarSeguimiento } from "../../../api/clientesService";
import { SeguimientoRequest } from "../../../types/clientes";
import Swal from "sweetalert2";

const FormSeguimiento: React.FC = () => {
  const [form, setForm] = useState<SeguimientoRequest>({
    idInteresado: 0,
    comentario: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.idInteresado || !form.comentario.trim()) {
      Swal.fire(
        "Campos incompletos",
        "Debe completar todos los campos.",
        "warning"
      );
      return;
    }

    try {
      setLoading(true);
      await registrarSeguimiento(form);
      Swal.fire({
        icon: "success",
        title: "Seguimiento registrado",
        text: "El seguimiento fue guardado correctamente.",
      });

      setForm({ idInteresado: 0, comentario: "" });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo registrar el seguimiento.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto space-y-4"
    >
      <h2 className="text-xl text-yellow-400 font-bold mb-2">
        Registrar Seguimiento
      </h2>

      <input
        type="number"
        name="idInteresado"
        placeholder="ID del interesado"
        value={form.idInteresado || ""}
        onChange={handleChange}
        className="w-full border p-2 rounded bg-gray-900 text-white"
      />

      <textarea
        name="comentario"
        placeholder="Comentario o detalle del seguimiento"
        value={form.comentario}
        onChange={handleChange}
        rows={3}
        className="w-full border p-2 rounded bg-gray-900 text-white"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 rounded"
      >
        {loading ? "Guardando..." : "Registrar Seguimiento"}
      </button>
    </form>
  );
};

export default FormSeguimiento;

// src/pages/clientes/components/FormInteresado.tsx
import React, { useState } from "react";
import { registrarInteresado } from "../../../api/clientesService";
import { InteresadoRequest } from "../../../types/clientes";
import Swal from "sweetalert2";

const FormInteresado: React.FC = () => {
  const [form, setForm] = useState<InteresadoRequest>({
    nombre: "",
    telefono: "",
    email: "",
    ciudad: "",
    productoInteres: "",
    fechaProximoContacto: "",
    descripcion: "",
    aportaIPS: false,
    cantidadAportes: 0,
    archivoConversacion: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, archivoConversacion: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await registrarInteresado(form);
      Swal.fire({
        icon: "success",
        title: "Interesado registrado",
        text: "El interesado fue cargado correctamente.",
      });

      // limpiar
      setForm({
        nombre: "",
        telefono: "",
        email: "",
        ciudad: "",
        productoInteres: "",
        fechaProximoContacto: "",
        descripcion: "",
        aportaIPS: false,
        cantidadAportes: 0,
        archivoConversacion: null,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo registrar el interesado.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg mx-auto space-y-4"
    >
      <h2 className="text-xl text-yellow-400 font-bold mb-2">
        Registro de Interesado
      </h2>

      <input
        name="nombre"
        placeholder="Nombre completo"
        value={form.nombre}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded bg-gray-900 text-white"
      />

      <input
        name="telefono"
        placeholder="Teléfono"
        value={form.telefono}
        onChange={handleChange}
        className="w-full border p-2 rounded bg-gray-900 text-white"
      />

      <input
        name="email"
        placeholder="Correo electrónico"
        type="email"
        value={form.email}
        onChange={handleChange}
        className="w-full border p-2 rounded bg-gray-900 text-white"
      />

      <input
        name="ciudad"
        placeholder="Ciudad"
        value={form.ciudad}
        onChange={handleChange}
        className="w-full border p-2 rounded bg-gray-900 text-white"
      />

      <input
        name="productoInteres"
        placeholder="Producto de interés"
        value={form.productoInteres}
        onChange={handleChange}
        className="w-full border p-2 rounded bg-gray-900 text-white"
      />

      <label className="block text-gray-400 text-sm">
        Fecha próximo contacto:
      </label>
      <input
        type="date"
        name="fechaProximoContacto"
        value={form.fechaProximoContacto}
        onChange={handleChange}
        className="w-full border p-2 rounded bg-gray-900 text-white"
      />

      <textarea
        name="descripcion"
        placeholder="Descripción o comentarios"
        value={form.descripcion}
        onChange={handleChange}
        rows={3}
        className="w-full border p-2 rounded bg-gray-900 text-white"
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="aportaIPS"
          checked={form.aportaIPS}
          onChange={handleChange}
        />
        <label className="text-gray-300">Aporta a IPS</label>
      </div>

      {form.aportaIPS && (
        <input
          type="number"
          name="cantidadAportes"
          placeholder="Cantidad de aportes"
          value={form.cantidadAportes}
          onChange={handleChange}
          className="w-full border p-2 rounded bg-gray-900 text-white"
        />
      )}

      <label className="block text-gray-400 text-sm">
        Archivo de conversación:
      </label>
      <input
        type="file"
        onChange={handleFileChange}
        className="w-full text-sm text-gray-300"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 rounded"
      >
        {loading ? "Guardando..." : "Registrar"}
      </button>
    </form>
  );
};

export default FormInteresado;

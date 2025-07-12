import React from "react";
import { Categoria } from "../../types/categoria";

interface Props {
  open: boolean;
  onClose: () => void;
  categorias: Categoria[];
  onPublicar: (nueva: any) => void;
}

const CrearPublicacionModal: React.FC<Props> = ({
  open,
  onClose,
  categorias,
  onPublicar,
}) => {
  const [titulo, setTitulo] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [precio, setPrecio] = React.useState("");
  const [categoria, setCategoria] = React.useState("");

  const handlePublicar = () => {
    const nuevaPublicacion = { titulo, descripcion, precio, categoria };
    onPublicar(nuevaPublicacion);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#1e1f23] rounded-xl w-full max-w-4xl p-6">
        <h2 className="text-yellow-400 text-lg font-bold mb-4">
          Crear Publicación
        </h2>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-4">
            <input
              type="text"
              placeholder="Título del producto"
              className="bg-[#2a2b30] text-white px-4 py-2 rounded-md placeholder-gray-400"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            <textarea
              placeholder="Descripción detallada"
              rows={3}
              className="bg-[#2a2b30] text-white px-4 py-2 rounded-md placeholder-gray-400"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            <input
              type="number"
              placeholder="Precio ₲"
              className="bg-[#2a2b30] text-white px-4 py-2 rounded-md placeholder-gray-400"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
            <select
              className="bg-[#2a2b30] text-white px-4 py-2 rounded-md"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Seleccioná una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            <input type="file" className="text-white" />
          </div>

          <div className="flex-1 bg-[#2a2b30] rounded-xl flex items-center justify-center text-gray-400 text-sm">
            Previsualización del producto
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handlePublicar}
            className="w-full bg-yellow-400 text-black font-semibold py-2 rounded-md hover:bg-yellow-300 transition"
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearPublicacionModal;

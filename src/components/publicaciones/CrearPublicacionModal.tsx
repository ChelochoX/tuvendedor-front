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
  const [imagenes, setImagenes] = React.useState<File[]>([]);
  const [previewIndex, setPreviewIndex] = React.useState(0);
  const [mostrarBotonesCompra, setMostrarBotonesCompra] = React.useState(false);
  const [cuotas, setCuotas] = React.useState<
    { cuotas: number; valorCuota: number }[]
  >([]);

  const handlePublicar = () => {
    const nuevaPublicacion = {
      titulo,
      descripcion,
      precio,
      categoria,
      imagenes,
      mostrarBotonesCompra,
      planCredito: mostrarBotonesCompra ? { opciones: cuotas } : undefined,
    };
    onPublicar(nuevaPublicacion);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const archivos = Array.from(e.target.files).slice(0, 10);
      setImagenes(archivos);
      setPreviewIndex(0);
    }
  };

  const handleAddCuota = () => {
    setCuotas([...cuotas, { cuotas: 1, valorCuota: 0 }]);
  };

  const handleChangeCuota = (
    index: number,
    field: "cuotas" | "valorCuota",
    value: number
  ) => {
    const nuevasCuotas = [...cuotas];
    nuevasCuotas[index][field] = value;
    setCuotas(nuevasCuotas);
  };

  const handleRemoveCuota = (index: number) => {
    setCuotas(cuotas.filter((_, i) => i !== index));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#1e1f23] rounded-xl w-full max-w-6xl p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
          onClick={onClose}
        >
          ×
        </button>

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

            <label className="text-white flex items-center gap-2">
              <input
                type="checkbox"
                checked={mostrarBotonesCompra}
                onChange={(e) => setMostrarBotonesCompra(e.target.checked)}
              />
              Mostrar botón de compra y plan de crédito
            </label>

            {mostrarBotonesCompra && (
              <div className="flex flex-col gap-2">
                {cuotas.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Cuotas"
                      className="w-1/3 bg-[#2a2b30] text-white px-2 py-1 rounded"
                      value={c.cuotas}
                      onChange={(e) =>
                        handleChangeCuota(idx, "cuotas", Number(e.target.value))
                      }
                    />
                    <input
                      type="number"
                      placeholder="Valor Cuota"
                      className="w-1/2 bg-[#2a2b30] text-white px-2 py-1 rounded"
                      value={c.valorCuota}
                      onChange={(e) =>
                        handleChangeCuota(
                          idx,
                          "valorCuota",
                          Number(e.target.value)
                        )
                      }
                    />
                    <button
                      onClick={() => handleRemoveCuota(idx)}
                      className="text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddCuota}
                  className="text-yellow-400 hover:text-yellow-500 text-sm self-start"
                >
                  + Agregar opción de crédito
                </button>
              </div>
            )}

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="text-white"
            />
          </div>

          <div className="flex-1 bg-[#2a2b30] rounded-xl flex flex-col items-center justify-center text-gray-400 text-sm relative">
            {imagenes.length > 0 ? (
              <>
                <img
                  src={URL.createObjectURL(imagenes[previewIndex])}
                  alt="Preview"
                  className="w-full h-96 object-contain rounded"
                />
                <div className="flex mt-2 gap-2 overflow-x-auto">
                  {imagenes.map((img, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(img)}
                      onClick={() => setPreviewIndex(idx)}
                      className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                        idx === previewIndex
                          ? "border-yellow-400"
                          : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <span className="text-center">Previsualización del producto</span>
            )}
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

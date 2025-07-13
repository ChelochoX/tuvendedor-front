import React from "react";
import { Categoria } from "../../types/categoria";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

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
  const [errorImagenes, setErrorImagenes] = React.useState("");

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
      const archivos = Array.from(e.target.files);
      if (imagenes.length + archivos.length > 10) {
        setErrorImagenes("Solo se permiten hasta 10 imágenes.");
        return;
      }
      setImagenes([...imagenes, ...archivos]);
      setPreviewIndex(0);
      setErrorImagenes("");
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

  const handlePrevImage = () => {
    setPreviewIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setPreviewIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#1e1f23] rounded-xl w-full max-w-7xl p-6 relative overflow-y-auto max-h-[95vh]">
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
          <div className="w-full md:w-1/3 flex flex-col gap-4">
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
            {errorImagenes && (
              <span className="text-red-500 text-sm">{errorImagenes}</span>
            )}
          </div>

          <div className="w-full md:w-2/3 bg-[#2a2b30] rounded-xl flex flex-col items-center justify-center text-gray-400 text-sm relative overflow-hidden">
            {imagenes.length > 0 ? (
              <>
                <div className="relative w-full h-[520px]">
                  <img
                    src={URL.createObjectURL(imagenes[previewIndex])}
                    alt="Fondo desenfocado"
                    className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-20"
                  />
                  <img
                    src={URL.createObjectURL(imagenes[previewIndex])}
                    alt="Preview"
                    className="relative z-10 w-full h-full object-contain rounded-xl"
                  />

                  {imagenes.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute top-1/2 left-4 transform -translate-y-1/2 z-20 bg-black border-2 border-yellow-400 text-yellow-400 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:text-black"
                      >
                        <ArrowBackIosNewIcon fontSize="small" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute top-1/2 right-4 transform -translate-y-1/2 z-20 bg-black border-2 border-yellow-400 text-yellow-400 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:text-black"
                      >
                        <ArrowForwardIosIcon fontSize="small" />
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-2 w-full flex gap-2 overflow-x-auto">
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

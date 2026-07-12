import React from "react";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";

interface PreviewArchivo {
  archivo: File;
  url: string;
  esVideo: boolean;
}

interface Props {
  previews: PreviewArchivo[];

  maxArchivos: number;

  maxTamanoArchivoMb: number;

  onAgregarArchivos: (archivos: FileList | null) => void;

  onEliminarArchivo: (index: number) => void;
}

const PublicacionMediaUploader: React.FC<Props> = ({
  previews,
  maxArchivos,
  maxTamanoArchivoMb,
  onAgregarArchivos,
  onEliminarArchivo,
}) => {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-black text-yellow-300">
            <ImagePlus size={19} />
            Fotos y videos
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Máximo {maxArchivos} archivos, de hasta {maxTamanoArchivoMb} MB cada
            uno.
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-sm font-bold text-yellow-200 transition hover:bg-yellow-400 hover:text-black">
          <UploadCloud size={17} />
          Agregar
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(event) => {
              onAgregarArchivos(event.target.files);

              /*
               * Permite volver a seleccionar
               * el mismo archivo después
               * de haberlo quitado.
               */
              event.target.value = "";
            }}
          />
        </label>
      </div>

      {previews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-5 text-center text-sm text-gray-400">
          Aún no seleccionaste archivos.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {previews.map((preview, index) => (
            <div
              key={`${preview.archivo.name}-${index}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gray-950"
            >
              {preview.esVideo ? (
                <video src={preview.url} className="h-24 w-full object-cover" />
              ) : (
                <img
                  src={preview.url}
                  alt={preview.archivo.name}
                  className="h-24 w-full object-cover"
                />
              )}

              <button
                type="button"
                onClick={() => onEliminarArchivo(index)}
                title="Quitar archivo"
                className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PublicacionMediaUploader;

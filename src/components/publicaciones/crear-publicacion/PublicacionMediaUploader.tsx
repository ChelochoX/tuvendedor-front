import React from "react";
import { ImagePlus, Trash2 } from "lucide-react";

interface PreviewArchivo {
  archivo: File;
  url: string;
  esVideo: boolean;
}

interface Props {
  previews: PreviewArchivo[];
  onAgregarArchivos: (archivos: FileList | null) => void;
  onEliminarArchivo: (index: number) => void;
}

const PublicacionMediaUploader: React.FC<Props> = ({
  previews,
  onAgregarArchivos,
  onEliminarArchivo,
}) => {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-yellow-300">
        <ImagePlus size={20} />
        Fotos y videos
      </h3>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-yellow-400/50 bg-yellow-400/5 px-4 py-8 text-center transition hover:bg-yellow-400/10">
        <ImagePlus className="mb-2 text-yellow-300" />
        <span className="font-bold text-white">Seleccionar archivos</span>
        <span className="mt-1 text-sm text-gray-400">
          Podés cargar imágenes o videos.
        </span>

        <input
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => onAgregarArchivos(e.target.files)}
        />
      </label>

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {previews.map((preview, index) => (
            <div
              key={`${preview.archivo.name}-${index}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gray-950"
            >
              {preview.esVideo ? (
                <video
                  src={preview.url}
                  className="h-32 w-full object-cover"
                  controls
                />
              ) : (
                <img
                  src={preview.url}
                  alt={preview.archivo.name}
                  className="h-32 w-full object-cover"
                />
              )}

              <button
                type="button"
                onClick={() => onEliminarArchivo(index)}
                className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PublicacionMediaUploader;

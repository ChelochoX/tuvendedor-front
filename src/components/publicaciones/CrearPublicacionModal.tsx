import React, { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import Swal from "sweetalert2";

import { crearPublicacion } from "../../api/publicacionesService";
import { CategoriaPublicacionOption } from "../../types/publicacion.types";

import { useCrearPublicacionForm } from "./hooks/useCrearPublicacionForm";
import PublicacionDatosBasicos from "./crear-publicacion/PublicacionDatosBasicos";
import PublicacionCamposInmuebles from "./crear-publicacion/PublicacionCamposInmuebles";
import PublicacionMediaUploader from "./crear-publicacion/PublicacionMediaUploader";
import PublicacionPlanCredito from "./crear-publicacion/PublicacionPlanCredito";
import PublicacionPreview from "./crear-publicacion/PublicacionPreview";

import {
  categoriasGenerales,
  categoriasInmuebles,
  crearFormDataPublicacion,
  esCategoriaInmobiliaria,
  limpiarPrecio,
} from "./crear-publicacion/helpers";

interface Props {
  abierto?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  onCreado?: () => void;
  onPublicacionCreada?: () => void;
  categorias?: CategoriaPublicacionOption[];
  rubroVendedor?: string;
  modo?: "marketplace" | "perfil-vendedor";
}

const CrearPublicacionModal: React.FC<Props> = ({
  abierto,
  isOpen,
  onClose,
  onCreado,
  onPublicacionCreada,
  categorias,
  rubroVendedor,
  modo = "marketplace",
}) => {
  const modalAbierto = abierto ?? isOpen ?? false;
  const [guardando, setGuardando] = useState(false);

  const {
    form,
    previews,
    actualizarCampo,
    actualizarCampoInmueble,
    actualizarPrecio,
    agregarArchivos,
    eliminarArchivo,
    agregarPlanCredito,
    actualizarPlanCredito,
    eliminarPlanCredito,
    limpiarFormulario,
  } = useCrearPublicacionForm();

  const esInmobiliario =
    esCategoriaInmobiliaria(form.categoria) ||
    esCategoriaInmobiliaria(rubroVendedor);

  const categoriasFinales = useMemo<CategoriaPublicacionOption[]>(() => {
    if (categorias?.length) return categorias;

    if (esCategoriaInmobiliaria(rubroVendedor)) {
      return categoriasInmuebles.map((nombre) => ({ nombre }));
    }

    return categoriasGenerales.map((nombre) => ({ nombre }));
  }, [categorias, rubroVendedor]);

  if (!modalAbierto) return null;

  const validarFormulario = () => {
    if (!form.titulo.trim()) return "Ingresá el título de la publicación.";
    if (!form.descripcion.trim()) return "Ingresá la descripción.";
    if (!limpiarPrecio(form.precio)) return "Ingresá un precio válido.";
    if (!form.categoria.trim()) return "Seleccioná una categoría.";
    if (!form.archivos.length) return "Seleccioná al menos una imagen o video.";

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const error = validarFormulario();

    if (error) {
      Swal.fire({
        title: "Faltan datos",
        text: error,
        icon: "warning",
        confirmButtonColor: "#facc15",
      });
      return;
    }

    try {
      setGuardando(true);

      const formData = crearFormDataPublicacion(form);
      await crearPublicacion(formData);

      Swal.fire({
        title: "¡Publicación creada!",
        text:
          modo === "perfil-vendedor"
            ? "La publicación ya puede verse en tu vitrina pública."
            : "La publicación fue creada correctamente.",
        icon: "success",
        confirmButtonColor: "#facc15",
      });

      limpiarFormulario();
      onCreado?.();
      onPublicacionCreada?.();
      onClose();
    } catch (error: any) {
      console.error("Error al crear publicación:", error);

      const mensaje =
        error?.response?.data?.Errors?.[0] ||
        error?.response?.data?.Message ||
        error?.message ||
        "No se pudo crear la publicación.";

      Swal.fire({
        title: "No se pudo publicar",
        text: mensaje,
        icon: "error",
        confirmButtonColor: "#facc15",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 px-3 py-4 backdrop-blur-md">
      <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#10151f] text-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/10 bg-white/[0.02] px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-yellow-300">
              {modo === "perfil-vendedor"
                ? "Nueva publicación para tu vitrina"
                : "Marketplace"}
            </p>

            <h2 className="mt-1 text-2xl font-black">Crear publicación</h2>

            <p className="mt-1 max-w-2xl text-sm text-gray-400">
              Cargá la información principal del producto. Si elegís una
              categoría inmobiliaria, aparecerán datos especiales para
              propiedades.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-gray-300 transition hover:bg-red-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="
            grid flex-1 gap-5 overflow-y-auto p-5 sm:p-6 lg:grid-cols-[1fr_0.86fr]
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          "
        >
          <div className="space-y-5">
            <PublicacionDatosBasicos
              form={form}
              categorias={categoriasFinales}
              esInmobiliario={Boolean(esInmobiliario)}
              onCampo={actualizarCampo}
              onPrecio={actualizarPrecio}
            />

            {esInmobiliario && (
              <PublicacionCamposInmuebles
                form={form}
                onCampoInmueble={actualizarCampoInmueble}
              />
            )}

            <PublicacionMediaUploader
              previews={previews}
              onAgregarArchivos={agregarArchivos}
              onEliminarArchivo={eliminarArchivo}
            />

            <PublicacionPlanCredito
              form={form}
              onMostrarCompra={(valor) =>
                actualizarCampo("mostrarBotonesCompra", valor)
              }
              onAgregarPlan={agregarPlanCredito}
              onActualizarPlan={actualizarPlanCredito}
              onEliminarPlan={eliminarPlanCredito}
            />
          </div>

          <aside className="flex flex-col gap-5">
            <PublicacionPreview form={form} previews={previews} />

            <button
              type="submit"
              disabled={guardando}
              className="
                group flex w-full items-center justify-center gap-2 rounded-2xl
                border border-yellow-400/40 bg-yellow-400/15 px-6 py-4
                text-base font-black text-yellow-200 shadow-lg shadow-yellow-950/20
                transition hover:-translate-y-0.5 hover:border-yellow-300 hover:bg-yellow-400 hover:text-black
                disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0
              "
            >
              <CheckCircle2 size={19} />
              {guardando ? "Publicando..." : "Publicar ahora"}
            </button>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-xs leading-relaxed text-gray-400">
              Tu publicación se mostrará en el marketplace y, si tenés perfil
              público de vendedor, también aparecerá en tu vitrina.
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default CrearPublicacionModal;

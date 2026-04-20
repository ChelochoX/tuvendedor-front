import React, { FormEvent, useMemo, useState } from "react";
import { X } from "lucide-react";
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
    rubroVendedor?.toLowerCase().includes("inmueble") ||
    form.categoria.toLowerCase().includes("terreno") ||
    form.categoria.toLowerCase().includes("casa") ||
    form.categoria.toLowerCase().includes("departamento") ||
    form.categoria.toLowerCase().includes("dúplex") ||
    form.categoria.toLowerCase().includes("duplex");

  const categoriasFinales = useMemo<CategoriaPublicacionOption[]>(() => {
    if (categorias?.length) return categorias;

    if (rubroVendedor?.toLowerCase().includes("inmueble")) {
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
        "No se pudo crear la publicación.";

      Swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        confirmButtonColor: "#facc15",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-gray-900 text-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-sm font-bold text-yellow-300">
              {modo === "perfil-vendedor"
                ? "Nueva publicación para tu vitrina"
                : "Marketplace"}
            </p>

            <h2 className="text-2xl font-extrabold">Crear publicación</h2>

            <p className="mt-1 text-sm text-gray-400">
              Cargá fotos, precio, descripción y datos principales del producto.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-gray-300 hover:bg-red-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid flex-1 gap-5 overflow-y-auto p-6 lg:grid-cols-[1fr_0.9fr]"
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

          <div className="flex flex-col gap-5">
            <PublicacionPreview form={form} previews={previews} />

            <button
              type="submit"
              disabled={guardando}
              className="rounded-full bg-yellow-400 px-6 py-4 text-lg font-extrabold text-black shadow-xl transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearPublicacionModal;

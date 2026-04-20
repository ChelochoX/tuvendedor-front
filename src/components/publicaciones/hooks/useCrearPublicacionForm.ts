import { useMemo, useState } from "react";
import { CrearPublicacionForm } from "../../../types/publicacion.types";
import { formatearPrecioVisual } from "../crear-publicacion/helpers";

const estadoInicial: CrearPublicacionForm = {
  titulo: "",
  descripcion: "",
  precio: "",
  categoria: "",
  ubicacion: "",
  mostrarBotonesCompra: false,
  planCredito: [],
  archivos: [],
  camposInmuebles: {
    tipoOperacion: "",
    tipoPropiedad: "",
    moneda: "PYG",
    ciudad: "",
    barrio: "",
    superficieTerreno: "",
    superficieConstruida: "",
    dormitorios: "",
    banos: "",
    cocheras: "",
  },
};

export const useCrearPublicacionForm = () => {
  const [form, setForm] = useState<CrearPublicacionForm>(estadoInicial);

  const previews = useMemo(() => {
    return form.archivos.map((archivo) => ({
      archivo,
      url: URL.createObjectURL(archivo),
      esVideo: archivo.type.startsWith("video/"),
    }));
  }, [form.archivos]);

  const actualizarCampo = <K extends keyof CrearPublicacionForm>(
    campo: K,
    valor: CrearPublicacionForm[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const actualizarCampoInmueble = (
    campo: keyof CrearPublicacionForm["camposInmuebles"],
    valor: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      camposInmuebles: {
        ...prev.camposInmuebles,
        [campo]: valor,
      },
    }));
  };

  const actualizarPrecio = (valor: string) => {
    setForm((prev) => ({
      ...prev,
      precio: formatearPrecioVisual(valor),
    }));
  };

  const agregarArchivos = (archivos: FileList | null) => {
    if (!archivos) return;

    setForm((prev) => ({
      ...prev,
      archivos: [...prev.archivos, ...Array.from(archivos)],
    }));
  };

  const eliminarArchivo = (index: number) => {
    setForm((prev) => ({
      ...prev,
      archivos: prev.archivos.filter((_, i) => i !== index),
    }));
  };

  const agregarPlanCredito = () => {
    setForm((prev) => ({
      ...prev,
      planCredito: [
        ...prev.planCredito,
        {
          cuotas: 1,
          valorCuota: 0,
        },
      ],
    }));
  };

  const actualizarPlanCredito = (
    index: number,
    campo: "cuotas" | "valorCuota",
    valor: number,
  ) => {
    setForm((prev) => ({
      ...prev,
      planCredito: prev.planCredito.map((plan, i) =>
        i === index
          ? {
              ...plan,
              [campo]: valor,
            }
          : plan,
      ),
    }));
  };

  const eliminarPlanCredito = (index: number) => {
    setForm((prev) => ({
      ...prev,
      planCredito: prev.planCredito.filter((_, i) => i !== index),
    }));
  };

  const limpiarFormulario = () => {
    setForm(estadoInicial);
  };

  return {
    form,
    setForm,
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
  };
};

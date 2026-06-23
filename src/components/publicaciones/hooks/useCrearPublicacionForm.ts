import { useEffect, useMemo, useState } from "react";
import {
  CrearPublicacionForm,
  PublicacionEditable,
} from "../../../types/publicacion.types";
import { formatearPrecioVisual } from "../crear-publicacion/helpers";

const estadoInicial: CrearPublicacionForm = {
  titulo: "",
  descripcion: "",
  precio: "",
  moneda: "PYG",
  categoria: "",
  ubicacion: "",
  mostrarBotonesCompra: false,
  permiteDelivery: false,
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

const mapearPublicacionAFormulario = (
  publicacion?: PublicacionEditable | null,
): CrearPublicacionForm => {
  if (!publicacion) return estadoInicial;

  return {
    titulo: publicacion.titulo ?? "",
    descripcion: publicacion.descripcion ?? "",
    precio: publicacion.precio
      ? formatearPrecioVisual(String(publicacion.precio))
      : "",
    moneda: publicacion.moneda ?? "PYG",
    categoria: publicacion.categoria ?? "",
    ubicacion: publicacion.ubicacion ?? "",
    mostrarBotonesCompra: Boolean(publicacion.mostrarBotonesCompra),
    permiteDelivery: Boolean(publicacion.permiteDelivery),
    planCredito:
      publicacion.planCredito?.map((plan) => ({
        cuotas: plan.cuotas ? String(plan.cuotas) : "",
        valorCuota: plan.valorCuota
          ? formatearPrecioVisual(String(plan.valorCuota))
          : "",
      })) ?? [],
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
};

export const useCrearPublicacionForm = (
  publicacionInicial?: PublicacionEditable | null,
  abierto?: boolean,
) => {
  const [form, setForm] = useState<CrearPublicacionForm>(estadoInicial);

  useEffect(() => {
    if (!abierto) return;

    if (publicacionInicial) {
      setForm(mapearPublicacionAFormulario(publicacionInicial));
      return;
    }

    setForm(estadoInicial);
  }, [publicacionInicial, abierto]);

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
      mostrarBotonesCompra: true,
      planCredito: [
        ...prev.planCredito,
        {
          cuotas: "",
          valorCuota: "",
        },
      ],
    }));
  };

  const actualizarPlanCredito = (
    index: number,
    campo: "cuotas" | "valorCuota",
    valor: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      planCredito: prev.planCredito.map((plan, i) => {
        if (i !== index) return plan;

        return {
          ...plan,
          [campo]:
            campo === "valorCuota"
              ? formatearPrecioVisual(valor)
              : valor.replace(/\D/g, ""),
        };
      }),
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
    esEdicion: Boolean(publicacionInicial),
  };
};

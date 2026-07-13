import { useEffect, useMemo, useState } from "react";
import {
  CrearPublicacionForm,
  PublicacionEditable,
} from "../../../types/publicacion.types";
import {
  formatearPrecioVisual,
  normalizarMoneda,
} from "../crear-publicacion/helpers";

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

/**
 * Generamos una nueva instancia del estado inicial para evitar
 * reutilizar referencias de arreglos u objetos entre aperturas del modal.
 */
const crearEstadoInicial = (): CrearPublicacionForm => ({
  ...estadoInicial,
  planCredito: [],
  archivos: [],
  camposInmuebles: {
    ...estadoInicial.camposInmuebles,
  },
});

const mapearPublicacionAFormulario = (
  publicacion?: PublicacionEditable | null,
): CrearPublicacionForm => {
  if (!publicacion) {
    return crearEstadoInicial();
  }

  /**
   * La moneda de la publicación se copia tanto al campo general
   * como al campo inmobiliario.
   *
   * Esto permite que, al editar una publicación en dólares,
   * el selector muestre correctamente "Dólares".
   */
  const monedaPublicacion = normalizarMoneda(publicacion.moneda);

  return {
    titulo: publicacion.titulo ?? "",
    descripcion: publicacion.descripcion ?? "",

    precio: publicacion.precio
      ? formatearPrecioVisual(String(publicacion.precio))
      : "",

    moneda: monedaPublicacion,

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

      // Se usa la moneda real de la publicación.
      moneda: monedaPublicacion,

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
  const [form, setForm] = useState<CrearPublicacionForm>(crearEstadoInicial);

  useEffect(() => {
    if (!abierto) return;

    if (publicacionInicial) {
      setForm(mapearPublicacionAFormulario(publicacionInicial));
      return;
    }

    setForm(crearEstadoInicial());
  }, [publicacionInicial, abierto]);

  const previews = useMemo(() => {
    return form.archivos.map((archivo) => ({
      archivo,
      url: URL.createObjectURL(archivo),
      esVideo: archivo.type.startsWith("video/"),
    }));
  }, [form.archivos]);

  /**
   * Actualiza un campo general del formulario.
   *
   * Cuando se modifica la moneda general, también sincronizamos
   * la moneda de los campos inmobiliarios.
   */
  const actualizarCampo = <K extends keyof CrearPublicacionForm>(
    campo: K,
    valor: CrearPublicacionForm[K],
  ) => {
    setForm((prev) => {
      if (campo === "moneda") {
        const moneda = normalizarMoneda(String(valor));

        return {
          ...prev,

          moneda,

          camposInmuebles: {
            ...prev.camposInmuebles,
            moneda,
          },
        };
      }

      return {
        ...prev,
        [campo]: valor,
      };
    });
  };

  /**
   * Actualiza los campos específicos de inmuebles.
   *
   * CORRECCIÓN PRINCIPAL:
   * cuando el usuario selecciona USD o PYG en el formulario
   * inmobiliario, actualizamos también form.moneda.
   *
   * De esa manera:
   * - la vista previa muestra la moneda correcta;
   * - el FormData envía la moneda correcta;
   * - la edición guarda USD cuando se selecciona dólares.
   */
  const actualizarCampoInmueble = (
    campo: keyof CrearPublicacionForm["camposInmuebles"],
    valor: string,
  ) => {
    setForm((prev) => {
      const valorNormalizado =
        campo === "moneda" ? normalizarMoneda(valor) : valor;

      return {
        ...prev,

        moneda: campo === "moneda" ? valorNormalizado : prev.moneda,

        camposInmuebles: {
          ...prev.camposInmuebles,
          [campo]: valorNormalizado,
        },
      };
    });
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
    setForm(crearEstadoInicial());
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

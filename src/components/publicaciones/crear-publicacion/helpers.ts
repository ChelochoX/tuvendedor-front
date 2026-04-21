import { CrearPublicacionForm } from "../../../types/publicacion.types";

export const categoriasInmuebles = [
  "Terrenos",
  "Casas",
  "Departamentos",
  "Dúplex",
  "Salones",
  "Locales",
  "Oficinas",
  "Quintas",
  "Lotes",
  "Depósitos",
  "Tinglados",
  "Campos",
  "Alquileres",
  "Locales comerciales",
  "Propiedades en pozo",
  "Inversiones",
  "Monoambientes",
  "Habitaciones",
  "Garajes",
];

export const categoriasGenerales = [
  "Vehículos/Motos",
  "Electrodomésticos",
  "Electrónica y Accesorios",
  "Delivery / Mensajería",
  "Despensa / Bodega",
  "Educación",
  "Farmacia",
  "Ferretería",
  "Heladería",
  "Lavadero",
  "Inmuebles",
];

export const esCategoriaInmobiliaria = (valor?: string | null) => {
  if (!valor) return false;

  const normalizado = valor.trim().toLowerCase();

  return [
    "inmueble",
    "terreno",
    "casa",
    "departamento",
    "dúplex",
    "duplex",
    "salon",
    "salón",
    "local",
    "oficina",
    "quinta",
    "lote",
    "deposito",
    "depósito",
    "tinglado",
    "campo",
    "alquiler",
    "monoambiente",
    "garaje",
  ].some((x) => normalizado.includes(x));
};

export const formatearPrecioVisual = (valor: string) => {
  const limpio = valor.replace(/\D/g, "");

  if (!limpio) return "";

  return new Intl.NumberFormat("es-PY").format(Number(limpio));
};

export const limpiarPrecio = (valor: string) => {
  return Number(valor.replace(/\D/g, "")) || 0;
};

export const crearFormDataPublicacion = (form: CrearPublicacionForm) => {
  const formData = new FormData();

  formData.append("Titulo", form.titulo);
  formData.append("Descripcion", form.descripcion);
  formData.append("Precio", String(limpiarPrecio(form.precio)));
  formData.append("Categoria", form.categoria);
  formData.append("Ubicacion", form.ubicacion);
  formData.append("MostrarBotonesCompra", String(form.mostrarBotonesCompra));

  form.archivos.forEach((archivo) => {
    formData.append("Imagenes", archivo);
  });

  if (form.mostrarBotonesCompra) {
    form.planCredito.forEach((plan, index) => {
      formData.append(
        `PlanCredito[${index}].Cuotas`,
        String(Number(plan.cuotas) || 0),
      );
      formData.append(
        `PlanCredito[${index}].ValorCuota`,
        String(limpiarPrecio(plan.valorCuota)),
      );
    });
  }

  return formData;
};

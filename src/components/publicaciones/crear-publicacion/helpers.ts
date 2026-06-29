import { CrearPublicacionForm } from "../../../types/publicacion.types";

export const categoriasInmuebles = [
  "Inmuebles",
  "Casas",
  "Departamentos",
  "Dúplex",
  "Terrenos",
  "Lotes",
  "Monoambientes",
  "Habitaciones",
  "Salones",
  "Locales comerciales",
  "Oficinas",
  "Depósitos",
  "Tinglados",
  "Quintas",
  "Campos",
  "Garajes",
  "Alquileres",
  "Propiedades en pozo",
  "Inversiones inmobiliarias",
];

export const categoriasGenerales = [
  "Inmuebles",
  "Casas",
  "Departamentos",
  "Dúplex",
  "Terrenos",
  "Lotes",
  "Vehículos/Motos",
  "Repuestos y Accesorios",
  "Electrodomésticos",
  "Electrónica y Accesorios",
  "Informática y Celulares",
  "Muebles y Hogar",
  "Ropa y Calzados",
  "Moda y Accesorios",
  "Bebés y Niños",
  "Mascotas",
  "Supermercado",
  "Despensa / Bodega",
  "Comidas y Bebidas",
  "Delivery / Mensajería",
  "Farmacia",
  "Ferretería",
  "Herramientas",
  "Construcción",
  "Educación",
  "Servicios",
  "Servicios profesionales",
  "Desarrollo de Sistemas",
  "Plomería",
  "Electricidad",
  "Albañilería",
  "Jardinería",
  "Limpieza",
  "Reparaciones",
  "Belleza y Barbería",
  "Eventos",
  "Fotografía y Video",
  "Clases particulares",
  "Transporte y Fletes",
  "Taller Mecánico",
  "Heladería",
  "Lavadero",
  "Deportes",
  "Salud y Bienestar",
  "Agro y Campo",
  "Maquinarias",
  "Librería y Oficina",
  "Emprendedores",
  "Artesanías",
];

export const esCategoriaInmobiliaria = (valor?: string | null) => {
  if (!valor) return false;

  const normalizado = valor.trim().toLowerCase();

  return [
    "inmueble",
    "inmuebles",
    "terreno",
    "terrenos",
    "casa",
    "casas",
    "departamento",
    "departamentos",
    "dúplex",
    "duplex",
    "salon",
    "salón",
    "salones",
    "local",
    "locales",
    "oficina",
    "oficinas",
    "quinta",
    "quintas",
    "lote",
    "lotes",
    "deposito",
    "depósito",
    "depósitos",
    "tinglado",
    "tinglados",
    "campo",
    "campos",
    "alquiler",
    "alquileres",
    "propiedad",
    "propiedades",
    "monoambiente",
    "monoambientes",
    "habitacion",
    "habitación",
    "habitaciones",
    "garaje",
    "garajes",
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

export const normalizarMoneda = (valor?: string | null) => {
  const moneda = valor?.trim().toUpperCase();

  if (moneda === "USD") return "USD";

  return "PYG";
};

export const crearFormDataPublicacion = (form: CrearPublicacionForm) => {
  const formData = new FormData();

  const monedaSeleccionada = normalizarMoneda(
    form.moneda || form.camposInmuebles?.moneda,
  );

  formData.append("Titulo", form.titulo.trim());
  formData.append("Descripcion", form.descripcion.trim());
  formData.append("Precio", String(limpiarPrecio(form.precio)));
  formData.append("Moneda", monedaSeleccionada);
  formData.append("Categoria", form.categoria.trim());
  formData.append("Ubicacion", form.ubicacion?.trim() || "");
  formData.append("MostrarBotonesCompra", String(form.mostrarBotonesCompra));
  formData.append("PermiteDelivery", String(form.permiteDelivery));

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

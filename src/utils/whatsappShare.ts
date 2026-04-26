import { buildProductoShareUrl, buildVitrinaUrl } from "../config/appConfig";
import {
  abrirWhatsapp,
  abrirWhatsappConMensaje,
  construirLinkWhatsapp,
  limpiarTelefonoWhatsapp,
} from "./whatsapp";

type ProductoWhatsapp = {
  id: number;
  titulo: string;
  descripcion?: string | null;
  categoria?: string | null;
  ubicacion?: string | null;
  precio?: number | string | null;
  moneda?: "PYG" | "USD" | string | null;
};

type PerfilWhatsapp = {
  slug?: string | null;
  nombreNegocio?: string | null;
  nombreUsuario?: string | null;
  ciudadVisible?: string | null;
  rubro?: string | null;
};

export const formatearPrecio = (
  precio?: number | string | null,
  moneda?: string | null,
): string => {
  if (precio === null || precio === undefined || precio === "") {
    return "Consultar precio";
  }

  const valorNumerico = Number(precio);

  if (Number.isNaN(valorNumerico)) {
    return "Consultar precio";
  }

  const monedaNormalizada = moneda?.trim().toUpperCase() || "PYG";

  if (monedaNormalizada === "USD") {
    return `USD ${valorNumerico.toLocaleString("es-PY", {
      maximumFractionDigits: 0,
    })}`;
  }

  return `Gs. ${valorNumerico.toLocaleString("es-PY", {
    maximumFractionDigits: 0,
  })}`;
};

export const obtenerUrlCompartirProducto = (
  idProducto: number,
  slug?: string | null,
): string => {
  return buildProductoShareUrl(idProducto, slug);
};

export const obtenerUrlCompartirVitrina = (slug?: string | null): string => {
  return buildVitrinaUrl(slug);
};

export const generarMensajeProductoWhatsapp = (
  producto: ProductoWhatsapp,
  slug?: string | null,
): string => {
  const urlCompartir = obtenerUrlCompartirProducto(producto.id, slug);

  return `Hola

Te comparto esta publicación disponible:

${producto.titulo}
${producto.categoria ? `Categoria: ${producto.categoria}` : ""}
${producto.ubicacion ? `Ubicacion: ${producto.ubicacion}` : ""}
Precio: ${formatearPrecio(producto.precio, producto.moneda)}

${producto.descripcion?.trim() || ""}

Ver publicación:
${urlCompartir}`;
};

export const generarMensajeVitrinaWhatsapp = (
  perfil: PerfilWhatsapp,
): string => {
  const urlVitrina = obtenerUrlCompartirVitrina(perfil.slug);

  const nombre =
    perfil.nombreNegocio?.trim() ||
    perfil.nombreUsuario?.trim() ||
    "Tu Vendedor";

  return `Hola 👋

Te comparto mi vitrina pública:

🏪 ${nombre}
${perfil.rubro ? `📌 ${perfil.rubro}` : ""}
${perfil.ciudadVisible ? `📍 ${perfil.ciudadVisible}` : ""}

Mirá mis publicaciones disponibles acá:

${urlVitrina}`;
};

export {
  abrirWhatsapp,
  abrirWhatsappConMensaje,
  construirLinkWhatsapp,
  limpiarTelefonoWhatsapp,
};

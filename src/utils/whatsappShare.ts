import { getPublicAppUrl, buildVitrinaUrl } from "../config/appConfig";

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

export const limpiarTelefonoWhatsapp = (telefono?: string | null): string => {
  if (!telefono) return "";

  let limpio = telefono.replace(/\D/g, "");

  if (limpio.startsWith("0")) {
    limpio = `595${limpio.substring(1)}`;
  }

  if (!limpio.startsWith("595")) {
    limpio = `595${limpio}`;
  }

  return limpio;
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
  const baseUrl = getPublicAppUrl();

  return `${baseUrl}/share/producto/${idProducto}`;
};

export const obtenerUrlCompartirVitrina = (slug?: string | null): string => {
  return buildVitrinaUrl(slug);
};

export const generarMensajeProductoWhatsapp = (
  producto: ProductoWhatsapp,
  slug?: string | null,
): string => {
  const urlCompartir = obtenerUrlCompartirProducto(producto.id, slug);

  return `Hola 👋

Vi esta publicación y me interesa:

🏷️ ${producto.titulo}
📍 ${producto.ubicacion || ""}
💰 ${formatearPrecio(producto.precio, producto.moneda)}

🔗 Ver publicación:
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

export const construirLinkWhatsapp = (
  telefono?: string | null,
  mensaje?: string,
): string => {
  const telefonoLimpio = limpiarTelefonoWhatsapp(telefono);

  if (!telefonoLimpio) return "";

  const texto = mensaje?.trim() ? `?text=${encodeURIComponent(mensaje)}` : "";

  return `https://wa.me/${telefonoLimpio}${texto}`;
};

export const abrirWhatsapp = (
  telefono?: string | null,
  mensaje?: string,
): void => {
  const url = construirLinkWhatsapp(telefono, mensaje);

  if (!url) {
    window.alert("El vendedor no tiene WhatsApp configurado.");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};

export const abrirWhatsappConMensaje = abrirWhatsapp;

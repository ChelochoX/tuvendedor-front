type ProductoWhatsapp = {
  id: number;
  titulo: string;
  descripcion?: string | null;
  categoria?: string | null;
  ubicacion?: string | null;
  precio?: number | string | null;
};

const normalizarBaseUrl = (url?: string): string => {
  return (url ?? "").replace(/\/$/, "");
};

const SHARE_URL = normalizarBaseUrl(import.meta.env.VITE_SHARE_URL);

export const obtenerUrlCompartirProducto = (idProducto: number): string => {
  return `${SHARE_URL}/Compartir/producto/${idProducto}`;
};

export const limpiarTelefonoWhatsapp = (telefono?: string | null): string => {
  if (!telefono) return "";

  let limpio = telefono.replace(/\D/g, "");

  // Si viene en formato local Paraguay: 0994xxxxxx -> 595994xxxxxx
  if (limpio.startsWith("0")) {
    limpio = `595${limpio.substring(1)}`;
  }

  return limpio;
};

export const formatearPrecioGs = (precio?: number | string | null): string => {
  if (precio === null || precio === undefined || precio === "") {
    return "Consultar precio";
  }

  const valorNumerico = Number(precio);

  if (Number.isNaN(valorNumerico)) {
    return "Consultar precio";
  }

  return `Gs. ${valorNumerico.toLocaleString("es-PY")}`;
};

export const generarMensajeProductoWhatsapp = (
  producto: ProductoWhatsapp,
): string => {
  const urlCompartir = obtenerUrlCompartirProducto(producto.id);

  return `Hola 👋

Vi tu publicación y me gustaría saber más.

🏷️ Publicación: ${producto.titulo}
📌 Categoría: ${producto.categoria || "Sin categoría"}
📍 Ubicación: ${producto.ubicacion || "Ubicación no especificada"}
💰 Precio: ${formatearPrecioGs(producto.precio)}

${
  producto.descripcion
    ? `📝 Detalle:
${producto.descripcion}

`
    : ""
}¿Sigue disponible? Me interesa recibir más información.

🔗 Ver publicación:
${urlCompartir}`;
};

export const abrirWhatsappConMensaje = (
  telefono: string | null | undefined,
  mensaje: string,
): void => {
  const telefonoLimpio = limpiarTelefonoWhatsapp(telefono);

  if (!telefonoLimpio) {
    window.alert("El vendedor no tiene WhatsApp configurado.");
    return;
  }

  const whatsappUrl = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(
    mensaje,
  )}`;

  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
};

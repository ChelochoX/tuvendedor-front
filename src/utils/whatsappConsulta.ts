import { buildProductoShareUrl } from "../config/appConfig";

export interface ProductoConsultaWhatsapp {
  id: number;
  titulo: string;
  precioTexto: string;
}

const limpiarTituloWhatsapp = (titulo: string): string => {
  return titulo
    .replace(/\uFFFD/g, "")
    .replace(/^[^\p{L}\p{N}¡¿]+/gu, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const generarMensajeConsultaWhatsapp = (
  producto: ProductoConsultaWhatsapp,
  slugVendedor?: string | null,
): string => {
  const urlPublicacion = buildProductoShareUrl(producto.id, slugVendedor);

  const tituloLimpio =
    limpiarTituloWhatsapp(producto.titulo) || "Publicación disponible";

  return [
    "¡Hola!",
    "",
    "Vi esta publicación en TuVendedor y estoy interesado:",
    "",
    `*${tituloLimpio}*`,
    `Precio: *${producto.precioTexto}*`,
    "",
    "¿Sigue disponible?",
    "Quisiera recibir más información.",
    "",
    urlPublicacion,
  ].join("\n");
};

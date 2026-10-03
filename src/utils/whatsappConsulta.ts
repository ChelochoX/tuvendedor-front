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

const obtenerTituloCortoWhatsapp = (titulo: string): string => {
  const limpio = limpiarTituloWhatsapp(titulo);

  if (!limpio) {
    return "esta moto";
  }

  // Quita códigos/chasis largos puestos al final entre paréntesis.
  const sinCodigoFinal = limpio
    .replace(/\s*\([A-Z0-9-]{7,}\)\s*$/i, "")
    .trim();

  // Si el título termina con una frase comercial después de un separador,
  // para WhatsApp dejamos solamente el nombre principal del producto/modelo.
  const partes = sinCodigoFinal.split(/\s+(?:–|—|\|)\s+|\s+-\s+/);

  if (partes.length > 1) {
    const resto = partes.slice(1).join(" ");

    const pareceTextoComercial =
      /\b(contado|cr[eé]dito|financiaci[oó]n|promo|promoci[oó]n|oferta|cuotas?)\b/i.test(
        resto,
      );

    if (pareceTextoComercial && partes[0].trim()) {
      return partes[0].trim();
    }
  }

  return sinCodigoFinal;
};

export const generarMensajeConsultaWhatsapp = (
  producto: ProductoConsultaWhatsapp,
  slugVendedor?: string | null,
): string => {
  const urlPublicacion = buildProductoShareUrl(producto.id, slugVendedor);
  const tituloCorto = obtenerTituloCortoWhatsapp(producto.titulo);

  /*
   * [TV_PRODUCTO:id] es una referencia estable para el bridge/backend.
   * El link sigue presente como segundo mecanismo de identificación.
   * Así Panambí no depende de interpretar el título comercial ni de un
   * código de modelo escrito por el cliente.
   */
  return [
    "¡Hola! 👋 Estoy consultando desde TuVendedor.",
    `Me interesa *${tituloCorto}*.`,
    `Referencia: [TV_PRODUCTO:${producto.id}]`,
    "¿Qué opciones hay disponibles?",
    "",
    `Publicación: ${urlPublicacion}`,
  ].join("\n");
};

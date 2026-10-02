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

  return [
    `¡Hola! 👋 Me interesa *${tituloCorto}*.`,
    "¿Me contás las opciones disponibles?",
    "",
    urlPublicacion,
  ].join("\n");
};

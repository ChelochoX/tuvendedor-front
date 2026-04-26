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

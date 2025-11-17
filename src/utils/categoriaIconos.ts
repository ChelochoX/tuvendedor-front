export const categoriaIconos: Record<string, string> = {
  "Vehículos/Motos": "🚗",
  Propiedades: "🏠",
  Electrodomésticos: "💡",
  Panadería: "🥖",
  "Despensa / Bodega": "🛒",
  Supermercado: "🏪",
  Vivero: "🌱",
  Lavadero: "🧼",
  Ferretería: "🛠️",
  "Electrónica y Accesorios": "📱",
  "Ropa y Calzados": "👟",
  Farmacia: "💊",
  Peluquería: "💇‍♂️",
  Heladería: "🍨",
  Rotisería: "🍱",
  "Taller Mecánico": "🔧",
  "Delivery / Mensajería": "🛵",
};

export const obtenerIconoCategoria = (nombre: string): string => {
  return categoriaIconos[nombre] || "📦"; // ícono por defecto
};

// src/types/producto.ts

export interface Imagen {
  mainUrl: string;
  thumbUrl: string;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  moneda?: "PYG" | "USD" | string | null;
  categoria: string;
  ubicacion: string;
  descripcion?: string;
  // ⭐ Destacado
  esDestacada?: boolean;
  fechaFinDestacado?: string;

  vendedor: {
    nombre: string;
    avatar: string;
    telefono: string;
  };

  planCredito?: {
    opciones: {
      cuotas: number;
      valorCuota: number;
    }[];
  };

  imagenes: Imagen[];
  mostrarBotonesCompra?: boolean;
  permiteDelivery?: boolean;

  // 🎉 TEMPORADA → AGREGAR ESTO
  esTemporada?: boolean;
  badgeTexto?: string;
  badgeColor?: string;
  fechaFinTemporada?: string;

  // 🔥 NUEVO: estado de la publicación
  estado: "Activo" | "Vendido" | "Pausado" | string;

  // ❤️ Interacciones / métricas
  esFavorito?: boolean;
  cantidadFavoritos?: number;
  cantidadVistas?: number;
  cantidadClicksWhatsapp?: number;
}

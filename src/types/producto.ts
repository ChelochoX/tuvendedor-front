// src/types/producto.ts

export type CanalPublicacion = "MARKETPLACE" | "VITRINA";

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

  // Canal al que pertenece la publicación.
  canalPublicacion?: CanalPublicacion | string;

  // Destacado
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

  // GPS / mapa
  latitud?: number | null;
  longitud?: number | null;
  googleMapsUrl?: string | null;

  // Temporada
  esTemporada?: boolean;
  badgeTexto?: string;
  badgeColor?: string;
  fechaFinTemporada?: string;

  // Estado
  estado: "Activo" | "Vendido" | "Pausado" | string;

  // Interacciones / métricas
  esFavorito?: boolean;
  cantidadFavoritos?: number;
  cantidadVistas?: number;
  cantidadClicksWhatsapp?: number;
}
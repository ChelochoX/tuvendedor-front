import type { CanalPublicacion } from "./publicacion.types";

export interface ApiResponse<T> {
  Success: boolean;
  Data: T;
  Errors: string[];
  StatusCode: number;
  Message: string;
}

export interface PublicacionPerfilVendedor {
  id: number;
  titulo: string;

  descripcion?: string;

  precio?: number;

  moneda?: "PYG" | "USD" | string | null;

  categoria?: string;
  ubicacion?: string;
  estado?: string;

  canalPublicacion?: CanalPublicacion | string;

  imagenPrincipal?: string;
  thumbUrl?: string;

  mostrarBotonesCompra?: boolean;

  permiteDelivery?: boolean;

  // Compatibilidad con respuestas anteriores.
  PermiteDelivery?: boolean;

  esDestacada?: boolean;

  fechaFinDestacado?: string | null;

  esTemporada?: boolean;

  fechaFinTemporada?: string | null;

  badgeTexto?: string | null;

  badgeColor?: string | null;

  googleMapsUrl?: string | null;

  latitud?: number | string | null;

  longitud?: number | string | null;

  imagenes?: Array<{
    mainUrl: string;
    thumbUrl?: string;
  }>;

  planCredito?: {
    opciones: Array<{
      cuotas: number;
      valorCuota: number;
    }>;
  } | null;

  esFavorito?: boolean;

  cantidadFavoritos?: number;

  cantidadVistas?: number;

  cantidadClicksWhatsapp?: number;
}

export interface PerfilPublicoVendedor {
  idVendedor: number;
  idUsuario: number;

  slug: string;

  nombreNegocio: string;
  nombreUsuario: string;

  descripcion: string;

  bannerUrl: string;
  bannerTipo?: string;

  fotoPerfil: string;

  rubro: string;
  ciudadVisible: string;

  telefono: string;
  whatsapp: string;

  email?: string;
  correoContacto?: string;

  instagramUrl: string;
  facebookUrl: string;

  esPerfilPublico: boolean;
  esPremium: boolean;

  mostrarTelefono: boolean;

  mostrarEmail?: boolean;
  mostrarCorreo?: boolean;

  ofreceDelivery?: boolean;
  OfreceDelivery?: boolean;

  zonaDelivery?: string;
  ZonaDelivery?: string;

  costoDelivery?: string;
  CostoDelivery?: string;

  tiempoEstimadoDelivery?: string;
  TiempoEstimadoDelivery?: string;

  cantidadPublicaciones: number;

  publicaciones: PublicacionPerfilVendedor[];
}

export interface ActualizarMiPerfilVendedorRequest {
  nombreNegocio: string;

  slug: string;
  rubro: string;

  descripcion: string;

  whatsapp: string;

  instagramUrl: string;

  facebookUrl: string;

  correoContacto?: string;

  mostrarCorreo?: boolean;
  mostrarEmail?: boolean;

  ciudadVisible: string;

  esPerfilPublico: boolean;

  mostrarTelefono: boolean;

  ofreceDelivery?: boolean;

  zonaDelivery?: string;

  costoDelivery?: string;

  tiempoEstimadoDelivery?: string;

  fotoPerfil?: File | null;

  banner?: File | null;
}

export type PerfilPublicoPublicacion = PublicacionPerfilVendedor;

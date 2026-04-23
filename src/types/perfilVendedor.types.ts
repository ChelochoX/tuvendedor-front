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
  categoria?: string;
  ubicacion?: string;
  estado?: string;
  imagenPrincipal?: string;
  thumbUrl?: string;
  esDestacada?: boolean;
  googleMapsUrl?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  imagenes?: Array<{
    mainUrl: string;
    thumbUrl?: string;
  }>;
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
  mostrarCorreo: boolean;

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

  //En el front usamos mostrarCorreo
  mostrarCorreo?: boolean;

  //Lo dejamos opcional por compatibilidad si en algún lado quedó mostrarEmail
  mostrarEmail?: boolean;

  ciudadVisible: string;

  esPerfilPublico: boolean;
  mostrarTelefono: boolean;

  fotoPerfil?: File | null;
  banner?: File | null;
}

// Alias para componentes nuevos/reutilizables
export type PerfilPublicoPublicacion = PublicacionPerfilVendedor;

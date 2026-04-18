export interface PerfilPublicoPublicacion {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  categoria: string;
  ubicacion: string | null;
  estado: string;
  imagenPrincipal: string | null;
  thumbUrl: string | null;
  esDestacada: boolean;
}

export interface PerfilPublicoVendedor {
  idVendedor: number;
  idUsuario: number;
  slug: string | null;

  nombreNegocio: string | null;
  nombreUsuario: string | null;
  descripcion: string | null;

  bannerUrl: string | null;
  bannerTipo: string | null;
  fotoPerfil: string | null;

  rubro: string | null;
  ciudadVisible: string | null;

  telefono: string | null;
  whatsapp: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;

  esPerfilPublico: boolean;
  esPremium: boolean;
  mostrarTelefono: boolean;

  cantidadPublicaciones: number;
  publicaciones: PerfilPublicoPublicacion[];
}

export interface ActualizarMiPerfilVendedorRequest {
  nombreNegocio: string;
  slug: string;
  rubro: string;
  descripcion: string;
  whatsapp: string;
  instagramUrl: string;
  facebookUrl: string;
  ciudadVisible: string;
  esPerfilPublico: boolean;
  mostrarTelefono: boolean;
  fotoPerfil?: File | null;
  banner?: File | null;
}

export interface ApiResponse<T> {
  Success: boolean;
  Data: T;
  Errors: string[];
  StatusCode: number;
  Message: string;
}

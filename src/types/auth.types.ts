export interface LoginRequest {
  email?: string;
  usuarioLogin?: string;
  clave?: string;
  nombre?: string;
  fotoUrl?: string;
  tipoLogin: "clasico" | "google" | "facebook";
  proveedorId?: string;
}

// Usuario ya registrado y autenticado
export interface LoginExitoso {
  esNuevo: false;
  parTokens: {
    bearerToken: string;
  };
  parUsuario: {
    id: number;
    nombreUsuario: string;
    email: string;
    estado: string;
    fotoPerfil?: string;
  };
}

// Usuario nuevo detectado por proveedor externo
export interface LoginNuevo {
  esNuevo: true;
  datosPrevios: {
    email: string;
    nombre: string;
    fotoUrl: string;
    tipoLogin: string;
  };
}

// Unión de ambos posibles
export type LoginResponseData = LoginExitoso | LoginNuevo;

export interface RegisterRequest {
  nombreUsuario: string;
  usuarioLogin?: string;
  email: string;
  clave: string;
  telefono?: string;
  ciudad?: string;
  direccion?: string;
  esVendedor?: boolean;
  nombreNegocio?: string;
  ruc?: string;
  rubro?: string;
  proveedor?: string;
  proveedorId?: string;
  fotoPerfil?: string;
}

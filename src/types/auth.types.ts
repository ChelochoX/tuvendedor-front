export interface LoginRequest {
  email: string;
  clave?: string;
  nombre?: string;
  fotoUrl?: string;
  tipoLogin: "clasico" | "google" | "facebook";
}

export interface LoginResponseData {
  esNuevo: boolean;
  parTokens?: {
    bearerToken: string;
  };
  parUsuario?: {
    id: number;
    nombreUsuario: string;
    email: string;
    estado: string;
  };
  datosPrevios?: {
    email: string;
    nombre: string;
    fotoUrl: string;
    tipoLogin: string;
  };
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  ciudad?: string;
  direccion?: string;
  esVendedor?: boolean;
  nombreNegocio?: string;
  ruc?: string;
  rubro?: string;
}

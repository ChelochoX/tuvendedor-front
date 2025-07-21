// src/types/auth.types.ts

export interface LoginRequest {
  usuario: string;
  clave: string;
}

export interface LoginResponse {
  parTokens: {
    bearerToken: string;
    refreshToken?: string;
  };
  parUsuario: {
    idUsuario: number;
    nombre: string;
    email: string;
    roles: string[];
    // puedes agregar más propiedades si vienen en la respuesta
  };
}

import instance from "./axiosInstance";
import {
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
} from "../types/auth.types";
import { ApiResponse } from "../types/api";

const API_URL = "/Auth";

// Para login clásico
export const login = async (
  payload: LoginRequest
): Promise<LoginResponseData> => {
  const response = await instance.post<ApiResponse<LoginResponseData>>(
    `${API_URL}/login`,
    payload
  );
  const result = response.data;

  if (!result.Success) {
    throw new Error(
      result.Message || result.Errors?.[0] || "Usuario o contraseña incorrectos"
    );
  }

  // Si tiene token, guardamos
  if ("parTokens" in result.Data && result.Data.parTokens?.bearerToken) {
    localStorage.setItem("token", result.Data.parTokens.bearerToken);
  }

  return result.Data;
};

// Para login con Google
export const loginConGoogle = async (payload: {
  email: string;
  nombre: string;
  fotoUrl: string;
  proveedorId: string;
}): Promise<LoginResponseData> => {
  const response = await instance.post<ApiResponse<LoginResponseData>>(
    `${API_URL}/login`,
    {
      email: payload.email,
      clave: "",
      tipoLogin: "google",
      nombre: payload.nombre,
      fotoUrl: payload.fotoUrl,
      proveedorId: payload.proveedorId,
    }
  );

  console.log("Respuesta completa del login con Google:", response);
  const result = response.data;

  if (!result.Success) {
    throw new Error(
      result.Message || result.Errors?.[0] || "Login con Google fallido"
    );
  }

  // Si es usuario existente con token, guardamos
  if ("parTokens" in result.Data && result.Data.parTokens?.bearerToken) {
    localStorage.setItem("token", result.Data.parTokens.bearerToken);

    const usuario = result.Data.parUsuario;
    if (usuario) {
      localStorage.setItem("usuario", usuario.nombreUsuario || "");
      localStorage.setItem("fotoUrl", usuario.fotoPerfil || "");
    }

    // 🔥 IMPORTANTE: Esto notifica a la cabecera y al context
    window.dispatchEvent(new Event("usuario-actualizado"));
  }

  return result.Data;
};

export const register = async (payload: RegisterRequest): Promise<void> => {
  const response = await instance.post<ApiResponse<any>>(
    `${API_URL}/registro`,
    payload
  );
  const result = response.data;

  if (!result.Success) {
    throw new Error(result.Message || result.Errors?.[0] || "Registro fallido");
  }
};

export const verificarUsuarioLogin = async (
  usuarioLogin: string
): Promise<boolean> => {
  const response = await instance.get<ApiResponse<any>>(
    `${API_URL}/verificar-usuario-login`,
    { params: { usuarioLogin } }
  );

  const result = response.data;

  if (!result.Success) {
    throw new Error(
      result.Message || result.Errors?.[0] || "Error al verificar usuarioLogin"
    );
  }

  return result.Data.disponible;
};

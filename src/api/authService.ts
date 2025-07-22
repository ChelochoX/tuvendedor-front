// src/api/authService.ts
import instance from "./axiosInstance";
import {
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
} from "../types/auth.types";

const API_URL = "/Auth";

export const login = async (
  payload: LoginRequest
): Promise<LoginResponseData> => {
  const response = await instance.post(`${API_URL}/login`, payload);
  const { bearerToken } = response.data.parTokens;

  if (bearerToken) {
    localStorage.setItem("token", bearerToken);
  }

  return response.data;
};

export const register = async (payload: RegisterRequest): Promise<any> => {
  const response = await instance.post(`${API_URL}/register`, payload);
  return response.data;
};

export const loginConGoogle = async (payload: {
  email: string;
  nombre: string;
  fotoUrl: string;
}): Promise<LoginResponseData> => {
  const response = await instance.post(`${API_URL}/login`, {
    email: payload.email,
    clave: "",
    tipoLogin: "google",
    nombre: payload.nombre,
    fotoUrl: payload.fotoUrl,
  });

  const { bearerToken } = response.data.parTokens ?? {};

  if (bearerToken) {
    localStorage.setItem("token", bearerToken);
  }

  return response.data;
};

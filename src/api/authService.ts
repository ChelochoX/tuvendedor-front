import instance from "./axiosInstance";
import { LoginRequest, LoginResponse } from "../types/auth.types";

const API_URL = "/auth";

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const response = await instance.post(`${API_URL}/login`, payload);
  const { bearerToken } = response.data.parTokens;

  if (bearerToken) {
    localStorage.setItem("token", bearerToken);
  }

  return response.data;
};

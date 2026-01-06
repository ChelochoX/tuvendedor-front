import instance from "./axiosInstance";
import { ApiResponse } from "types/api";
import {
  ModeloProducto,
  CrearModeloProductoRequest,
  EditarModeloProductoRequest,
} from "types/modeloProducto";

const API_URL = "/modelos-producto";

// 📥 Listar modelos
export const obtenerModelos = async (
  idMarca?: number,
  soloActivos: boolean = true
): Promise<ModeloProducto[]> => {
  const response = await instance.get<ApiResponse<ModeloProducto[]>>(
    `${API_URL}/listar`,
    {
      params: { idMarca, soloActivos },
    }
  );

  if (!response.data.Success) {
    throw new Error(response.data.Message || "Error al obtener modelos");
  }

  return response.data.Data;
};

// ➕ Crear modelo
export const crearModelo = async (
  payload: CrearModeloProductoRequest
): Promise<number> => {
  const response = await instance.post<ApiResponse<any>>(
    `${API_URL}/crear`,
    payload
  );

  if (!response.data.Success) {
    throw new Error(response.data.Message || response.data.Errors?.[0]);
  }

  return response.data.Data.Id;
};

// ✏️ Editar modelo
export const editarModelo = async (
  payload: EditarModeloProductoRequest
): Promise<void> => {
  const response = await instance.put<ApiResponse<any>>(
    `${API_URL}/editar`,
    payload
  );

  if (!response.data.Success) {
    throw new Error(response.data.Message || response.data.Errors?.[0]);
  }
};

// ✅ Activar
export const activarModelo = async (id: number): Promise<void> => {
  const res = await instance.post<ApiResponse<any>>(`${API_URL}/activar/${id}`);
  if (!res.data.Success) throw new Error("Error al activar modelo");
};

// ⛔ Desactivar
export const desactivarModelo = async (id: number): Promise<void> => {
  const res = await instance.post<ApiResponse<any>>(
    `${API_URL}/desactivar/${id}`
  );
  if (!res.data.Success) throw new Error("Error al desactivar modelo");
};

export default {
  obtenerModelos,
  crearModelo,
  editarModelo,
  activarModelo,
  desactivarModelo,
};

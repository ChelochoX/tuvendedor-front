import instance from "./axiosInstance";
import { ApiResponse } from "types/api";
import { Marca, CrearMarcaRequest, EditarMarcaRequest } from "types/marca";

const API_URL = "/Marcas";

// 📥 Listar marcas
export const obtenerMarcas = async (
  soloActivas: boolean = true,
): Promise<Marca[]> => {
  const response = await instance.get<ApiResponse<Marca[]>>(
    `${API_URL}/listar`,
    {
      params: { soloActivas },
    },
  );

  const result = response.data;

  if (!result.Success) {
    throw new Error(result.Message || "Error al obtener marcas");
  }

  return result.Data;
};

// ➕ Crear marca
export const crearMarca = async (
  payload: CrearMarcaRequest,
): Promise<number> => {
  const response = await instance.post<ApiResponse<any>>(
    `${API_URL}/crear`,
    payload,
  );

  const result = response.data;

  if (!result.Success) {
    throw new Error(result.Message || result.Errors?.[0]);
  }

  return result.Data.Id;
};

// ✏️ Editar marca
export const editarMarca = async (
  payload: EditarMarcaRequest,
): Promise<void> => {
  const response = await instance.put<ApiResponse<any>>(
    `${API_URL}/editar`,
    payload,
  );

  const result = response.data;

  if (!result.Success) {
    throw new Error(result.Message || result.Errors?.[0]);
  }
};

// ✅ Activar
export const activarMarca = async (id: number): Promise<void> => {
  const response = await instance.post<ApiResponse<any>>(
    `${API_URL}/activar/${id}`,
  );

  if (!response.data.Success) {
    throw new Error(response.data.Message || "Error al activar marca");
  }
};

// ⛔ Desactivar
export const desactivarMarca = async (id: number): Promise<void> => {
  const response = await instance.post<ApiResponse<any>>(
    `${API_URL}/desactivar/${id}`,
  );

  if (!response.data.Success) {
    throw new Error(response.data.Message || "Error al desactivar marca");
  }
};

export default {
  obtenerMarcas,
  crearMarca,
  editarMarca,
  activarMarca,
  desactivarMarca,
};

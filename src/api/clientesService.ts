import instance from "./axiosInstance";
import { ApiResponse } from "../types/api";
import {
  InteresadoRequest,
  SeguimientoRequest,
  Seguimiento,
  Interesado,
  FiltroInteresadosRequest,
} from "../types/clientes";

const API_URL = "/Clientes";

/**
 * Registrar un nuevo interesado
 */
export const registrarInteresado = async (
  payload: InteresadoRequest
): Promise<any> => {
  const formData = new FormData();

  formData.append("Nombre", payload.nombre);
  if (payload.telefono) formData.append("Telefono", payload.telefono);
  if (payload.email) formData.append("Email", payload.email);
  if (payload.ciudad) formData.append("Ciudad", payload.ciudad);
  if (payload.productoInteres)
    formData.append("ProductoInteres", payload.productoInteres);
  if (payload.fechaProximoContacto)
    formData.append("FechaProximoContacto", payload.fechaProximoContacto);
  if (payload.descripcion) formData.append("Descripcion", payload.descripcion);
  formData.append("AportaIPS", payload.aportaIPS.toString());
  formData.append("CantidadAportes", payload.cantidadAportes.toString());

  if (payload.archivoConversacion) {
    formData.append("ArchivoConversacion", payload.archivoConversacion);
  }

  const response = await instance.post<ApiResponse<any>>(
    `${API_URL}/registrar-interesados`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  const result = response.data;

  if (!result.Success) {
    const mensaje =
      result.Message || result.Errors?.[0] || "Error al registrar interesado.";
    const error = new Error(mensaje);
    (error as any).customErrors = result.Errors;
    throw error;
  }

  return result.Data;
};

export const registrarSeguimiento = async (
  payload: SeguimientoRequest
): Promise<any> => {
  const response = await instance.post<ApiResponse<any>>(
    `${API_URL}/registrar-seguimiento`,
    payload
  );

  const result = response.data;

  if (!result.Success) {
    const mensaje =
      result.Message || result.Errors?.[0] || "Error al registrar seguimiento.";
    const error = new Error(mensaje);
    (error as any).customErrors = result.Errors;
    throw error;
  }

  return result.Data;
};

interface InteresadosResponse {
  TotalRegistros: number;
  PaginaActual: number;
  RegistrosPorPagina: number;
  Items: Interesado[];
}

export const obtenerInteresados = async (
  filtros: FiltroInteresadosRequest
): Promise<{
  totalRegistros: number;
  paginaActual: number;
  registrosPorPagina: number;
  items: Interesado[];
}> => {
  const response = await instance.get<ApiResponse<InteresadosResponse>>(
    `${API_URL}/obtener-interesados`,
    { params: filtros }
  );

  const result = response.data;
  console.log("Respuesta de obtenerInteresados:", result); // 🔹 Log de depuración
  if (!result.Success) {
    throw new Error(result.Errors?.[0] || "Error al obtener interesados.");
  }

  const data = result.Data || {}; // 🔹 asegura que no sea null

  return {
    totalRegistros: data.TotalRegistros ?? 0,
    paginaActual: data.PaginaActual ?? 1,
    registrosPorPagina: data.RegistrosPorPagina ?? 0,
    items: data.Items || [], // 🔹 garantiza array
  };
};

export const obtenerSeguimientos = async (
  idInteresado: number
): Promise<Seguimiento[]> => {
  const response = await instance.get<ApiResponse<Seguimiento[]>>(
    `${API_URL}/obtener-seguimientos`,
    { params: { idInteresado } }
  );

  const result = response.data;
  if (!result.Success) {
    throw new Error(result.Errors?.[0] || "Error al obtener seguimientos.");
  }

  return result.Data;
};

export const actualizarInteresado = async (interesado: Interesado) => {
  const response = await instance.put(
    `/interesados/${interesado.id}`,
    interesado
  );
  return response.data;
};

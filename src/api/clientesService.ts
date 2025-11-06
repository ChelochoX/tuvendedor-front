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
  formData.append("Estado", payload.estado || "Activo");

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
  totalRegistros?: number;
  TotalRegistros?: number;
  paginaActual?: number;
  PaginaActual?: number;
  registrosPorPagina?: number;
  RegistrosPorPagina?: number;
  items?: Interesado[];
  Items?: Interesado[];
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

  if (!result.Success) {
    throw new Error(result.Errors?.[0] || "Error al obtener interesados.");
  }

  // 🔹 Acepta tanto Data (mayúscula) como data (minúscula)
  const data: any = (result as any).Data ?? (result as any).data ?? {};
  // 🔹 Acepta tanto campos con minúscula como mayúscula
  return {
    totalRegistros: data.totalRegistros ?? data.TotalRegistros ?? 0,
    paginaActual: data.paginaActual ?? data.PaginaActual ?? 1,
    registrosPorPagina: data.registrosPorPagina ?? data.RegistrosPorPagina ?? 0,
    items: data.items ?? data.Items ?? [],
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
  const formData = new FormData();

  formData.append("Nombre", interesado.nombre);
  if (interesado.telefono) formData.append("Telefono", interesado.telefono);
  if (interesado.email) formData.append("Email", interesado.email);
  if (interesado.ciudad) formData.append("Ciudad", interesado.ciudad);
  if (interesado.productoInteres)
    formData.append("ProductoInteres", interesado.productoInteres);
  if (interesado.fechaProximoContacto)
    formData.append("FechaProximoContacto", interesado.fechaProximoContacto);
  if (interesado.descripcion)
    formData.append("Descripcion", interesado.descripcion);
  formData.append("AportaIPS", interesado.aportaIPS.toString());
  formData.append("CantidadAportes", interesado.cantidadAportes.toString());
  formData.append("Estado", interesado.estado || "Activo");

  if (interesado.archivoConversacion) {
    formData.append("ArchivoConversacion", interesado.archivoConversacion);
  }

  const response = await instance.put(
    `${API_URL}/actualizar-interesado/${interesado.id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data;
};

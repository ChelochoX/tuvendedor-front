// src/api/clientesService.ts

import instance from "./axiosInstance";
import { ApiResponse } from "../types/api";
import {
  ActualizarSeguimientoInteresadoRequest,
  FiltroInteresadosRequest,
  Interesado,
  InteresadoDetalle,
  InteresadoRequest,
  InteresadosResumen,
  SincronizacionWhatsAppResultado,
  Seguimiento,
  SeguimientoRequest,
} from "../types/clientes";

const API_URL = "/Clientes";

const extraerData = <T>(payload: any): T => {
  const success = payload?.Success ?? payload?.success;

  if (success === false) {
    const mensaje =
      payload?.Message ??
      payload?.message ??
      payload?.Errors?.[0] ??
      payload?.errors?.[0] ??
      "Ocurrió un error al procesar la solicitud.";

    throw new Error(mensaje);
  }

  return (payload?.Data ?? payload?.data) as T;
};

const mensajeError = (error: any, fallback: string) =>
  error?.response?.data?.Message ??
  error?.response?.data?.message ??
  error?.response?.data?.Errors?.[0] ??
  error?.response?.data?.errors?.[0] ??
  error?.message ??
  fallback;

export const obtenerMensajeErrorClientes = (
  error: unknown,
  fallback = "No se pudo completar la operación.",
) => mensajeError(error, fallback);

export const registrarInteresado = async (
  payload: InteresadoRequest,
): Promise<any> => {
  const formData = new FormData();

  formData.append("Nombre", payload.nombre);

  if (payload.telefono) {
    formData.append("Telefono", payload.telefono);
  }

  if (payload.email) {
    formData.append("Email", payload.email);
  }

  if (payload.ciudad) {
    formData.append("Ciudad", payload.ciudad);
  }

  if (payload.productoInteres) {
    formData.append("ProductoInteres", payload.productoInteres);
  }

  if (payload.fechaProximoContacto) {
    formData.append("FechaProximoContacto", payload.fechaProximoContacto);
  }

  if (payload.descripcion) {
    formData.append("Descripcion", payload.descripcion);
  }

  formData.append("AportaIPS", String(payload.aportaIPS));
  formData.append("CantidadAportes", String(payload.cantidadAportes || 0));
  formData.append("Estado", payload.estado || "Activo");

  if (payload.archivoConversacion) {
    formData.append("ArchivoConversacion", payload.archivoConversacion);
  }

  const response = await instance.post<ApiResponse<any>>(
    `${API_URL}/registrar-interesados`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return extraerData<any>(response.data);
};

export const registrarSeguimiento = async (
  payload: SeguimientoRequest,
): Promise<any> => {
  const response = await instance.post<ApiResponse<any>>(
    `${API_URL}/registrar-seguimiento`,
    payload,
  );

  return extraerData<any>(response.data);
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
  filtros: FiltroInteresadosRequest,
): Promise<{
  totalRegistros: number;
  paginaActual: number;
  registrosPorPagina: number;
  items: Interesado[];
}> => {
  const response = await instance.get<ApiResponse<InteresadosResponse>>(
    `${API_URL}/obtener-interesados`,
    {
      params: filtros,
    },
  );

  const data = extraerData<any>(response.data) ?? {};

  return {
    totalRegistros:
      data.totalRegistros ??
      data.TotalRegistros ??
      0,

    paginaActual:
      data.paginaActual ??
      data.PaginaActual ??
      1,

    registrosPorPagina:
      data.registrosPorPagina ??
      data.RegistrosPorPagina ??
      filtros.registrosPorPagina,

    items:
      data.items ??
      data.Items ??
      [],
  };
};

export const obtenerSeguimientos = async (
  idInteresado: number,
): Promise<Seguimiento[]> => {
  const response = await instance.get<ApiResponse<Seguimiento[]>>(
    `${API_URL}/obtener-seguimientos`,
    {
      params: {
        idInteresado,
      },
    },
  );

  return extraerData<Seguimiento[]>(response.data) ?? [];
};

export const obtenerDetalleInteresado = async (
  idInteresado: number,
): Promise<InteresadoDetalle> => {
  const response = await instance.get<ApiResponse<InteresadoDetalle>>(
    `${API_URL}/detalle-interesado/${idInteresado}`,
  );

  return extraerData<InteresadoDetalle>(response.data);
};

export const obtenerResumenInteresados = async (
  fecha?: string,
): Promise<InteresadosResumen> => {
  const response = await instance.get<ApiResponse<InteresadosResumen>>(
    `${API_URL}/resumen-interesados`,
    {
      params: fecha
        ? {
            fecha,
          }
        : undefined,
    },
  );

  return extraerData<InteresadosResumen>(response.data);
};


export const sincronizarWhatsAppDia = async (
  fecha: string,
): Promise<SincronizacionWhatsAppResultado> => {
  const response = await instance.post<
    ApiResponse<SincronizacionWhatsAppResultado>
  >(
    `${API_URL}/sincronizar-whatsapp-dia`,
    null,
    {
      params: {
        fecha,
      },
    },
  );

  return extraerData<SincronizacionWhatsAppResultado>(
    response.data,
  );
};


export const actualizarSeguimientoInteresado = async (
  idInteresado: number,
  payload: ActualizarSeguimientoInteresadoRequest,
): Promise<void> => {
  const response = await instance.put<ApiResponse<any>>(
    `${API_URL}/actualizar-seguimiento/${idInteresado}`,
    payload,
  );

  const success =
    (response.data as any)?.Success ??
    (response.data as any)?.success;

  if (success === false) {
    throw new Error(
      (response.data as any)?.Message ??
        (response.data as any)?.message ??
        (response.data as any)?.Errors?.[0] ??
        (response.data as any)?.errors?.[0] ??
        "No se pudo actualizar el seguimiento.",
    );
  }
};

export const actualizarInteresado = async (
  interesado: Interesado,
): Promise<any> => {
  const formData = new FormData();

  formData.append("Nombre", interesado.nombre);

  if (interesado.telefono) {
    formData.append("Telefono", interesado.telefono);
  }

  if (interesado.email) {
    formData.append("Email", interesado.email);
  }

  if (interesado.ciudad) {
    formData.append("Ciudad", interesado.ciudad);
  }

  if (interesado.productoInteres) {
    formData.append("ProductoInteres", interesado.productoInteres);
  }

  if (interesado.fechaProximoContacto) {
    formData.append(
      "FechaProximoContacto",
      interesado.fechaProximoContacto,
    );
  }

  if (interesado.descripcion) {
    formData.append("Descripcion", interesado.descripcion);
  }

  formData.append("AportaIPS", String(interesado.aportaIPS));
  formData.append(
    "CantidadAportes",
    String(interesado.cantidadAportes || 0),
  );
  formData.append("Estado", interesado.estado || "Activo");

  if (interesado.archivoConversacion) {
    formData.append(
      "ArchivoConversacion",
      interesado.archivoConversacion,
    );
  }

  const response = await instance.put<ApiResponse<any>>(
    `${API_URL}/actualizar-interesado/${interesado.id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  const success =
    (response.data as any)?.Success ??
    (response.data as any)?.success;

  if (success === false) {
    throw new Error(
      (response.data as any)?.Message ??
        (response.data as any)?.message ??
        "No se pudo actualizar el interesado.",
    );
  }

  return (response.data as any)?.Data ?? (response.data as any)?.data;
};

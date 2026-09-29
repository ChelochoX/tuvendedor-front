import instance from "./axiosInstance";

import {
  CambiarEstadoContadoMotoRequest,
  ContadoMotoGestionDetalle,
  ContadoMotoGestionLista,
  EstadoControlContado,
} from "../types/contadoMotoGestion";

const API_URL = "/ventas/motos/contado/solicitudes";

type ApiEnvelope<T> = {
  Success?: boolean;
  success?: boolean;

  Data?: T;
  data?: T;

  Message?: string | null;
  message?: string | null;

  Errors?: string[];
  errors?: string[];
};

const extraerData = <T>(respuesta: ApiEnvelope<T>): T => {
  const success = respuesta.Success ?? respuesta.success ?? true;

  if (!success) {
    const errores = respuesta.Errors ?? respuesta.errors ?? [];

    const mensaje =
      respuesta.Message ??
      respuesta.message ??
      errores[0] ??
      "No se pudo completar la operación.";

    throw new Error(mensaje);
  }

  const data = respuesta.Data ?? respuesta.data;

  if (data === undefined || data === null) {
    throw new Error("La API no devolvió datos para la operación solicitada.");
  }

  return data;
};

export const obtenerMensajeErrorContado = (error: unknown): string => {
  const anyError = error as any;
  const responseData = anyError?.response?.data;

  return (
    responseData?.Message ??
    responseData?.message ??
    responseData?.Errors?.[0] ??
    responseData?.errors?.[0] ??
    anyError?.message ??
    "Ocurrió un error inesperado."
  );
};

export const listarSolicitudesContadoMoto = async (
  estado?: EstadoControlContado | "TODOS",
  buscar?: string,
  fecha?: string,
): Promise<ContadoMotoGestionLista[]> => {
  const params: Record<string, string> = {};

  if (estado && estado !== "TODOS") {
    params.estado = estado;
  }

  if (buscar?.trim()) {
    params.buscar = buscar.trim();
  }

  if (fecha) {
    params.fecha = fecha;
  }

  const response = await instance.get<ApiEnvelope<ContadoMotoGestionLista[]>>(
    API_URL,
    {
      params,
    },
  );

  return extraerData(response.data);
};

export const obtenerSolicitudContadoMoto = async (
  idSolicitudContado: number,
): Promise<ContadoMotoGestionDetalle> => {
  const response = await instance.get<ApiEnvelope<ContadoMotoGestionDetalle>>(
    `${API_URL}/${idSolicitudContado}`,
  );

  return extraerData(response.data);
};

export const contactarSolicitudContadoMoto = async (
  idSolicitudContado: number,
): Promise<ContadoMotoGestionDetalle> => {
  const response = await instance.post<ApiEnvelope<ContadoMotoGestionDetalle>>(
    `${API_URL}/${idSolicitudContado}/contactar`,
  );

  return extraerData(response.data);
};

export const cambiarEstadoSolicitudContadoMoto = async (
  idSolicitudContado: number,
  payload: CambiarEstadoContadoMotoRequest,
): Promise<ContadoMotoGestionDetalle> => {
  const response = await instance.patch<ApiEnvelope<ContadoMotoGestionDetalle>>(
    `${API_URL}/${idSolicitudContado}/estado`,
    payload,
  );

  return extraerData(response.data);
};

export const obtenerDocumentoContadoMoto = async (
  idSolicitudContado: number,
  idDocumento: number,
): Promise<Blob> => {
  const response = await instance.get(
    `${API_URL}/${idSolicitudContado}/documentos/${idDocumento}`,
    {
      responseType: "blob",
    },
  );

  return response.data;
};

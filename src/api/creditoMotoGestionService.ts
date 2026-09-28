import instance from "./axiosInstance";

import {
  CambiarEstadoCreditoMotoRequest,
  CreditoMotoGestionDetalle,
  CreditoMotoGestionLista,
  EstadoControlCredito,
} from "../types/creditoMotoGestion";

const API_URL = "/creditos/motos/solicitudes";

type ApiEnvelope<T> = {
  Success?: boolean;
  success?: boolean;

  Data?: T;
  data?: T;

  Message?: string;
  message?: string;

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
    throw new Error(
      "La API no devolvió datos para la operación solicitada.",
    );
  }

  return data;
};

export const obtenerMensajeError = (error: unknown): string => {
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

// =========================================================
// LISTAR
// =========================================================

export const listarSolicitudesCreditoMoto = async (
  estado?: EstadoControlCredito | "TODOS",
  buscar?: string,
  fecha?: string,
): Promise<CreditoMotoGestionLista[]> => {
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

  const response = await instance.get<
    ApiEnvelope<CreditoMotoGestionLista[]>
  >(API_URL, {
    params,
  });

  return extraerData(response.data);
};

// =========================================================
// DETALLE
// =========================================================

export const obtenerSolicitudCreditoMoto = async (
  idSolicitudCredito: number,
): Promise<CreditoMotoGestionDetalle> => {
  const response = await instance.get<
    ApiEnvelope<CreditoMotoGestionDetalle>
  >(`${API_URL}/${idSolicitudCredito}`);

  return extraerData(response.data);
};

// =========================================================
// MARCAR COMO ENVIADA A LA EMPRESA
// =========================================================

export const marcarSolicitudEnviadaEmpresa = async (
  idSolicitudCredito: number,
  observacion?: string,
): Promise<CreditoMotoGestionDetalle> => {
  const payload: CambiarEstadoCreditoMotoRequest = {
    estado: "ENVIADA_EMPRESA",
    observacion,
  };

  const response = await instance.patch<
    ApiEnvelope<CreditoMotoGestionDetalle>
  >(`${API_URL}/${idSolicitudCredito}/estado`, payload);

  return extraerData(response.data);
};

// =========================================================
// CAMBIAR ESTADO GENERICO
// Se mantiene por compatibilidad con otros usos del front.
// =========================================================

export const cambiarEstadoSolicitudCreditoMoto = async (
  idSolicitudCredito: number,
  payload: CambiarEstadoCreditoMotoRequest,
): Promise<CreditoMotoGestionDetalle> => {
  const response = await instance.patch<
    ApiEnvelope<CreditoMotoGestionDetalle>
  >(`${API_URL}/${idSolicitudCredito}/estado`, payload);

  return extraerData(response.data);
};

// =========================================================
// DOCUMENTO
// =========================================================

export const obtenerDocumentoCreditoMoto = async (
  idSolicitudCredito: number,
  idDocumento: number,
): Promise<Blob> => {
  const response = await instance.get(
    `${API_URL}/${idSolicitudCredito}/documentos/${idDocumento}/archivo`,
    {
      responseType: "blob",
    },
  );

  return response.data;
};

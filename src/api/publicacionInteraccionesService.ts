import instance from "./axiosInstance";
import { getVisitorId } from "../utils/visitorId";

type ApiResponseCompat<T> = {
  Success?: boolean;
  Message?: string;
  Errors?: string[];
  Data?: T;

  success?: boolean;
  message?: string;
  errors?: string[];
  data?: T;
};

export type FavoritoResponse = {
  esFavorito: boolean;
  cantidadFavoritos: number;
};

const API_URL = "/PublicacionInteracciones";

const validarRespuesta = <T>(
  result: ApiResponseCompat<T>,
  mensajeDefault: string,
): T => {
  const success = result.Success ?? result.success;
  const message = result.Message ?? result.message;
  const errors = result.Errors ?? result.errors;
  const data = result.Data ?? result.data;

  if (!success) {
    throw new Error(message || errors?.[0] || mensajeDefault);
  }

  return data as T;
};

const obtenerMensajeError = (error: any, mensajeDefault: string) => {
  return (
    error?.response?.data?.Message ||
    error?.response?.data?.message ||
    error?.response?.data?.Errors?.[0] ||
    error?.response?.data?.errors?.[0] ||
    error?.message ||
    mensajeDefault
  );
};

export const toggleFavoritoPublicacion = async (
  idPublicacion: number,
): Promise<FavoritoResponse> => {
  try {
    const response = await instance.post<ApiResponseCompat<FavoritoResponse>>(
      `${API_URL}/favorito`,
      {
        idPublicacion,
        visitorId: getVisitorId(),
      },
    );

    return validarRespuesta(
      response.data,
      "No se pudo actualizar el favorito.",
    );
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(error, "No se pudo actualizar el favorito."),
    );
  }
};

export const registrarVistaPublicacion = async (
  idPublicacion: number,
): Promise<void> => {
  try {
    const response = await instance.post<ApiResponseCompat<any>>(
      `${API_URL}/registrar-vista`,
      {
        idPublicacion,
        visitorId: getVisitorId(),
      },
    );

    validarRespuesta(response.data, "No se pudo registrar la vista.");
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(error, "No se pudo registrar la vista."),
    );
  }
};

export const registrarClickWhatsapp = async (
  idPublicacion: number,
): Promise<void> => {
  try {
    const response = await instance.post<ApiResponseCompat<any>>(
      `${API_URL}/registrar-click-whatsapp`,
      {
        idPublicacion,
        visitorId: getVisitorId(),
      },
    );

    validarRespuesta(
      response.data,
      "No se pudo registrar el click de WhatsApp.",
    );
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(error, "No se pudo registrar el click de WhatsApp."),
    );
  }
};
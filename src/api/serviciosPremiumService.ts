import instance from "./axiosInstance";

import {
  ActivarServicioPremiumRequest,
  CancelarServicioPremiumRequest,
  CrearSolicitudServicioPremiumRequest,
  Datos,
  FiltrosServiciosPremium,
  ResumenServiciosPremium,
  ServicioPremium,
} from "../types/servicioPremium.types";

interface ApiResponse<T> {
  Success?: boolean;
  success?: boolean;

  Data?: T;
  data?: T;

  Errors?: string[];
  errors?: string[];

  Message?: string;
  message?: string;
}

const API_URL = "/ServiciosPremium";

const ADMIN_API_URL =
  "/admin/servicios-premium";

const obtenerMensajeError = (
  error: any,
  mensajeDefault: string,
) => {
  return (
    error?.response?.data?.Message ||
    error?.response?.data?.message ||
    error?.response?.data?.Errors?.[0] ||
    error?.response?.data?.errors?.[0] ||
    error?.message ||
    mensajeDefault
  );
};

const obtenerData = <T>(
  response: ApiResponse<T>,
  mensajeDefault: string,
): T => {
  const success =
    response.Success ??
    response.success ??
    false;

  const data =
    response.Data ??
    response.data;

  const errors =
    response.Errors ??
    response.errors ??
    [];

  const message =
    response.Message ??
    response.message;

  if (!success || data === undefined || data === null) {
    throw new Error(
      message ||
      errors[0] ||
      mensajeDefault,
    );
  }

  return data;
};

const mapearServicioPremium = (
  data: any,
): ServicioPremium => {
  return {
    id:
      data?.id ??
      data?.Id ??
      0,

    idVendedor:
      data?.idVendedor ??
      data?.IdVendedor ??
      0,

    idUsuarioVendedor:
      data?.idUsuarioVendedor ??
      data?.IdUsuarioVendedor ??
      0,

    nombreNegocio:
      data?.nombreNegocio ??
      data?.NombreNegocio ??
      "",

    nombreUsuarioVendedor:
      data?.nombreUsuarioVendedor ??
      data?.NombreUsuarioVendedor ??
      null,

    idPublicacion:
      data?.idPublicacion ??
      data?.IdPublicacion ??
      null,

    tituloPublicacion:
      data?.tituloPublicacion ??
      data?.TituloPublicacion ??
      null,

    idTemporada:
      data?.idTemporada ??
      data?.IdTemporada ??
      null,

    nombreTemporada:
      data?.nombreTemporada ??
      data?.NombreTemporada ??
      null,

    tipoServicio:
      data?.tipoServicio ??
      data?.TipoServicio ??
      "",

    estado:
      data?.estado ??
      data?.Estado ??
      "",

    fechaSolicitud:
      data?.fechaSolicitud ??
      data?.FechaSolicitud ??
      "",

    fechaInicio:
      data?.fechaInicio ??
      data?.FechaInicio ??
      null,

    fechaFin:
      data?.fechaFin ??
      data?.FechaFin ??
      null,

    fechaPago:
      data?.fechaPago ??
      data?.FechaPago ??
      null,

    monto:
      data?.monto ??
      data?.Monto ??
      null,

    medioPago:
      data?.medioPago ??
      data?.MedioPago ??
      null,

    referenciaPago:
      data?.referenciaPago ??
      data?.ReferenciaPago ??
      null,

    observacion:
      data?.observacion ??
      data?.Observacion ??
      null,

    idUsuarioAdmin:
      data?.idUsuarioAdmin ??
      data?.IdUsuarioAdmin ??
      null,

    nombreUsuarioAdmin:
      data?.nombreUsuarioAdmin ??
      data?.NombreUsuarioAdmin ??
      null,
  };
};

const mapearResumen = (
  data: any,
): ResumenServiciosPremium => {
  return {
    solicitudesPendientes:
      data?.solicitudesPendientes ??
      data?.SolicitudesPendientes ??
      0,

    serviciosActivos:
      data?.serviciosActivos ??
      data?.ServiciosActivos ??
      0,

    proximosAVencer:
      data?.proximosAVencer ??
      data?.ProximosAVencer ??
      0,

    montoCobrado:
      data?.montoCobrado ??
      data?.MontoCobrado ??
      0,
  };
};

/**
 * Registra una solicitud Premium antes de abrir WhatsApp.
 */
export const solicitarServicioPremium =
  async (
    request: CrearSolicitudServicioPremiumRequest,
  ): Promise<number> => {
    try {
      const response =
        await instance.post<
          ApiResponse<number>
        >(
          `${API_URL}/solicitar`,
          request,
        );

      return obtenerData(
        response.data,
        "No se pudo registrar la solicitud Premium.",
      );
    } catch (error: any) {
      throw new Error(
        obtenerMensajeError(
          error,
          "No se pudo registrar la solicitud Premium.",
        ),
      );
    }
  };

/**
 * Un problema temporal de API no debe bloquear
 * el contacto comercial mediante WhatsApp.
 */
export const intentarRegistrarSolicitudPremium =
  async (
    request: CrearSolicitudServicioPremiumRequest,
  ): Promise<void> => {
    try {
      await solicitarServicioPremium(
        request,
      );
    } catch (error) {
      console.warn(
        "No se pudo registrar la solicitud Premium:",
        error,
      );
    }
  };

/**
 * Lista servicios Premium usando filtros y paginación.
 */
export const obtenerServiciosPremiumAdmin =
  async (
    filtros: FiltrosServiciosPremium = {},
  ): Promise<
    Datos<ServicioPremium[]>
  > => {
    try {
      const response =
        await instance.get<
          ApiResponse<any>
        >(
          ADMIN_API_URL,
          {
            params: filtros,
          },
        );

      const data =
        obtenerData<any>(
          response.data,
          "No se pudieron obtener los servicios Premium.",
        );

      const items =
        data?.items ??
        data?.Items ??
        [];

      const totalRegistros =
        data?.totalRegistros ??
        data?.TotalRegistros ??
        0;

      return {
        items:
          items.map(
            mapearServicioPremium,
          ),

        totalRegistros:
          Number(
            totalRegistros,
          ),
      };
    } catch (error: any) {
      throw new Error(
        obtenerMensajeError(
          error,
          "No se pudieron obtener los servicios Premium.",
        ),
      );
    }
  };

/**
 * Obtiene los indicadores superiores del dashboard.
 */
export const obtenerResumenServiciosPremiumAdmin =
  async (): Promise<ResumenServiciosPremium> => {
    try {
      const response =
        await instance.get<
          ApiResponse<any>
        >(
          `${ADMIN_API_URL}/resumen`,
        );

      const data =
        obtenerData<any>(
          response.data,
          "No se pudo obtener el resumen Premium.",
        );

      return mapearResumen(
        data,
      );
    } catch (error: any) {
      throw new Error(
        obtenerMensajeError(
          error,
          "No se pudo obtener el resumen Premium.",
        ),
      );
    }
  };

/**
 * Confirma el pago y habilita el beneficio.
 */
export const activarServicioPremiumAdmin =
  async (
    idServicio: number,
    request: ActivarServicioPremiumRequest,
  ): Promise<void> => {
    try {
      const response =
        await instance.post<
          ApiResponse<boolean>
        >(
          `${ADMIN_API_URL}/${idServicio}/activar`,
          request,
        );

      obtenerData(
        response.data,
        "No se pudo activar el servicio Premium.",
      );
    } catch (error: any) {
      throw new Error(
        obtenerMensajeError(
          error,
          "No se pudo activar el servicio Premium.",
        ),
      );
    }
  };

/**
 * Cancela una solicitud o retira un beneficio activo.
 */
export const cancelarServicioPremiumAdmin =
  async (
    idServicio: number,
    request: CancelarServicioPremiumRequest,
  ): Promise<void> => {
    try {
      const response =
        await instance.post<
          ApiResponse<boolean>
        >(
          `${ADMIN_API_URL}/${idServicio}/cancelar`,
          request,
        );

      obtenerData(
        response.data,
        "No se pudo cancelar el servicio Premium.",
      );
    } catch (error: any) {
      throw new Error(
        obtenerMensajeError(
          error,
          "No se pudo cancelar el servicio Premium.",
        ),
      );
    }
  };
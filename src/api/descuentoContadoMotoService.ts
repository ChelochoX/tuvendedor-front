import instance from "./axiosInstance";

import {
  CrearModeloConExcepcionDescuentoRequest,
  DescuentoContadoConfiguracion,
  DescuentoContadoMarca,
  GuardarDescuentoContadoMesRequest,
} from "../types/descuentoContadoMoto";


const API_URL =
  "/creditos/motos/descuentos-contado";


type ApiEnvelope<T> = {
  Success?: boolean;
  success?: boolean;

  Data?: T;
  data?: T;

  Message?: string | null;
  message?: string | null;

  Errors?: string[];
  errors?: string[];

  StatusCode?: number;
  statusCode?: number;
};


const extraerData = <T>(
  respuesta: ApiEnvelope<T>,
): T => {

  const success =
    respuesta.Success ??
    respuesta.success ??
    true;


  if (!success) {

    const errores =
      respuesta.Errors ??
      respuesta.errors ??
      [];


    const mensaje =
      respuesta.Message ??
      respuesta.message ??
      errores[0] ??
      "No se pudo completar la operación.";


    throw new Error(
      mensaje,
    );
  }


  const data =
    respuesta.Data ??
    respuesta.data;


  if (
    data === undefined ||
    data === null
  ) {
    throw new Error(
      "La API no devolvió datos.",
    );
  }


  return data;
};


export const obtenerMensajeErrorDescuento =
  (
    error: unknown,
  ): string => {

    const anyError =
      error as any;


    const responseData =
      anyError?.response?.data;


    return (
      responseData?.Message ??
      responseData?.message ??
      responseData?.Errors?.[0] ??
      responseData?.errors?.[0] ??
      anyError?.message ??
      "Ocurrió un error inesperado."
    );
  };


export const listarMarcasDescuentoContado =
  async (): Promise<
    DescuentoContadoMarca[]
  > => {

    const response =
      await instance.get<
        ApiEnvelope<
          DescuentoContadoMarca[]
        >
      >(
        `${API_URL}/marcas`,
      );


    return extraerData(
      response.data,
    );
  };


export const obtenerConfiguracionDescuentoContado =
  async (
    idMarca: number,
    anio: number,
    mes: number,
  ): Promise<
    DescuentoContadoConfiguracion
  > => {

    const response =
      await instance.get<
        ApiEnvelope<
          DescuentoContadoConfiguracion
        >
      >(
        `${API_URL}/configuracion`,
        {
          params: {
            idMarca,
            anio,
            mes,
          },
        },
      );


    return extraerData(
      response.data,
    );
  };


export const guardarConfiguracionDescuentoContado =
  async (
    request:
      GuardarDescuentoContadoMesRequest,
  ): Promise<
    DescuentoContadoConfiguracion
  > => {

    const response =
      await instance.put<
        ApiEnvelope<
          DescuentoContadoConfiguracion
        >
      >(
        `${API_URL}/configuracion`,
        request,
      );


    return extraerData(
      response.data,
    );
  };


// =========================================================
// CREAR MODELO + EXCEPCION
// =========================================================

export const crearModeloConExcepcionDescuento =
  async (
    request:
      CrearModeloConExcepcionDescuentoRequest,
  ): Promise<
    DescuentoContadoConfiguracion
  > => {

    const response =
      await instance.post<
        ApiEnvelope<
          DescuentoContadoConfiguracion
        >
      >(
        `${API_URL}/modelos-excepcion`,
        request,
      );


    return extraerData(
      response.data,
    );
  };
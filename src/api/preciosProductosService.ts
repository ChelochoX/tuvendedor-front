import instance from "./axiosInstance";
import { ApiResponse } from "../types/api";
import { ModeloProducto } from "types/modeloProducto";

const API_URL = "/PreciosProductos";

/* ===============================
   MODELOS
================================ */

const obtenerModelos = async (): Promise<ModeloProducto[]> => {
  const { data } = await instance.get<ApiResponse<ModeloProducto[]>>(
    `${API_URL}/listar-modelos`
  );

  if (!data.Success) {
    throw new Error(data.Message || "Error al obtener modelos");
  }

  return data.Data;
};

const crearModelo = async (payload: {
  idMarca: number;
  nombreModelo: string;
  codigoReferencia: string;
  rubro: string;
}) => {
  const { data } = await instance.post<ApiResponse<any>>(
    `${API_URL}/crear-modelo`,
    payload
  );

  if (!data.Success) {
    throw new Error(data.Message || "Error al crear modelo");
  }

  return data.Data;
};

/* ===============================
   LISTA DE PRECIOS (NORMAL / PROMO)
================================ */

const crearListaPrecio = async (payload: {
  idModeloProducto: number;
  precioPublico: number;
  precioDistribuidor: number;
  precioBase: number;
  fechaDesde: string;
  fechaHasta?: string;
  esPromo: boolean;
  observacion?: string;
}) => {
  const { data } = await instance.post<ApiResponse<any>>(
    `${API_URL}/crear-lista-precio`,
    payload
  );

  if (!data.Success) {
    throw new Error(data.Message || "Error al crear precio");
  }

  return data.Data;
};

/* ===============================
   PLAN DE FINANCIACIÓN
================================ */

const crearPlan = async (payload: {
  idListaPrecio: number;
  entregaInicial: number;
  cantidadCuotas: number;
  importeCuota: number;
  interes?: number;
  codigoPlan?: string;
}) => {
  const { data } = await instance.post<ApiResponse<any>>(
    `${API_URL}/crear-plan`,
    payload
  );

  if (!data.Success) {
    throw new Error(data.Message || "Error al crear plan");
  }

  return data.Data;
};

export default {
  obtenerModelos,
  crearModelo,
  crearListaPrecio,
  crearPlan,
};

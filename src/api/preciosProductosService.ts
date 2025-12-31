import axiosInstance from "./axiosInstance";

export interface CrearModeloProductoRequest {
  idMarca: number;
  rubro: string;
  codigoReferencia: string;
  nombreModelo: string;
  cilindrada?: number;
  categoria?: string;
}

export interface CrearListaPrecioProductoRequest {
  idModeloProducto: number;
  precioPublico: number;
  precioDistribuidor: number;
  precioBase: number;
  fechaDesde: string; // yyyy-MM-dd
  fechaHasta?: string;
}

export interface CrearPlanFinanciacionProductoRequest {
  idListaPrecio: number;
  entregaInicial: number;
  cantidadCuotas: number;
  importeCuota: number;
  interes?: number;
  codigoPlan?: string;
}

export interface PlanFinanciacionDto {
  id: number;
  entregaInicial: number;
  cantidadCuotas: number;
  importeCuota: number;
  interes?: number;
  codigoPlan?: string;
}

export interface PrecioVigenteProductoDto {
  idModeloProducto: number;
  rubro: string;
  codigoReferencia: string;
  nombreModelo: string;
  marca: string;

  idListaPrecio: number;
  precioPublico: number;
  precioDistribuidor: number;
  precioBase: number;

  fechaDesde: string;
  fechaHasta?: string;

  planes: PlanFinanciacionDto[];
}

const preciosProductosService = {
  crearModelo: async (request: CrearModeloProductoRequest): Promise<number> => {
    const { data } = await axiosInstance.post(
      "/api/preciosproductos/crear-modelo",
      request
    );
    return data.data.id;
  },

  crearListaPrecio: async (
    request: CrearListaPrecioProductoRequest
  ): Promise<number> => {
    const { data } = await axiosInstance.post(
      "/api/preciosproductos/crear-lista-precio",
      request
    );
    return data.data.id;
  },

  crearPlan: async (
    request: CrearPlanFinanciacionProductoRequest
  ): Promise<number> => {
    const { data } = await axiosInstance.post(
      "/api/preciosproductos/crear-plan",
      request
    );
    return data.data.id;
  },

  obtenerPrecioVigente: async (
    rubro: string,
    codigo: string,
    fecha?: string
  ): Promise<PrecioVigenteProductoDto> => {
    const { data } = await axiosInstance.get(
      "/api/preciosproductos/precio-vigente",
      {
        params: { rubro, codigo, fecha },
      }
    );
    return data.data;
  },
};

export default preciosProductosService;

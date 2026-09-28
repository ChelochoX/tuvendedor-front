export interface DescuentoContadoMarca {
  idMarca: number;
  marca: string;
}


export interface DescuentoContadoModelo {
  idModeloProducto: number;

  codigoReferencia: string;
  nombreModelo: string;

  cilindrada?: number | null;

  idReglaEspecifica?: number | null;

  porcentajeExcepcion?: number | null;
  porcentajeEfectivo?: number | null;

  tieneExcepcion: boolean;

  fechaDesdeReglaEspecifica?: string | null;
  fechaHastaReglaEspecifica?: string | null;

  reglaEspecificaEsDelMes: boolean;
}


export interface DescuentoContadoConfiguracion {
  idMarca: number;

  marca: string;

  anio: number;
  mes: number;

  fechaDesde: string;
  fechaHasta: string;

  idReglaGeneral?: number | null;

  porcentajeGeneral?: number | null;

  fechaDesdeReglaGeneral?: string | null;
  fechaHastaReglaGeneral?: string | null;

  reglaGeneralEsDelMes: boolean;

  modelos: DescuentoContadoModelo[];
}


export interface GuardarDescuentoContadoModeloRequest {
  idModeloProducto: number;
  porcentajeDescuento: number;
}


export interface GuardarDescuentoContadoMesRequest {
  idMarca: number;

  anio: number;
  mes: number;

  porcentajeGeneral: number;

  excepciones:
    GuardarDescuentoContadoModeloRequest[];
}


// =========================================================
// NUEVO MODELO + EXCEPCION
// =========================================================

export interface CrearModeloConExcepcionDescuentoRequest {
  idMarca: number;

  anio: number;
  mes: number;

  codigoReferencia: string;
  nombreModelo: string;

  cilindrada?: number | null;

  categoria?: string | null;

  porcentajeDescuento: number;
}
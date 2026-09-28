export type EstadoControlCredito =
  | "PENDIENTE_ENVIO"
  | "ENVIADA_EMPRESA";


export interface CreditoMotoGestionLista {
  idGestion: number;
  idSolicitudCredito: number;

  idConversacion: number;
  idContacto: number;
  idModeloProducto: number;

  marca?: string | null;
  modelo?: string | null;
  codigoReferencia?: string | null;

  nombreCompleto?: string | null;
  cedula?: string | null;
  telefono?: string | null;

  estadoSolicitud: string;
  resultadoPreEvaluacion?: string | null;

  estadoControl: EstadoControlCredito;

  idUsuarioAsignado?: number | null;
  usuarioAsignado?: string | null;

  fechaRecepcion: string;
  fechaUltimaGestion?: string | null;
  fechaCierreControl?: string | null;
}


export interface CreditoMotoLaboral {
  empresa?: string | null;

  antiguedadMeses: number;

  aportaIPS: boolean;
  cantidadAportesIPS: number;

  cargo?: string | null;
  salario?: number | null;
  tipoPago?: string | null;

  direccionEmpresa?: string | null;
  telefonoEmpresa?: string | null;

  telefonoEmpresaEsMovil?: boolean | null;

  nombreJefeEncargado?: string | null;
}


export interface CreditoMotoReferencia {
  id: number;

  tipo: string;

  nombre: string;
  telefono: string;

  parentesco?: string | null;
  observacion?: string | null;
}


export interface CreditoMotoDocumento {
  id: number;

  tipoDocumento: string;

  nombreArchivo: string;
  mimeType: string;

  estadoRevision: string;

  fechaRecepcion: string;
}


export interface CreditoMotoAutorizacion {
  id: number;

  versionAutorizacion: string;

  textoAutorizacion: string;
  mensajeOriginal: string;

  nombreCompleto: string;
  numeroCedula: string;

  canal: string;

  fechaAutorizacion: string;
}


export interface CreditoMotoHistorial {
  id: number;

  accion: string;

  estadoAnterior?: string | null;
  estadoNuevo?: string | null;

  observacion?: string | null;

  idUsuario?: number | null;
  usuario?: string | null;

  fecha: string;
}


export interface CreditoMotoGestionDetalle {
  idGestion: number;
  idSolicitudCredito: number;

  idConversacion: number;
  idContacto: number;
  idModeloProducto: number;

  idPublicacion?: number | null;

  marca?: string | null;
  modelo?: string | null;
  codigoReferencia?: string | null;

  cilindrada?: number | null;

  nombreCompleto?: string | null;
  cedula?: string | null;
  fechaNacimiento?: string | null;
  telefono?: string | null;

  ciudad?: string | null;
  barrio?: string | null;
  direccion?: string | null;

  estadoSolicitud: string;
  pasoActual: string;

  resultadoPreEvaluacion?: string | null;
  motivoPreEvaluacion?: string | null;

  viaEvaluacion?: string | null;
  estadoCedula?: string | null;

  observacionSolicitud?: string | null;

  fechaCreacion?: string | null;
  fechaActualizacion?: string | null;
  fechaCierre?: string | null;

  estadoControl: EstadoControlCredito;

  idUsuarioAsignado?: number | null;
  usuarioAsignado?: string | null;

  observacionInterna?: string | null;

  fechaRecepcion: string;
  fechaUltimaGestion?: string | null;
  fechaCierreControl?: string | null;

  laboral?: CreditoMotoLaboral | null;

  referencias: CreditoMotoReferencia[];

  documentos: CreditoMotoDocumento[];

  autorizacion?: CreditoMotoAutorizacion | null;

  historial: CreditoMotoHistorial[];
}


export interface CambiarEstadoCreditoMotoRequest {
  estado: EstadoControlCredito;

  observacion?: string;
}
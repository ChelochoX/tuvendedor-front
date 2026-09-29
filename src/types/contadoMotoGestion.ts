export type EstadoControlContado =
  | "PENDIENTE_CONTACTO"
  | "CONTACTADO"
  | "CONCRETADA"
  | "NO_CONCRETADA";

export interface ContadoMotoGestionLista {
  idGestion: number;
  idSolicitudContado: number;

  idConversacion: number;
  idContacto: number;
  idModeloProducto: number;

  marca?: string | null;
  modelo?: string | null;
  codigoReferencia?: string | null;

  nombreCompleto?: string | null;
  cedula?: string | null;
  telefono?: string | null;

  estadoSolicitud?: string | null;
  pasoActual?: string | null;
  estadoCedula?: string | null;

  estadoControl: EstadoControlContado;
  prioridad: "URGENTE" | "NORMAL" | string;

  idUsuarioAsignado?: number | null;
  observacionInterna?: string | null;

  fechaRecepcion: string;
  fechaUltimaGestion?: string | null;
  fechaCierreControl?: string | null;
}

export interface ContadoMotoDocumento {
  id: number;
  tipoDocumento: string;
  nombreArchivo: string;
  mimeType: string;
  estadoRevision?: string | null;
  fechaRecepcion?: string | null;
}

export interface ContadoMotoGestionHistorial {
  id: number;
  idSolicitudContado: number;
  accion: string;
  estadoAnterior?: string | null;
  estadoNuevo?: string | null;
  observacion?: string | null;
  idUsuario?: number | null;
  fecha: string;
}

export interface ContadoMotoGestionDetalle
  extends ContadoMotoGestionLista {
  direccion?: string | null;
  barrio?: string | null;
  ciudad?: string | null;

  documentos: ContadoMotoDocumento[];
  historial: ContadoMotoGestionHistorial[];
}

export interface CambiarEstadoContadoMotoRequest {
  estado: Exclude<EstadoControlContado, "PENDIENTE_CONTACTO">;
  observacion?: string;
}

// src/types/clientes.ts

export type EstadoRegistroInteresado = "Activo" | "Inactivo";

export type EstadoConsultaInteresado =
  | "REGISTRADO"
  | "CONSULTANDO"
  | "ESPERANDO_MODELO"
  | "CONSULTA_PROMO"
  | "COTIZADO"
  | "PENDIENTE_ASESOR"
  | "CREDITO_EN_PROCESO"
  | "CONTADO_EN_PROCESO"
  | "DERIVADO_HUMANO"
  | "CERRADO"
  | "SIN_RESPUESTA"
  | string;

export interface InteresadoRequest {
  nombre: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  productoInteres?: string;
  fechaProximoContacto?: string;
  descripcion?: string;
  aportaIPS: boolean;
  cantidadAportes: number;
  archivoConversacion?: File | null;
  estado: EstadoRegistroInteresado;
}

export interface Interesado {
  id: number;

  nombre: string;
  telefono?: string | null;
  email?: string | null;
  ciudad?: string | null;
  productoInteres?: string | null;

  fechaRegistro: string;
  fechaProximoContacto?: string | null;

  estado: EstadoRegistroInteresado;

  descripcion?: string | null;
  usuarioResponsable?: string | null;

  aportaIPS: boolean;
  cantidadAportes: number;

  archivoUrl?: string | null;
  archivoConversacion?: File | null;

  // CRM / WhatsApp
  origen?: string | null;
  identificadorExterno?: string | null;
  idConversacion?: number | null;
  idModeloProducto?: number | null;
  idPublicacion?: number | null;

  marcaInteres?: string | null;
  modeloInteres?: string | null;
  codigoReferencia?: string | null;

  estadoConsulta?: EstadoConsultaInteresado | null;
  estadoGestion?: EstadoConsultaInteresado | null;

  tipoOperacion?: string | null;
  idSolicitudOperacion?: number | null;
  pasoOperacion?: string | null;

  requiereSeguimiento: boolean;
  motivoSeguimiento?: string | null;

  fechaUltimoMensajeCliente?: string | null;
  fechaUltimaRespuesta?: string | null;
  fechaUltimaInteraccion?: string | null;

  ultimoMensajeCliente?: string | null;
  ultimaRespuesta?: string | null;

  cantidadInteracciones: number;

  sinRespuesta: boolean;
  seguimientoVencido: boolean;
}

export interface SeguimientoRequest {
  idInteresado: number;
  comentario: string;
}

export interface Seguimiento {
  id: number;
  idInteresado: number;
  fecha: string;
  comentario: string;
  usuario?: string | null;
}

export interface FiltroInteresadosRequest {
  nombre?: string;
  estado?: string;
  origen?: string;
  estadoConsulta?: string;

  soloSeguimiento?: boolean;
  soloSinRespuesta?: boolean;
  soloSeguimientoVencido?: boolean;

  fechaRegistroDesde?: string;
  fechaRegistroHasta?: string;
  fechaProximoContactoDesde?: string;
  fechaProximoContactoHasta?: string;

  numeroPagina: number;
  registrosPorPagina: number;
}

export interface InteresadoConsultaMoto {
  id: number;
  idInteresado: number;
  idConversacion: number;

  idModeloProducto?: number | null;
  idPublicacion?: number | null;

  marca?: string | null;
  modelo?: string | null;
  codigoReferencia?: string | null;

  tipoConsulta?: string | null;
  estadoConsulta?: string | null;

  tipoOperacion?: string | null;
  idSolicitudOperacion?: number | null;
  pasoOperacion?: string | null;

  ultimoMensajeCliente?: string | null;
  ultimaRespuesta?: string | null;

  fechaPrimeraConsulta: string;
  fechaUltimaConsulta: string;

  cantidadInteracciones: number;
}

export interface MensajeConversacionHistorial {
  id?: number;
  emisor: string;
  mensaje: string;
  fecha: string;
}

export interface InteresadoDetalle {
  interesado: Interesado;
  consultasMoto: InteresadoConsultaMoto[];
  ultimosMensajes: MensajeConversacionHistorial[];
  seguimientos: Seguimiento[];
}

export interface InteresadosResumen {
  totalActivos: number;
  nuevosDelDia: number;
  pendientesSeguimiento: number;
  seguimientosVencidos: number;
  sinRespuesta: number;
  consultando: number;
  cotizados: number;
  creditoEnProceso: number;
  contadoEnProceso: number;
  derivadosHumano: number;
}

export interface ActualizarSeguimientoInteresadoRequest {
  fechaProximoContacto?: string | null;
  requiereSeguimiento?: boolean | null;
  motivoSeguimiento?: string | null;
  estadoConsulta?: string | null;
  comentario?: string | null;
}

// Alias conservados por compatibilidad con imports viejos.
export type InteresadoDto = Interesado;
export type SeguimientoDto = Seguimiento;

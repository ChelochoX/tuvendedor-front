export const TIPOS_SERVICIO_PREMIUM = {
  VITRINA_PROFESIONAL: "VITRINA_PROFESIONAL",
  PUBLICACION_DESTACADA: "PUBLICACION_DESTACADA",
  PUBLICACION_ESPECIAL: "PUBLICACION_ESPECIAL",
  BANNER_MARKETPLACE: "BANNER_MARKETPLACE",
} as const;

export type TipoServicioPremium =
  (typeof TIPOS_SERVICIO_PREMIUM)[keyof typeof TIPOS_SERVICIO_PREMIUM];

export const ESTADOS_SERVICIO_PREMIUM = {
  SOLICITADO: "SOLICITADO",
  PENDIENTE_PAGO: "PENDIENTE_PAGO",
  ACTIVO: "ACTIVO",
  VENCIDO: "VENCIDO",
  CANCELADO: "CANCELADO",
} as const;

export type EstadoServicioPremium =
  (typeof ESTADOS_SERVICIO_PREMIUM)[keyof typeof ESTADOS_SERVICIO_PREMIUM];

export interface CrearSolicitudServicioPremiumRequest {
  tipoServicio: TipoServicioPremium;
  idPublicacion?: number;
  observacion?: string;
}

export interface ActivarServicioPremiumRequest {
  fechaInicio?: string;
  fechaFin?: string;
  duracionDias?: number;
  idTemporada?: number;
  modoActivacionEspecial?: "DIAS" | "TEMPORADA";
  monto?: number;
  medioPago?: string;
  referenciaPago?: string;
  observacion?: string;
  badgeTexto?: string;
  badgeColor?: string;
}

export interface CancelarServicioPremiumRequest {
  observacion?: string;
}

export interface ServicioPremium {
  id: number;

  idVendedor: number;
  idUsuarioVendedor: number;
  nombreNegocio: string;
  nombreUsuarioVendedor?: string | null;

  idPublicacion?: number | null;
  tituloPublicacion?: string | null;

  idTemporada?: number | null;
  nombreTemporada?: string | null;

  tipoServicio: TipoServicioPremium | string;
  estado: EstadoServicioPremium | string;

  fechaSolicitud: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  fechaPago?: string | null;

  monto?: number | null;
  medioPago?: string | null;
  referenciaPago?: string | null;
  observacion?: string | null;

  idUsuarioAdmin?: number | null;
  nombreUsuarioAdmin?: string | null;
}

export interface ResumenServiciosPremium {
  solicitudesPendientes: number;
  serviciosActivos: number;
  proximosAVencer: number;
  montoCobrado: number;
}

export interface FiltrosServiciosPremium {
  estado?: string;
  tipoServicio?: string;
  cliente?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  pagina?: number;
  tamanioPagina?: number;
}

export interface Datos<T> {
  items: T;
  totalRegistros: number;
}

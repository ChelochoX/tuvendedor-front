export const BANNER_UBICACIONES = {
  HOME_TOP: "HOME_TOP",
  HOME_INLINE: "HOME_INLINE",
} as const;

export type BannerUbicacion =
  (typeof BANNER_UBICACIONES)[keyof typeof BANNER_UBICACIONES];

export const BANNER_EVENTOS = {
  IMPRESION: "IMPRESION",
  CLICK: "CLICK",
  WHATSAPP: "WHATSAPP",
} as const;

export type BannerEventoTipo =
  (typeof BANNER_EVENTOS)[keyof typeof BANNER_EVENTOS];

export const BANNER_ESTADOS = {
  BORRADOR: "BORRADOR",
  ACTIVO: "ACTIVO",
  PAUSADO: "PAUSADO",
} as const;

export type BannerEstado =
  (typeof BANNER_ESTADOS)[keyof typeof BANNER_ESTADOS];

export const BANNER_TIPOS_DESTINO = {
  WEB: "WEB",
  FACEBOOK: "FACEBOOK",
  INSTAGRAM: "INSTAGRAM",
  WHATSAPP: "WHATSAPP",
  VITRINA_INTERNA: "VITRINA_INTERNA",
  OTRO: "OTRO",

  /**
   * Alias para no romper código anterior.
   * URL ahora se envía al backend como WEB.
   */
  URL: "WEB",

  /**
   * Alias para no romper código anterior.
   * PERFIL_PUBLICO ahora se envía al backend como VITRINA_INTERNA.
   */
  PERFIL_PUBLICO: "VITRINA_INTERNA",
} as const;

export type BannerTipoDestino =
  (typeof BANNER_TIPOS_DESTINO)[keyof typeof BANNER_TIPOS_DESTINO];

export type BannerPublicitarioId = number | string;

export interface BannerPublicitario {
  id: BannerPublicitarioId;

  titulo?: string | null;
  subtitulo?: string | null;
  descripcion?: string | null;
  etiqueta?: string | null;

  imagenDesktopUrl: string;
  imagenMobileUrl?: string | null;

  tipoDestino?: BannerTipoDestino | null;
  urlDestino?: string | null;
  whatsappUrl?: string | null;

  textoBoton?: string | null;
  mostrarBotonWhatsapp: boolean;
  textoBotonWhatsapp?: string | null;
  abrirNuevaPestana: boolean;

  ubicacion: BannerUbicacion;
  orden: number;
}

export interface BannersHomeResponse {
  homeTop: BannerPublicitario[];
  homeInline: BannerPublicitario[];
}

export interface RegistrarEventoBannerRequest {
  bannerPublicitarioId: BannerPublicitarioId;
  tipoEvento: BannerEventoTipo;
}

export interface BannerPublicitarioAdmin
  extends BannerPublicitario {
  nombreCliente: string;
  storageKey?: string | null;

  estado: BannerEstado;
  prioridad: number;
  esExclusivo: boolean;

  fechaInicio?: string | null;
  fechaFin?: string | null;

  cantidadImpresiones: number;
  cantidadClicks: number;
  cantidadWhatsapp: number;
  ctr: number;

  fechaCreacion?: string | null;
  fechaActualizacion?: string | null;
}

export interface FiltrosBannersPublicitariosAdmin {
  busqueda?: string;
  ubicacion?: BannerUbicacion | "";
  estado?: BannerEstado | "";
  pagina?: number;
  tamanioPagina?: number;
}

export interface ResultadoPaginadoBannersPublicitarios {
  items: BannerPublicitarioAdmin[];
  totalRegistros: number;
}

export interface ResumenBannersPublicitarios {
  totalBanners: number;
  bannersActivos: number;
  bannersPausados: number;
  bannersBorrador: number;

  cantidadImpresiones: number;
  cantidadClicks: number;
  cantidadWhatsapp: number;
  ctr: number;
}

export interface BannerMedidaConfiguracion {
  ubicacion: BannerUbicacion;
  desktop: string;
  mobile: string;
}

export interface ConfiguracionBannersPublicitarios {
  ubicaciones: BannerUbicacion[];
  tiposDestino: BannerTipoDestino[];
  estadosEditables: BannerEstado[];
  formatosPermitidos: string[];
  medidas: BannerMedidaConfiguracion[];
}

export interface BannerPublicitarioFormValues {
  nombreCliente: string;
  ubicacion: BannerUbicacion;

  titulo: string;
  subtitulo: string;
  descripcion: string;
  etiqueta: string;

  tipoDestino: BannerTipoDestino;
  urlDestino: string;
  whatsappUrl: string;

  textoBoton: string;
  mostrarBotonWhatsapp: boolean;
  textoBotonWhatsapp: string;
  abrirNuevaPestana: boolean;

  fechaInicio: string;
  fechaFin: string;

  estado: BannerEstado;
  orden: number;
  prioridad: number;
  esExclusivo: boolean;

  eliminarImagenMobile: boolean;
}

export interface BannerPublicitarioArchivosForm {
  imagenDesktop?: File | null;
  imagenMobile?: File | null;
}
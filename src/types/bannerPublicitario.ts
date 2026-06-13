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

export type BannerPublicitarioId = number | string;

export interface BannerPublicitario {
  id: BannerPublicitarioId;
  titulo?: string | null;
  descripcion?: string | null;

  imagenDesktopUrl: string;
  imagenMobileUrl?: string | null;

  urlDestino?: string | null;
  whatsappUrl?: string | null;

  textoBoton?: string | null;
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
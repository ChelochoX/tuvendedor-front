export interface ComercialDashboardResumen {
  totalUsuariosRegistrados: number;
  totalVendedores: number;
  publicacionesTotales: number;
  publicacionesActivas: number;
  publicacionesDestacadasActivas: number;
  vistasPublicaciones: number;
  clicksWhatsappPublicaciones: number;
  favoritosActivos: number;
  solicitudesVisita: number;
  bannersActivos: number;
  impresionesBanners: number;
  clicksBanners: number;
  whatsAppBanners: number;
  ctrBanners: number;
  tasaWhatsappPublicaciones: number;
}

export interface ComercialDashboardSerieDiaria {
  fecha: string;
  vistasPublicaciones: number;
  clicksWhatsappPublicaciones: number;
  impresionesBanners: number;
  clicksBanners: number;
  whatsAppBanners: number;
  solicitudesVisita: number;
}

export interface ComercialDashboardTopPublicacion {
  idPublicacion: number;
  titulo: string;
  categoria: string;
  vendedor: string;
  vistas: number;
  clicksWhatsapp: number;
  favoritos: number;
}

export interface ComercialDashboardTopBanner {
  idBanner: number;
  nombreCliente: string;
  titulo: string;
  ubicacion: string;
  impresiones: number;
  clicks: number;
  whatsApp: number;
  ctr: number;
}

export interface ComercialDashboardRubro {
  rubro: string;
  publicacionesActivas: number;
  vistas: number;
  clicksWhatsapp: number;
}

export interface ComercialDashboard {
  fechaDesde: string;
  fechaHasta: string;
  resumen: ComercialDashboardResumen;
  serieDiaria: ComercialDashboardSerieDiaria[];
  topPublicaciones: ComercialDashboardTopPublicacion[];
  topBanners: ComercialDashboardTopBanner[];
  rubros: ComercialDashboardRubro[];
}

export interface FiltroComercialDashboard {
  fechaDesde?: string;
  fechaHasta?: string;
}

export type MetricaGraficoComercial =
  | "vistasPublicaciones"
  | "clicksWhatsappPublicaciones"
  | "impresionesBanners"
  | "clicksBanners"
  | "solicitudesVisita";
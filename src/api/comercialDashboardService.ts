import instance from "./axiosInstance";

import type {
  ComercialDashboard,
  ComercialDashboardResumen,
  ComercialDashboardRubro,
  ComercialDashboardSerieDiaria,
  ComercialDashboardTopBanner,
  ComercialDashboardTopPublicacion,
  FiltroComercialDashboard,
} from "../types/comercialDashboard";

interface ApiResponse<T> {
  Success?: boolean;
  success?: boolean;

  Data?: T;
  data?: T;

  Errors?: string[];
  errors?: string[];

  Message?: string;
  message?: string;
}

type JsonObject = Record<string, unknown>;

const ADMIN_DASHBOARD_ENDPOINT = "/admin/dashboard-comercial";

const RESUMEN_VACIO: ComercialDashboardResumen = {
  totalUsuariosRegistrados: 0,
  totalVendedores: 0,
  publicacionesTotales: 0,
  publicacionesActivas: 0,
  publicacionesDestacadasActivas: 0,
  vistasPublicaciones: 0,
  clicksWhatsappPublicaciones: 0,
  favoritosActivos: 0,
  solicitudesVisita: 0,
  bannersActivos: 0,
  impresionesBanners: 0,
  clicksBanners: 0,
  whatsAppBanners: 0,
  ctrBanners: 0,
  tasaWhatsappPublicaciones: 0,
};

function esObjeto(valor: unknown): valor is JsonObject {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function obtenerPrimerValor(
  objeto: JsonObject | null | undefined,
  nombres: string[],
): unknown {
  if (!objeto) {
    return undefined;
  }

  for (const nombre of nombres) {
    const valor = objeto[nombre];

    if (valor !== undefined && valor !== null) {
      return valor;
    }
  }

  return undefined;
}

function convertirNumero(valor: unknown, valorPredeterminado = 0): number {
  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : valorPredeterminado;
}

function convertirTexto(valor: unknown, valorPredeterminado = ""): string {
  if (valor === null || valor === undefined) {
    return valorPredeterminado;
  }

  return String(valor);
}

function extraerData<T>(
  respuesta: ApiResponse<T> | T,
  mensajePredeterminado: string,
): T {
  if (!esObjeto(respuesta)) {
    return respuesta as T;
  }

  const response = respuesta as ApiResponse<T>;

  if (response.Success === false || response.success === false) {
    throw new Error(
      response.Message ??
        response.message ??
        response.Errors?.[0] ??
        response.errors?.[0] ??
        mensajePredeterminado,
    );
  }

  return (response.Data ?? response.data ?? respuesta) as T;
}

function obtenerMensajeError(
  error: any,
  mensajePredeterminado: string,
): string {
  const errores =
    error?.response?.data?.Errors ?? error?.response?.data?.errors;

  if (Array.isArray(errores) && errores.length > 0) {
    return String(errores[0]);
  }

  return (
    error?.response?.data?.Message ??
    error?.response?.data?.message ??
    error?.response?.data?.title ??
    error?.message ??
    mensajePredeterminado
  );
}

function normalizarResumen(valor: unknown): ComercialDashboardResumen {
  if (!esObjeto(valor)) {
    return RESUMEN_VACIO;
  }

  return {
    totalUsuariosRegistrados: convertirNumero(
      obtenerPrimerValor(valor, [
        "totalUsuariosRegistrados",
        "TotalUsuariosRegistrados",
      ]),
    ),

    totalVendedores: convertirNumero(
      obtenerPrimerValor(valor, ["totalVendedores", "TotalVendedores"]),
    ),

    publicacionesTotales: convertirNumero(
      obtenerPrimerValor(valor, [
        "publicacionesTotales",
        "PublicacionesTotales",
      ]),
    ),

    publicacionesActivas: convertirNumero(
      obtenerPrimerValor(valor, [
        "publicacionesActivas",
        "PublicacionesActivas",
      ]),
    ),

    publicacionesDestacadasActivas: convertirNumero(
      obtenerPrimerValor(valor, [
        "publicacionesDestacadasActivas",
        "PublicacionesDestacadasActivas",
      ]),
    ),

    vistasPublicaciones: convertirNumero(
      obtenerPrimerValor(valor, [
        "vistasPublicaciones",
        "VistasPublicaciones",
      ]),
    ),

    clicksWhatsappPublicaciones: convertirNumero(
      obtenerPrimerValor(valor, [
        "clicksWhatsappPublicaciones",
        "clicksWhatsAppPublicaciones",
        "ClicksWhatsappPublicaciones",
        "ClicksWhatsAppPublicaciones",
      ]),
    ),

    favoritosActivos: convertirNumero(
      obtenerPrimerValor(valor, ["favoritosActivos", "FavoritosActivos"]),
    ),

    solicitudesVisita: convertirNumero(
      obtenerPrimerValor(valor, ["solicitudesVisita", "SolicitudesVisita"]),
    ),

    bannersActivos: convertirNumero(
      obtenerPrimerValor(valor, ["bannersActivos", "BannersActivos"]),
    ),

    impresionesBanners: convertirNumero(
      obtenerPrimerValor(valor, [
        "impresionesBanners",
        "ImpresionesBanners",
      ]),
    ),

    clicksBanners: convertirNumero(
      obtenerPrimerValor(valor, ["clicksBanners", "ClicksBanners"]),
    ),

    whatsAppBanners: convertirNumero(
      obtenerPrimerValor(valor, [
        "whatsAppBanners",
        "whatsappBanners",
        "WhatsAppBanners",
        "WhatsappBanners",
      ]),
    ),

    ctrBanners: convertirNumero(
      obtenerPrimerValor(valor, ["ctrBanners", "CtrBanners", "CTRBanners"]),
    ),

    tasaWhatsappPublicaciones: convertirNumero(
      obtenerPrimerValor(valor, [
        "tasaWhatsappPublicaciones",
        "tasaWhatsAppPublicaciones",
        "TasaWhatsappPublicaciones",
        "TasaWhatsAppPublicaciones",
      ]),
    ),
  };
}

function normalizarSerieDiaria(valor: unknown): ComercialDashboardSerieDiaria[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor
    .filter(esObjeto)
    .map((item) => ({
      fecha: convertirTexto(obtenerPrimerValor(item, ["fecha", "Fecha"])),

      vistasPublicaciones: convertirNumero(
        obtenerPrimerValor(item, [
          "vistasPublicaciones",
          "VistasPublicaciones",
        ]),
      ),

      clicksWhatsappPublicaciones: convertirNumero(
        obtenerPrimerValor(item, [
          "clicksWhatsappPublicaciones",
          "clicksWhatsAppPublicaciones",
          "ClicksWhatsappPublicaciones",
          "ClicksWhatsAppPublicaciones",
        ]),
      ),

      impresionesBanners: convertirNumero(
        obtenerPrimerValor(item, [
          "impresionesBanners",
          "ImpresionesBanners",
        ]),
      ),

      clicksBanners: convertirNumero(
        obtenerPrimerValor(item, ["clicksBanners", "ClicksBanners"]),
      ),

      whatsAppBanners: convertirNumero(
        obtenerPrimerValor(item, [
          "whatsAppBanners",
          "whatsappBanners",
          "WhatsAppBanners",
          "WhatsappBanners",
        ]),
      ),

      solicitudesVisita: convertirNumero(
        obtenerPrimerValor(item, ["solicitudesVisita", "SolicitudesVisita"]),
      ),
    }));
}

function normalizarTopPublicaciones(
  valor: unknown,
): ComercialDashboardTopPublicacion[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor.filter(esObjeto).map((item) => ({
    idPublicacion: convertirNumero(
      obtenerPrimerValor(item, ["idPublicacion", "IdPublicacion"]),
    ),

    titulo: convertirTexto(
      obtenerPrimerValor(item, ["titulo", "Titulo"]),
      "Sin título",
    ),

    categoria: convertirTexto(
      obtenerPrimerValor(item, ["categoria", "Categoria"]),
      "Sin categoría",
    ),

    vendedor: convertirTexto(
      obtenerPrimerValor(item, ["vendedor", "Vendedor"]),
      "Sin vendedor",
    ),

    vistas: convertirNumero(obtenerPrimerValor(item, ["vistas", "Vistas"])),

    clicksWhatsapp: convertirNumero(
      obtenerPrimerValor(item, [
        "clicksWhatsapp",
        "clicksWhatsApp",
        "ClicksWhatsapp",
        "ClicksWhatsApp",
      ]),
    ),

    favoritos: convertirNumero(
      obtenerPrimerValor(item, ["favoritos", "Favoritos"]),
    ),
  }));
}

function normalizarTopBanners(valor: unknown): ComercialDashboardTopBanner[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor.filter(esObjeto).map((item) => ({
    idBanner: convertirNumero(
      obtenerPrimerValor(item, ["idBanner", "IdBanner"]),
    ),

    nombreCliente: convertirTexto(
      obtenerPrimerValor(item, ["nombreCliente", "NombreCliente"]),
      "Sin cliente",
    ),

    titulo: convertirTexto(
      obtenerPrimerValor(item, ["titulo", "Titulo"]),
      "Sin título",
    ),

    ubicacion: convertirTexto(
      obtenerPrimerValor(item, ["ubicacion", "Ubicacion"]),
      "Sin ubicación",
    ),

    impresiones: convertirNumero(
      obtenerPrimerValor(item, ["impresiones", "Impresiones"]),
    ),

    clicks: convertirNumero(obtenerPrimerValor(item, ["clicks", "Clicks"])),

    whatsApp: convertirNumero(
      obtenerPrimerValor(item, [
        "whatsApp",
        "whatsapp",
        "WhatsApp",
        "Whatsapp",
      ]),
    ),

    ctr: convertirNumero(obtenerPrimerValor(item, ["ctr", "Ctr", "CTR"])),
  }));
}

function normalizarRubros(valor: unknown): ComercialDashboardRubro[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor.filter(esObjeto).map((item) => ({
    rubro: convertirTexto(
      obtenerPrimerValor(item, ["rubro", "Rubro"]),
      "Sin rubro",
    ),

    publicacionesActivas: convertirNumero(
      obtenerPrimerValor(item, [
        "publicacionesActivas",
        "PublicacionesActivas",
      ]),
    ),

    vistas: convertirNumero(obtenerPrimerValor(item, ["vistas", "Vistas"])),

    clicksWhatsapp: convertirNumero(
      obtenerPrimerValor(item, [
        "clicksWhatsapp",
        "clicksWhatsApp",
        "ClicksWhatsapp",
        "ClicksWhatsApp",
      ]),
    ),
  }));
}

function normalizarDashboard(valor: unknown): ComercialDashboard {
  const data = esObjeto(valor) ? valor : {};

  return {
    fechaDesde: convertirTexto(
      obtenerPrimerValor(data, ["fechaDesde", "FechaDesde"]),
    ),

    fechaHasta: convertirTexto(
      obtenerPrimerValor(data, ["fechaHasta", "FechaHasta"]),
    ),

    resumen: normalizarResumen(
      obtenerPrimerValor(data, ["resumen", "Resumen"]),
    ),

    serieDiaria: normalizarSerieDiaria(
      obtenerPrimerValor(data, ["serieDiaria", "SerieDiaria"]),
    ),

    topPublicaciones: normalizarTopPublicaciones(
      obtenerPrimerValor(data, ["topPublicaciones", "TopPublicaciones"]),
    ),

    topBanners: normalizarTopBanners(
      obtenerPrimerValor(data, ["topBanners", "TopBanners"]),
    ),

    rubros: normalizarRubros(obtenerPrimerValor(data, ["rubros", "Rubros"])),
  };
}

export async function obtenerDashboardComercial(
  filtro: FiltroComercialDashboard = {},
): Promise<ComercialDashboard> {
  try {
    const response = await instance.get<ApiResponse<unknown>>(
      ADMIN_DASHBOARD_ENDPOINT,
      {
        params: {
          fechaDesde: filtro.fechaDesde || undefined,
          fechaHasta: filtro.fechaHasta || undefined,
        },
      },
    );

    const data = extraerData<unknown>(
      response.data,
      "No se pudo obtener el dashboard comercial.",
    );

    return normalizarDashboard(data);
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(error, "No se pudo obtener el dashboard comercial."),
    );
  }
}
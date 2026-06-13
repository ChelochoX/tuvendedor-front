import instance from "./axiosInstance";

import {
  BANNER_ESTADOS,
  BANNER_TIPOS_DESTINO,
  BANNER_UBICACIONES,
  type BannerEstado,
  type BannerMedidaConfiguracion,
  type BannerPublicitario,
  type BannerPublicitarioAdmin,
  type BannerPublicitarioArchivosForm,
  type BannerPublicitarioFormValues,
  type BannerPublicitarioId,
  type BannersHomeResponse,
  type BannerTipoDestino,
  type BannerUbicacion,
  type ConfiguracionBannersPublicitarios,
  type FiltrosBannersPublicitariosAdmin,
  type RegistrarEventoBannerRequest,
  type ResultadoPaginadoBannersPublicitarios,
  type ResumenBannersPublicitarios,
} from "../types/bannerPublicitario";

type JsonObject = Record<string, unknown>;

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

const API_BASE_URL = String(import.meta.env.VITE_API_URL ?? "").replace(
  /\/+$/,
  "",
);

const PUBLIC_ENDPOINTS = {
  obtenerBannersHome: "/banners-publicitarios/home",
  registrarEvento: "/banners-publicitarios/eventos",
} as const;

const ADMIN_ENDPOINT = "/admin/banners-publicitarios";

const MEDIDAS_PREDETERMINADAS: BannerMedidaConfiguracion[] = [
  {
    ubicacion: BANNER_UBICACIONES.HOME_TOP,
    desktop: "1600 × 420 px",
    mobile: "1080 × 720 px",
  },
  {
    ubicacion: BANNER_UBICACIONES.HOME_INLINE,
    desktop: "1600 × 360 px",
    mobile: "1080 × 720 px",
  },
];

function construirUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

function esObjeto(valor: unknown): valor is JsonObject {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function obtenerPrimerValor(
  objeto: JsonObject,
  posiblesNombres: string[],
): unknown {
  for (const nombre of posiblesNombres) {
    const valor = objeto[nombre];

    if (valor !== undefined && valor !== null) {
      return valor;
    }
  }

  return undefined;
}

function convertirTexto(valor: unknown): string | null {
  if (typeof valor !== "string") {
    return null;
  }

  const texto = valor.trim();

  return texto.length > 0 ? texto : null;
}

function convertirNumero(
  valor: unknown,
  valorPredeterminado = 0,
): number {
  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : valorPredeterminado;
}

function convertirBooleano(
  valor: unknown,
  valorPredeterminado = false,
): boolean {
  if (typeof valor === "boolean") {
    return valor;
  }

  if (typeof valor === "string") {
    return valor.toLowerCase() === "true";
  }

  if (typeof valor === "number") {
    return valor === 1;
  }

  return valorPredeterminado;
}

function convertirId(
  valor: unknown,
): BannerPublicitarioId | null {
  if (typeof valor === "number" && Number.isFinite(valor)) {
    return valor;
  }

  if (typeof valor === "string" && valor.trim().length > 0) {
    return valor.trim();
  }

  return null;
}

function convertirUbicacion(
  valor: unknown,
  ubicacionPredeterminada?: BannerUbicacion,
): BannerUbicacion | null {
  const texto = convertirTexto(valor)?.toUpperCase();

  if (texto === BANNER_UBICACIONES.HOME_TOP) {
    return BANNER_UBICACIONES.HOME_TOP;
  }

  if (texto === BANNER_UBICACIONES.HOME_INLINE) {
    return BANNER_UBICACIONES.HOME_INLINE;
  }

  return ubicacionPredeterminada ?? null;
}

function convertirEstado(
  valor: unknown,
  estadoPredeterminado: BannerEstado = BANNER_ESTADOS.BORRADOR,
): BannerEstado {
  const texto = convertirTexto(valor)?.toUpperCase();

  if (texto === BANNER_ESTADOS.ACTIVO) {
    return BANNER_ESTADOS.ACTIVO;
  }

  if (texto === BANNER_ESTADOS.PAUSADO) {
    return BANNER_ESTADOS.PAUSADO;
  }

  return estadoPredeterminado;
}

function convertirTipoDestino(
  valor: unknown,
  tipoPredeterminado: BannerTipoDestino = BANNER_TIPOS_DESTINO.URL,
): BannerTipoDestino {
  const texto = convertirTexto(valor)?.toUpperCase();

  if (texto === BANNER_TIPOS_DESTINO.WHATSAPP) {
    return BANNER_TIPOS_DESTINO.WHATSAPP;
  }

  if (texto === BANNER_TIPOS_DESTINO.PERFIL_PUBLICO) {
    return BANNER_TIPOS_DESTINO.PERFIL_PUBLICO;
  }

  return tipoPredeterminado;
}

function normalizarBannerPublico(
  valor: unknown,
  ubicacionPredeterminada?: BannerUbicacion,
): BannerPublicitario | null {
  if (!esObjeto(valor)) {
    return null;
  }

  const id = convertirId(
    obtenerPrimerValor(valor, [
      "id",
      "Id",
      "bannerPublicitarioId",
      "BannerPublicitarioId",
      "idBannerPublicitario",
      "IdBannerPublicitario",
    ]),
  );

  const imagenDesktopUrl = convertirTexto(
    obtenerPrimerValor(valor, [
      "imagenDesktopUrl",
      "ImagenDesktopUrl",
      "imagenEscritorioUrl",
      "ImagenEscritorioUrl",
      "urlImagenDesktop",
      "UrlImagenDesktop",
    ]),
  );

  const imagenMobileUrl = convertirTexto(
    obtenerPrimerValor(valor, [
      "imagenMobileUrl",
      "ImagenMobileUrl",
      "imagenMovilUrl",
      "ImagenMovilUrl",
      "urlImagenMobile",
      "UrlImagenMobile",
    ]),
  );

  const ubicacion = convertirUbicacion(
    obtenerPrimerValor(valor, [
      "ubicacion",
      "Ubicacion",
      "tipoUbicacion",
      "TipoUbicacion",
      "posicion",
      "Posicion",
    ]),
    ubicacionPredeterminada,
  );

  if (
    id === null ||
    (!imagenDesktopUrl && !imagenMobileUrl) ||
    !ubicacion
  ) {
    return null;
  }

  const whatsappUrl = convertirTexto(
    obtenerPrimerValor(valor, [
      "whatsappUrl",
      "WhatsappUrl",
      "urlWhatsapp",
      "UrlWhatsapp",
    ]),
  );

  return {
    id,

    titulo: convertirTexto(
      obtenerPrimerValor(valor, ["titulo", "Titulo"]),
    ),

    subtitulo: convertirTexto(
      obtenerPrimerValor(valor, ["subtitulo", "Subtitulo"]),
    ),

    descripcion: convertirTexto(
      obtenerPrimerValor(valor, ["descripcion", "Descripcion"]),
    ),

    etiqueta: convertirTexto(
      obtenerPrimerValor(valor, ["etiqueta", "Etiqueta"]),
    ),

    imagenDesktopUrl: imagenDesktopUrl ?? imagenMobileUrl ?? "",
    imagenMobileUrl,

    tipoDestino: convertirTipoDestino(
      obtenerPrimerValor(valor, ["tipoDestino", "TipoDestino"]),
    ),

    urlDestino: convertirTexto(
      obtenerPrimerValor(valor, ["urlDestino", "UrlDestino"]),
    ),

    whatsappUrl,

    textoBoton: convertirTexto(
      obtenerPrimerValor(valor, ["textoBoton", "TextoBoton"]),
    ),

    mostrarBotonWhatsapp: convertirBooleano(
      obtenerPrimerValor(valor, [
        "mostrarBotonWhatsapp",
        "MostrarBotonWhatsapp",
      ]),
      Boolean(whatsappUrl),
    ),

    textoBotonWhatsapp: convertirTexto(
      obtenerPrimerValor(valor, [
        "textoBotonWhatsapp",
        "TextoBotonWhatsapp",
      ]),
    ),

    abrirNuevaPestana: convertirBooleano(
      obtenerPrimerValor(valor, [
        "abrirNuevaPestana",
        "AbrirNuevaPestana",
      ]),
      true,
    ),

    ubicacion,

    orden: convertirNumero(
      obtenerPrimerValor(valor, ["orden", "Orden"]),
      0,
    ),
  };
}

function normalizarBannerAdmin(
  valor: unknown,
): BannerPublicitarioAdmin | null {
  if (!esObjeto(valor)) {
    return null;
  }

  const bannerPublico = normalizarBannerPublico(valor);

  if (!bannerPublico) {
    return null;
  }

  const cantidadImpresiones = convertirNumero(
    obtenerPrimerValor(valor, [
      "cantidadImpresiones",
      "CantidadImpresiones",
      "totalImpresiones",
      "TotalImpresiones",
    ]),
  );

  const cantidadClicks = convertirNumero(
    obtenerPrimerValor(valor, [
      "cantidadClicks",
      "CantidadClicks",
      "totalClicks",
      "TotalClicks",
    ]),
  );

  const cantidadWhatsapp = convertirNumero(
    obtenerPrimerValor(valor, [
      "cantidadWhatsapp",
      "CantidadWhatsapp",
      "cantidadWhatsApp",
      "CantidadWhatsApp",
      "totalWhatsapp",
      "TotalWhatsapp",
    ]),
  );

  return {
    ...bannerPublico,

    nombreCliente:
      convertirTexto(
        obtenerPrimerValor(valor, [
          "nombreCliente",
          "NombreCliente",
          "clienteNombre",
          "ClienteNombre",
        ]),
      ) ?? "",

    storageKey: convertirTexto(
      obtenerPrimerValor(valor, ["storageKey", "StorageKey"]),
    ),

    estado: convertirEstado(
      obtenerPrimerValor(valor, ["estado", "Estado"]),
    ),

    prioridad: convertirNumero(
      obtenerPrimerValor(valor, ["prioridad", "Prioridad"]),
    ),

    esExclusivo: convertirBooleano(
      obtenerPrimerValor(valor, ["esExclusivo", "EsExclusivo"]),
    ),

    fechaInicio: convertirTexto(
      obtenerPrimerValor(valor, ["fechaInicio", "FechaInicio"]),
    ),

    fechaFin: convertirTexto(
      obtenerPrimerValor(valor, ["fechaFin", "FechaFin"]),
    ),

    cantidadImpresiones,
    cantidadClicks,
    cantidadWhatsapp,

    ctr: convertirNumero(
      obtenerPrimerValor(valor, ["ctr", "Ctr", "CTR"]),
      cantidadImpresiones > 0
        ? Number(
            ((cantidadClicks / cantidadImpresiones) * 100).toFixed(2),
          )
        : 0,
    ),

    fechaCreacion: convertirTexto(
      obtenerPrimerValor(valor, ["fechaCreacion", "FechaCreacion"]),
    ),

    fechaActualizacion: convertirTexto(
      obtenerPrimerValor(valor, [
        "fechaActualizacion",
        "FechaActualizacion",
      ]),
    ),
  };
}

function extraerContenidoPrincipal(
  respuesta: unknown,
): unknown {
  if (!esObjeto(respuesta)) {
    return respuesta;
  }

  return respuesta.data ?? respuesta.Data ?? respuesta;
}

function normalizarListaPublica(
  valor: unknown,
  ubicacion: BannerUbicacion,
): BannerPublicitario[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor
    .map((item) => normalizarBannerPublico(item, ubicacion))
    .filter(
      (banner): banner is BannerPublicitario => banner !== null,
    )
    .sort((a, b) => a.orden - b.orden);
}

function separarBannersDesdeLista(
  lista: unknown[],
): BannersHomeResponse {
  const banners = lista
    .map((item) => normalizarBannerPublico(item))
    .filter(
      (banner): banner is BannerPublicitario => banner !== null,
    )
    .sort((a, b) => a.orden - b.orden);

  return {
    homeTop: banners.filter(
      (banner) =>
        banner.ubicacion === BANNER_UBICACIONES.HOME_TOP,
    ),

    homeInline: banners.filter(
      (banner) =>
        banner.ubicacion === BANNER_UBICACIONES.HOME_INLINE,
    ),
  };
}

function normalizarRespuestaHome(
  respuesta: unknown,
): BannersHomeResponse {
  const contenido = extraerContenidoPrincipal(respuesta);

  if (Array.isArray(contenido)) {
    return separarBannersDesdeLista(contenido);
  }

  if (!esObjeto(contenido)) {
    return {
      homeTop: [],
      homeInline: [],
    };
  }

  const ubicaciones = esObjeto(contenido.ubicaciones)
    ? contenido.ubicaciones
    : esObjeto(contenido.Ubicaciones)
      ? contenido.Ubicaciones
      : contenido;

  const homeTop = obtenerPrimerValor(ubicaciones, [
    "homeTop",
    "HomeTop",
    "HOME_TOP",
  ]);

  const homeInline = obtenerPrimerValor(ubicaciones, [
    "homeInline",
    "HomeInline",
    "HOME_INLINE",
  ]);

  if (Array.isArray(homeTop) || Array.isArray(homeInline)) {
    return {
      homeTop: normalizarListaPublica(
        homeTop,
        BANNER_UBICACIONES.HOME_TOP,
      ),

      homeInline: normalizarListaPublica(
        homeInline,
        BANNER_UBICACIONES.HOME_INLINE,
      ),
    };
  }

  const banners = obtenerPrimerValor(contenido, [
    "banners",
    "Banners",
    "items",
    "Items",
  ]);

  return Array.isArray(banners)
    ? separarBannersDesdeLista(banners)
    : {
        homeTop: [],
        homeInline: [],
      };
}

function obtenerMensajeError(
  error: any,
  mensajePredeterminado: string,
): string {
  const errores =
    error?.response?.data?.Errors ??
    error?.response?.data?.errors;

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

function extraerDataAdmin<T>(
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

function appendFormData(
  formData: FormData,
  nombre: string,
  valor: string | number | boolean | null | undefined,
) {
  if (valor === null || valor === undefined) {
    return;
  }

  formData.append(nombre, String(valor));
}

function crearFormDataBanner(
  valores: BannerPublicitarioFormValues,
  archivos: BannerPublicitarioArchivosForm,
  esEdicion: boolean,
): FormData {
  const formData = new FormData();

  appendFormData(
    formData,
    "NombreCliente",
    valores.nombreCliente.trim(),
  );

  appendFormData(formData, "Ubicacion", valores.ubicacion);
  appendFormData(formData, "Titulo", valores.titulo.trim());
  appendFormData(formData, "Subtitulo", valores.subtitulo.trim());
  appendFormData(formData, "Descripcion", valores.descripcion.trim());
  appendFormData(formData, "Etiqueta", valores.etiqueta.trim());

  appendFormData(formData, "TipoDestino", valores.tipoDestino);
  appendFormData(formData, "UrlDestino", valores.urlDestino.trim());
  appendFormData(formData, "WhatsappUrl", valores.whatsappUrl.trim());

  appendFormData(formData, "TextoBoton", valores.textoBoton.trim());

  appendFormData(
    formData,
    "MostrarBotonWhatsapp",
    valores.mostrarBotonWhatsapp,
  );

  appendFormData(
    formData,
    "TextoBotonWhatsapp",
    valores.textoBotonWhatsapp.trim(),
  );

  appendFormData(
    formData,
    "AbrirNuevaPestana",
    valores.abrirNuevaPestana,
  );

  appendFormData(formData, "FechaInicio", valores.fechaInicio);
  appendFormData(formData, "FechaFin", valores.fechaFin);

  appendFormData(formData, "Estado", valores.estado);
  appendFormData(formData, "Orden", valores.orden);
  appendFormData(formData, "Prioridad", valores.prioridad);
  appendFormData(formData, "EsExclusivo", valores.esExclusivo);

  if (esEdicion) {
    appendFormData(
      formData,
      "EliminarImagenMobile",
      valores.eliminarImagenMobile,
    );
  }

  if (archivos.imagenDesktop) {
    formData.append("ImagenDesktop", archivos.imagenDesktop);
  }

  if (archivos.imagenMobile) {
    formData.append("ImagenMobile", archivos.imagenMobile);
  }

  return formData;
}

function normalizarMedidas(
  valor: unknown,
): BannerMedidaConfiguracion[] {
  if (!Array.isArray(valor)) {
    return MEDIDAS_PREDETERMINADAS;
  }

  const medidas = valor
    .map((item): BannerMedidaConfiguracion | null => {
      if (!esObjeto(item)) {
        return null;
      }

      const ubicacion = convertirUbicacion(
        obtenerPrimerValor(item, ["ubicacion", "Ubicacion"]),
      );

      if (!ubicacion) {
        return null;
      }

      return {
        ubicacion,

        desktop:
          convertirTexto(
            obtenerPrimerValor(item, [
              "desktop",
              "Desktop",
              "medidaDesktop",
              "MedidaDesktop",
            ]),
          ) ?? "Consultar backend",

        mobile:
          convertirTexto(
            obtenerPrimerValor(item, [
              "mobile",
              "Mobile",
              "medidaMobile",
              "MedidaMobile",
            ]),
          ) ?? "Consultar backend",
      };
    })
    .filter(
      (
        medida,
      ): medida is BannerMedidaConfiguracion => medida !== null,
    );

  return medidas.length > 0
    ? medidas
    : MEDIDAS_PREDETERMINADAS;
}

/**
 * Marketplace público.
 */
export async function obtenerBannersHome(
  signal?: AbortSignal,
): Promise<BannersHomeResponse> {
  const response = await fetch(
    construirUrl(PUBLIC_ENDPOINTS.obtenerBannersHome),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(
      `No se pudieron obtener los banners. Código HTTP: ${response.status}`,
    );
  }

  return normalizarRespuestaHome(await response.json());
}

/**
 * El registro estadístico nunca debe bloquear la navegación.
 */
export async function registrarEventoBanner(
  request: RegistrarEventoBannerRequest,
): Promise<void> {
  try {
    const response = await fetch(
      construirUrl(PUBLIC_ENDPOINTS.registrarEvento),
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify(request),

        keepalive: true,
      },
    );

    if (!response.ok) {
      console.warn(
        `No se pudo registrar el evento del banner. HTTP: ${response.status}`,
      );
    }
  } catch (error) {
    console.warn(
      "No se pudo registrar el evento del banner.",
      error,
    );
  }
}

/**
 * Administración privada.
 * axiosInstance agrega el JWT automáticamente.
 */
export async function obtenerBannersPublicitariosAdmin(
  filtros: FiltrosBannersPublicitariosAdmin = {},
): Promise<ResultadoPaginadoBannersPublicitarios> {
  try {
    const response = await instance.get<ApiResponse<any>>(
      ADMIN_ENDPOINT,
      {
        params: filtros,
      },
    );

    const data = extraerDataAdmin<any>(
      response.data,
      "No se pudieron obtener los banners.",
    );

    const itemsRaw = Array.isArray(data)
      ? data
      : data?.items ??
        data?.Items ??
        data?.banners ??
        data?.Banners ??
        [];

    const items = Array.isArray(itemsRaw)
      ? itemsRaw
          .map(normalizarBannerAdmin)
          .filter(
            (
              banner,
            ): banner is BannerPublicitarioAdmin =>
              banner !== null,
          )
      : [];

    return {
      items,

      totalRegistros: convertirNumero(
        data?.totalRegistros ??
          data?.TotalRegistros ??
          data?.total ??
          data?.Total,
        items.length,
      ),
    };
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(
        error,
        "No se pudieron obtener los banners.",
      ),
    );
  }
}

export async function obtenerBannerPublicitarioAdmin(
  id: BannerPublicitarioId,
): Promise<BannerPublicitarioAdmin> {
  try {
    const response = await instance.get<ApiResponse<any>>(
      `${ADMIN_ENDPOINT}/${id}`,
    );

    const data = extraerDataAdmin<any>(
      response.data,
      "No se pudo obtener el banner.",
    );

    const banner = normalizarBannerAdmin(data);

    if (!banner) {
      throw new Error(
        "El backend respondió con un formato de banner inesperado.",
      );
    }

    return banner;
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(
        error,
        "No se pudo obtener el banner.",
      ),
    );
  }
}

export async function obtenerResumenBannersPublicitariosAdmin(): Promise<ResumenBannersPublicitarios> {
  try {
    const response = await instance.get<ApiResponse<any>>(
      `${ADMIN_ENDPOINT}/resumen`,
    );

    const data = extraerDataAdmin<any>(
      response.data,
      "No se pudo obtener el resumen.",
    );

    return {
      totalBanners: convertirNumero(
        data?.totalBanners ?? data?.TotalBanners,
      ),

      bannersActivos: convertirNumero(
        data?.bannersActivos ?? data?.BannersActivos,
      ),

      bannersPausados: convertirNumero(
        data?.bannersPausados ?? data?.BannersPausados,
      ),

      bannersBorrador: convertirNumero(
        data?.bannersBorrador ?? data?.BannersBorrador,
      ),

      cantidadImpresiones: convertirNumero(
        data?.cantidadImpresiones ?? data?.CantidadImpresiones,
      ),

      cantidadClicks: convertirNumero(
        data?.cantidadClicks ?? data?.CantidadClicks,
      ),

      cantidadWhatsapp: convertirNumero(
        data?.cantidadWhatsapp ??
          data?.CantidadWhatsapp ??
          data?.cantidadWhatsApp ??
          data?.CantidadWhatsApp,
      ),

      ctr: convertirNumero(
        data?.ctr ?? data?.Ctr ?? data?.CTR,
      ),
    };
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(
        error,
        "No se pudo obtener el resumen.",
      ),
    );
  }
}

export async function obtenerConfiguracionBannersPublicitariosAdmin(): Promise<ConfiguracionBannersPublicitarios> {
  try {
    const response = await instance.get<ApiResponse<any>>(
      `${ADMIN_ENDPOINT}/configuracion`,
    );

    const data = extraerDataAdmin<any>(
      response.data,
      "No se pudo obtener la configuración.",
    );

    return {
      ubicaciones: Array.isArray(
        data?.ubicaciones ?? data?.Ubicaciones,
      )
        ? (data?.ubicaciones ?? data?.Ubicaciones)
            .map((item: unknown) => convertirUbicacion(item))
            .filter(
              (
                item: BannerUbicacion | null,
              ): item is BannerUbicacion => item !== null,
            )
        : Object.values(BANNER_UBICACIONES),

      tiposDestino: Array.isArray(
        data?.tiposDestino ?? data?.TiposDestino,
      )
        ? (data?.tiposDestino ?? data?.TiposDestino).map(
            (item: unknown) => convertirTipoDestino(item),
          )
        : Object.values(BANNER_TIPOS_DESTINO),

      estadosEditables: Array.isArray(
        data?.estadosEditables ?? data?.EstadosEditables,
      )
        ? (
            data?.estadosEditables ?? data?.EstadosEditables
          ).map((item: unknown) => convertirEstado(item))
        : Object.values(BANNER_ESTADOS),

      formatosPermitidos: Array.isArray(
        data?.formatosPermitidos ?? data?.FormatosPermitidos,
      )
        ? (
            data?.formatosPermitidos ?? data?.FormatosPermitidos
          ).map(String)
        : ["image/jpeg", "image/png", "image/webp"],

      medidas: normalizarMedidas(
        data?.medidas ?? data?.Medidas,
      ),
    };
  } catch (error) {
    /**
     * No bloqueamos el administrador si falla solamente
     * el endpoint informativo de configuración.
     */
    console.warn(
      "No se pudo consultar la configuración de banners.",
      error,
    );

    return {
      ubicaciones: Object.values(BANNER_UBICACIONES),
      tiposDestino: Object.values(BANNER_TIPOS_DESTINO),
      estadosEditables: Object.values(BANNER_ESTADOS),
      formatosPermitidos: [
        "image/jpeg",
        "image/png",
        "image/webp",
      ],
      medidas: MEDIDAS_PREDETERMINADAS,
    };
  }
}

export async function crearBannerPublicitarioAdmin(
  valores: BannerPublicitarioFormValues,
  archivos: BannerPublicitarioArchivosForm,
): Promise<void> {
  try {
    await instance.post(
      ADMIN_ENDPOINT,
      crearFormDataBanner(valores, archivos, false),
    );
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(
        error,
        "No se pudo crear el banner.",
      ),
    );
  }
}

export async function actualizarBannerPublicitarioAdmin(
  id: BannerPublicitarioId,
  valores: BannerPublicitarioFormValues,
  archivos: BannerPublicitarioArchivosForm,
): Promise<void> {
  try {
    await instance.put(
      `${ADMIN_ENDPOINT}/${id}`,
      crearFormDataBanner(valores, archivos, true),
    );
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(
        error,
        "No se pudo actualizar el banner.",
      ),
    );
  }
}

export async function cambiarEstadoBannerPublicitarioAdmin(
  id: BannerPublicitarioId,
  estado: BannerEstado,
): Promise<void> {
  try {
    await instance.patch(
      `${ADMIN_ENDPOINT}/${id}/estado`,
      {
        estado,
      },
    );
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(
        error,
        "No se pudo cambiar el estado del banner.",
      ),
    );
  }
}

export async function eliminarBannerPublicitarioAdmin(
  id: BannerPublicitarioId,
): Promise<void> {
  try {
    await instance.delete(`${ADMIN_ENDPOINT}/${id}`);
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(
        error,
        "No se pudo eliminar el banner.",
      ),
    );
  }
}
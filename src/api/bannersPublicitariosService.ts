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
    desktop: "1600 × 240 px",
    mobile: "1080 × 480 px",
  },
];

const CONFIG_MULTIPART = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

const CONFIG_JSON = {
  headers: {
    "Content-Type": "application/json",
  },
};

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

function convertirNumero(valor: unknown, valorPredeterminado = 0): number {
  const parsedValue = Number(valor);

  return Number.isFinite(parsedValue) ? parsedValue : valorPredeterminado;
}

function convertirBooleano(
  valor: unknown,
  valorPredeterminado = false,
): boolean {
  if (typeof valor === "boolean") {
    return valor;
  }

  if (typeof valor === "number") {
    return valor === 1;
  }

  if (typeof valor === "string") {
    return valor.toLowerCase() === "true";
  }

  return valorPredeterminado;
}

function convertirId(valor: unknown): BannerPublicitarioId | null {
  if (typeof valor === "number" && Number.isFinite(valor)) {
    return valor;
  }

  if (typeof valor === "string" && valor.trim().length > 0) {
    return valor.trim();
  }

  return null;
}

function extraerValorCatalogo(valor: unknown): unknown {
  if (!esObjeto(valor)) {
    return valor;
  }

  return obtenerPrimerValor(valor, [
    "valor",
    "Valor",
    "value",
    "Value",
    "codigo",
    "Codigo",
    "code",
    "Code",
    "nombre",
    "Nombre",
    "descripcion",
    "Descripcion",
    "description",
    "Description",
    "tipoDestino",
    "TipoDestino",
    "estado",
    "Estado",
    "ubicacion",
    "Ubicacion",
  ]);
}

function convertirUbicacion(
  valor: unknown,
  ubicacionPredeterminada?: BannerUbicacion,
): BannerUbicacion | null {
  const texto = convertirTexto(extraerValorCatalogo(valor))?.toUpperCase();

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
  const texto = convertirTexto(extraerValorCatalogo(valor))?.toUpperCase();

  if (texto === BANNER_ESTADOS.ACTIVO) {
    return BANNER_ESTADOS.ACTIVO;
  }

  if (texto === BANNER_ESTADOS.PAUSADO) {
    return BANNER_ESTADOS.PAUSADO;
  }

  if (texto === BANNER_ESTADOS.BORRADOR) {
    return BANNER_ESTADOS.BORRADOR;
  }

  return estadoPredeterminado;
}

function convertirEstadoConfiguracion(valor: unknown): BannerEstado | null {
  const texto = convertirTexto(extraerValorCatalogo(valor))?.toUpperCase();

  if (texto === BANNER_ESTADOS.ACTIVO) {
    return BANNER_ESTADOS.ACTIVO;
  }

  if (texto === BANNER_ESTADOS.PAUSADO) {
    return BANNER_ESTADOS.PAUSADO;
  }

  if (texto === BANNER_ESTADOS.BORRADOR) {
    return BANNER_ESTADOS.BORRADOR;
  }

  return null;
}

function convertirTipoDestino(
  valor: unknown,
  tipoPredeterminado: BannerTipoDestino | null = BANNER_TIPOS_DESTINO.WEB,
): BannerTipoDestino | null {
  const texto = convertirTexto(extraerValorCatalogo(valor))?.toUpperCase();

  if (
    texto === BANNER_TIPOS_DESTINO.WEB ||
    texto === "URL" ||
    texto === "WEB" ||
    texto === "URL_EXTERNA" ||
    texto === "SITIO_WEB"
  ) {
    return BANNER_TIPOS_DESTINO.WEB;
  }

  if (
    texto === BANNER_TIPOS_DESTINO.FACEBOOK ||
    texto === "FACEBOOK" ||
    texto === "FB"
  ) {
    return BANNER_TIPOS_DESTINO.FACEBOOK;
  }

  if (
    texto === BANNER_TIPOS_DESTINO.INSTAGRAM ||
    texto === "INSTAGRAM" ||
    texto === "IG"
  ) {
    return BANNER_TIPOS_DESTINO.INSTAGRAM;
  }

  if (texto === BANNER_TIPOS_DESTINO.WHATSAPP || texto === "WA") {
    return BANNER_TIPOS_DESTINO.WHATSAPP;
  }

  if (
    texto === BANNER_TIPOS_DESTINO.VITRINA_INTERNA ||
    texto === "PERFIL_PUBLICO" ||
    texto === "PERFIL" ||
    texto === "PERFIL_VENDEDOR" ||
    texto === "VITRINA"
  ) {
    return BANNER_TIPOS_DESTINO.VITRINA_INTERNA;
  }

  if (texto === BANNER_TIPOS_DESTINO.OTRO || texto === "OTROS") {
    return BANNER_TIPOS_DESTINO.OTRO;
  }

  return tipoPredeterminado;
}

function normalizarUbicacionesConfiguracion(valor: unknown): BannerUbicacion[] {
  if (!Array.isArray(valor)) {
    return Object.values(BANNER_UBICACIONES);
  }

  const ubicacionesNormalizadas = valor
    .map((item) => convertirUbicacion(item))
    .filter((item): item is BannerUbicacion => item !== null);

  const ubicacionesSinDuplicados = Array.from(new Set(ubicacionesNormalizadas));

  return ubicacionesSinDuplicados.length > 0
    ? ubicacionesSinDuplicados
    : Object.values(BANNER_UBICACIONES);
}

function normalizarTiposDestinoConfiguracion(
  valor: unknown,
): BannerTipoDestino[] {
  const tiposPredeterminados: BannerTipoDestino[] = [
    BANNER_TIPOS_DESTINO.WEB,
    BANNER_TIPOS_DESTINO.FACEBOOK,
    BANNER_TIPOS_DESTINO.INSTAGRAM,
    BANNER_TIPOS_DESTINO.WHATSAPP,
    BANNER_TIPOS_DESTINO.VITRINA_INTERNA,
    BANNER_TIPOS_DESTINO.OTRO,
  ];

  if (!Array.isArray(valor)) {
    return tiposPredeterminados;
  }

  const tiposNormalizados = valor
    .map((item) => convertirTipoDestino(item, null))
    .filter((item): item is BannerTipoDestino => item !== null);

  const tiposSinDuplicados = Array.from(new Set(tiposNormalizados));

  return tiposSinDuplicados.length > 0
    ? tiposSinDuplicados
    : tiposPredeterminados;
}

function normalizarEstadosEditablesConfiguracion(
  valor: unknown,
): BannerEstado[] {
  if (!Array.isArray(valor)) {
    return Object.values(BANNER_ESTADOS);
  }

  const estadosNormalizados = valor
    .map(convertirEstadoConfiguracion)
    .filter((item): item is BannerEstado => item !== null);

  const estadosSinDuplicados = Array.from(new Set(estadosNormalizados));

  return estadosSinDuplicados.length > 0
    ? estadosSinDuplicados
    : Object.values(BANNER_ESTADOS);
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
      "banner_publicitario_id",
      "idBannerPublicitario",
      "IdBannerPublicitario",
    ]),
  );

  const imagenDesktopUrl = convertirTexto(
    obtenerPrimerValor(valor, [
      "imagenDesktopUrl",
      "ImagenDesktopUrl",
      "imagen_desktop_url",
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
      "imagen_mobile_url",
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
      "tipo_ubicacion",
      "posicion",
      "Posicion",
    ]),
    ubicacionPredeterminada,
  );

  if (id === null || (!imagenDesktopUrl && !imagenMobileUrl) || !ubicacion) {
    return null;
  }

  const whatsappUrl = convertirTexto(
    obtenerPrimerValor(valor, [
      "whatsappUrl",
      "WhatsappUrl",
      "whatsapp_url",
      "urlWhatsapp",
      "UrlWhatsapp",
      "url_whatsapp",
    ]),
  );

  return {
    id,

    titulo: convertirTexto(
      obtenerPrimerValor(valor, ["titulo", "Titulo", "nombre", "Nombre"]),
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

    tipoDestino:
      convertirTipoDestino(
        obtenerPrimerValor(valor, ["tipoDestino", "TipoDestino"]),
      ) ?? BANNER_TIPOS_DESTINO.URL,

    urlDestino: convertirTexto(
      obtenerPrimerValor(valor, ["urlDestino", "UrlDestino", "url", "Url"]),
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
      obtenerPrimerValor(valor, ["textoBotonWhatsapp", "TextoBotonWhatsapp"]),
    ),

    abrirNuevaPestana: convertirBooleano(
      obtenerPrimerValor(valor, ["abrirNuevaPestana", "AbrirNuevaPestana"]),
      true,
    ),

    ubicacion,

    orden: convertirNumero(obtenerPrimerValor(valor, ["orden", "Orden"]), 0),
  };
}

function normalizarBannerAdmin(valor: unknown): BannerPublicitarioAdmin | null {
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
      "totalWhatsApp",
      "TotalWhatsApp",
      "whatsApp",
      "WhatsApp",
      "whatsapp",
      "Whatsapp",
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

    estado: convertirEstado(obtenerPrimerValor(valor, ["estado", "Estado"])),

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
        ? Number(((cantidadClicks / cantidadImpresiones) * 100).toFixed(2))
        : 0,
    ),

    fechaCreacion: convertirTexto(
      obtenerPrimerValor(valor, ["fechaCreacion", "FechaCreacion"]),
    ),

    fechaActualizacion: convertirTexto(
      obtenerPrimerValor(valor, ["fechaActualizacion", "FechaActualizacion"]),
    ),
  };
}

function extraerContenidoPrincipal(respuesta: unknown): unknown {
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
    .filter((banner): banner is BannerPublicitario => banner !== null)
    .sort((a, b) => a.orden - b.orden);
}

function separarBannersDesdeLista(lista: unknown[]): BannersHomeResponse {
  const banners = lista
    .map((item) => normalizarBannerPublico(item))
    .filter((banner): banner is BannerPublicitario => banner !== null)
    .sort((a, b) => a.orden - b.orden);

  return {
    homeTop: banners.filter(
      (banner) => banner.ubicacion === BANNER_UBICACIONES.HOME_TOP,
    ),

    homeInline: banners.filter(
      (banner) => banner.ubicacion === BANNER_UBICACIONES.HOME_INLINE,
    ),
  };
}

function normalizarRespuestaHome(respuesta: unknown): BannersHomeResponse {
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
      homeTop: normalizarListaPublica(homeTop, BANNER_UBICACIONES.HOME_TOP),
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

function obtenerUrlDestinoParaEnvio(
  valores: BannerPublicitarioFormValues,
): string {
  const tipoDestino = valores.tipoDestino;

  if (tipoDestino === BANNER_TIPOS_DESTINO.WHATSAPP) {
    return valores.whatsappUrl.trim();
  }

  return valores.urlDestino.trim();
}

function crearFormDataBanner(
  valores: BannerPublicitarioFormValues,
  archivos: BannerPublicitarioArchivosForm,
  esEdicion: boolean,
): FormData {
  const formData = new FormData();

  appendFormData(formData, "NombreCliente", valores.nombreCliente.trim());
  appendFormData(formData, "Ubicacion", valores.ubicacion);

  appendFormData(formData, "Titulo", valores.titulo.trim());
  appendFormData(formData, "Subtitulo", valores.subtitulo.trim());
  appendFormData(formData, "Descripcion", valores.descripcion.trim());
  appendFormData(formData, "Etiqueta", valores.etiqueta.trim());

  appendFormData(formData, "TipoDestino", valores.tipoDestino);
  appendFormData(formData, "UrlDestino", obtenerUrlDestinoParaEnvio(valores));
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
  appendFormData(formData, "AbrirNuevaPestana", valores.abrirNuevaPestana);

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

function normalizarMedidas(valor: unknown): BannerMedidaConfiguracion[] {
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
    .filter((medida): medida is BannerMedidaConfiguracion => medida !== null);

  return medidas.length > 0 ? medidas : MEDIDAS_PREDETERMINADAS;
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

function obtenerDispositivoBanner(): "DESKTOP" | "MOBILE" | "TABLET" {
  if (typeof window === "undefined") {
    return "DESKTOP";
  }

  const ancho = window.innerWidth;

  if (ancho <= 767) {
    return "MOBILE";
  }

  if (ancho <= 1024) {
    return "TABLET";
  }

  return "DESKTOP";
}

function obtenerPaginaActualBanner(): string {
  if (typeof window === "undefined") {
    return "/";
  }

  return `${window.location.pathname}${window.location.search}`.slice(0, 250);
}

function obtenerVisitorIdBanner(): string {
  const storageKey = "tuvendedor_visitor_id";

  try {
    const existente = localStorage.getItem(storageKey);

    if (existente) {
      return existente;
    }

    const nuevo =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    localStorage.setItem(storageKey, nuevo);

    return nuevo;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

/**
 * El registro estadístico nunca debe bloquear la navegación.
 */
export async function registrarEventoBanner(
  request: RegistrarEventoBannerRequest,
): Promise<void> {
  try {
    const idBannerRaw = request.idBanner ?? request.bannerPublicitarioId;

    const idBanner = Number(idBannerRaw);

    if (!Number.isFinite(idBanner) || idBanner <= 0 || !request.ubicacion) {
      console.warn(
        "No se pudo registrar evento de banner: datos incompletos.",
        request,
      );

      return;
    }

    const payload = {
      idBanner,
      tipoEvento: request.tipoEvento,
      ubicacion: request.ubicacion,
      dispositivo: request.dispositivo ?? obtenerDispositivoBanner(),
      pagina: request.pagina ?? obtenerPaginaActualBanner(),
      visitorId: request.visitorId ?? obtenerVisitorIdBanner(),
    };

    const response = await fetch(
      construirUrl(PUBLIC_ENDPOINTS.registrarEvento),
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify(payload),

        keepalive: true,
      },
    );

    if (!response.ok) {
      console.warn(
        `No se pudo registrar el evento del banner. HTTP: ${response.status}`,
        payload,
      );
    }
  } catch (error) {
    console.warn("No se pudo registrar el evento del banner.", error);
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
    const response = await instance.get<ApiResponse<any>>(ADMIN_ENDPOINT, {
      params: filtros,
    });

    const data = extraerDataAdmin<any>(
      response.data,
      "No se pudieron obtener los banners.",
    );

    const itemsRaw = Array.isArray(data)
      ? data
      : (data?.items ?? data?.Items ?? data?.banners ?? data?.Banners ?? []);

    const items = Array.isArray(itemsRaw)
      ? itemsRaw
          .map(normalizarBannerAdmin)
          .filter(
            (banner): banner is BannerPublicitarioAdmin => banner !== null,
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
      obtenerMensajeError(error, "No se pudieron obtener los banners."),
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
      obtenerMensajeError(error, "No se pudo obtener el banner."),
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

    const cantidadImpresiones = convertirNumero(
      data?.cantidadImpresiones ??
        data?.CantidadImpresiones ??
        data?.totalImpresiones ??
        data?.TotalImpresiones ??
        data?.impresiones ??
        data?.Impresiones,
    );

    const cantidadClicks = convertirNumero(
      data?.cantidadClicks ??
        data?.CantidadClicks ??
        data?.totalClicks ??
        data?.TotalClicks ??
        data?.clicks ??
        data?.Clicks ??
        data?.clics ??
        data?.Clics,
    );

    const cantidadWhatsapp = convertirNumero(
      data?.cantidadWhatsapp ??
        data?.CantidadWhatsapp ??
        data?.cantidadWhatsApp ??
        data?.CantidadWhatsApp ??
        data?.totalWhatsapp ??
        data?.TotalWhatsapp ??
        data?.totalWhatsApp ??
        data?.TotalWhatsApp ??
        data?.whatsApp ??
        data?.WhatsApp ??
        data?.whatsapp ??
        data?.Whatsapp,
    );

    const ctrBackend = convertirNumero(data?.ctr ?? data?.Ctr ?? data?.CTR);

    const ctrCalculado =
      cantidadImpresiones > 0
        ? Number(((cantidadClicks / cantidadImpresiones) * 100).toFixed(2))
        : 0;

    return {
      totalBanners: convertirNumero(data?.totalBanners ?? data?.TotalBanners),

      bannersActivos: convertirNumero(
        data?.bannersActivos ?? data?.BannersActivos,
      ),

      bannersPausados: convertirNumero(
        data?.bannersPausados ??
          data?.BannersPausados ??
          data?.bannersProgramados ??
          data?.BannersProgramados,
      ),

      bannersBorrador: convertirNumero(
        data?.bannersBorrador ??
          data?.BannersBorrador ??
          data?.bannersVencidos ??
          data?.BannersVencidos,
      ),

      cantidadImpresiones,

      cantidadClicks,

      cantidadWhatsapp,

      ctr: ctrBackend > 0 ? ctrBackend : ctrCalculado,
    };
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(error, "No se pudo obtener el resumen."),
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
      ubicaciones: normalizarUbicacionesConfiguracion(
        data?.ubicaciones ?? data?.Ubicaciones,
      ),

      tiposDestino: normalizarTiposDestinoConfiguracion(
        data?.tiposDestino ?? data?.TiposDestino,
      ),

      estadosEditables: normalizarEstadosEditablesConfiguracion(
        data?.estadosEditables ?? data?.EstadosEditables,
      ),

      formatosPermitidos: Array.isArray(
        data?.formatosPermitidos ?? data?.FormatosPermitidos,
      )
        ? (data?.formatosPermitidos ?? data?.FormatosPermitidos).map(String)
        : ["image/jpeg", "image/png", "image/webp"],

      medidas: normalizarMedidas(data?.medidas ?? data?.Medidas),
    };
  } catch (error) {
    console.warn("No se pudo consultar la configuración de banners.", error);

    return {
      ubicaciones: Object.values(BANNER_UBICACIONES),
      tiposDestino: Object.values(BANNER_TIPOS_DESTINO),
      estadosEditables: Object.values(BANNER_ESTADOS),
      formatosPermitidos: ["image/jpeg", "image/png", "image/webp"],
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
      CONFIG_MULTIPART,
    );
  } catch (error: any) {
    throw new Error(obtenerMensajeError(error, "No se pudo crear el banner."));
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
      CONFIG_MULTIPART,
    );
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(error, "No se pudo actualizar el banner."),
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
      CONFIG_JSON,
    );
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(error, "No se pudo cambiar el estado del banner."),
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
      obtenerMensajeError(error, "No se pudo eliminar el banner."),
    );
  }
}

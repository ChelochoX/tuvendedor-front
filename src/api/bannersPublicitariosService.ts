import {
  BANNER_UBICACIONES,
  type BannerPublicitario,
  type BannerPublicitarioId,
  type BannersHomeResponse,
  type BannerUbicacion,
  type RegistrarEventoBannerRequest,
} from "../types/bannerPublicitario";

type JsonObject = Record<string, unknown>;

const API_BASE_URL = String(import.meta.env.VITE_API_URL ?? "").replace(
  /\/+$/,
  ""
);

const ENDPOINTS = {
  obtenerBannersHome: "/banners-publicitarios/home",
  registrarEvento: "/banners-publicitarios/eventos",
} as const;

function construirUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

function esObjeto(valor: unknown): valor is JsonObject {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function obtenerPrimerValor(
  objeto: JsonObject,
  posiblesNombres: string[]
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
  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : valorPredeterminado;
}

function convertirBooleano(
  valor: unknown,
  valorPredeterminado = true
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

function convertirId(valor: unknown): BannerPublicitarioId | null {
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
  ubicacionPredeterminada?: BannerUbicacion
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

/**
 * Esta normalización permite consumir respuestas en camelCase o snake_case.
 * De esa manera evitamos romper el frontend si el backend serializa los campos
 * con una convención diferente.
 */
function normalizarBanner(
  valor: unknown,
  ubicacionPredeterminada?: BannerUbicacion
): BannerPublicitario | null {
  if (!esObjeto(valor)) {
    return null;
  }

  const id = convertirId(
    obtenerPrimerValor(valor, [
      "id",
      "bannerPublicitarioId",
      "banner_publicitario_id",
      "idBannerPublicitario",
      "id_banner_publicitario",
    ])
  );

  const imagenDesktopUrl = convertirTexto(
    obtenerPrimerValor(valor, [
      "imagenDesktopUrl",
      "imagen_desktop_url",
      "imagenEscritorioUrl",
      "imagen_escritorio_url",
      "urlImagenDesktop",
      "url_imagen_desktop",
    ])
  );

  const imagenMobileUrl = convertirTexto(
    obtenerPrimerValor(valor, [
      "imagenMobileUrl",
      "imagen_mobile_url",
      "imagenMovilUrl",
      "imagen_movil_url",
      "urlImagenMobile",
      "url_imagen_mobile",
    ])
  );

  const ubicacion = convertirUbicacion(
    obtenerPrimerValor(valor, [
      "ubicacion",
      "tipoUbicacion",
      "tipo_ubicacion",
      "posicion",
    ]),
    ubicacionPredeterminada
  );

  if (!id || (!imagenDesktopUrl && !imagenMobileUrl) || !ubicacion) {
    return null;
  }

  return {
    id,
    titulo: convertirTexto(
      obtenerPrimerValor(valor, ["titulo", "nombre", "title"])
    ),
    descripcion: convertirTexto(
      obtenerPrimerValor(valor, ["descripcion", "description"])
    ),
    imagenDesktopUrl: imagenDesktopUrl ?? imagenMobileUrl ?? "",
    imagenMobileUrl,
    urlDestino: convertirTexto(
      obtenerPrimerValor(valor, [
        "urlDestino",
        "url_destino",
        "linkDestino",
        "link_destino",
      ])
    ),
    whatsappUrl: convertirTexto(
      obtenerPrimerValor(valor, [
        "whatsappUrl",
        "whatsapp_url",
        "urlWhatsapp",
        "url_whatsapp",
      ])
    ),
    textoBoton: convertirTexto(
      obtenerPrimerValor(valor, [
        "textoBoton",
        "texto_boton",
        "buttonText",
        "button_text",
      ])
    ),
    abrirNuevaPestana: convertirBooleano(
      obtenerPrimerValor(valor, [
        "abrirNuevaPestana",
        "abrir_nueva_pestana",
        "openNewTab",
        "open_new_tab",
      ]),
      true
    ),
    ubicacion,
    orden: convertirNumero(
      obtenerPrimerValor(valor, ["orden", "order", "prioridad"]),
      0
    ),
  };
}

function normalizarLista(
  valor: unknown,
  ubicacion: BannerUbicacion
): BannerPublicitario[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor
    .map((item) => normalizarBanner(item, ubicacion))
    .filter((banner): banner is BannerPublicitario => banner !== null)
    .sort((a, b) => a.orden - b.orden);
}

function extraerContenidoPrincipal(respuesta: unknown): unknown {
  if (!esObjeto(respuesta)) {
    return respuesta;
  }

  const data = respuesta.data ?? respuesta.Data;

  if (data !== undefined && data !== null) {
    return data;
  }

  return respuesta;
}

function separarBannersDesdeLista(lista: unknown[]): BannersHomeResponse {
  const banners = lista
    .map((item) => normalizarBanner(item))
    .filter((banner): banner is BannerPublicitario => banner !== null)
    .sort((a, b) => a.orden - b.orden);

  return {
    homeTop: banners.filter(
      (banner) => banner.ubicacion === BANNER_UBICACIONES.HOME_TOP
    ),
    homeInline: banners.filter(
      (banner) => banner.ubicacion === BANNER_UBICACIONES.HOME_INLINE
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
    : contenido;

  const homeTop = obtenerPrimerValor(ubicaciones, [
    "homeTop",
    "home_top",
    "HOME_TOP",
  ]);

  const homeInline = obtenerPrimerValor(ubicaciones, [
    "homeInline",
    "home_inline",
    "HOME_INLINE",
  ]);

  if (Array.isArray(homeTop) || Array.isArray(homeInline)) {
    return {
      homeTop: normalizarLista(homeTop, BANNER_UBICACIONES.HOME_TOP),
      homeInline: normalizarLista(
        homeInline,
        BANNER_UBICACIONES.HOME_INLINE
      ),
    };
  }

  const listaGeneral = obtenerPrimerValor(contenido, [
    "banners",
    "items",
    "resultados",
    "results",
  ]);

  if (Array.isArray(listaGeneral)) {
    return separarBannersDesdeLista(listaGeneral);
  }

  return {
    homeTop: [],
    homeInline: [],
  };
}

export async function obtenerBannersHome(
  signal?: AbortSignal
): Promise<BannersHomeResponse> {
  const response = await fetch(construirUrl(ENDPOINTS.obtenerBannersHome), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `No se pudieron obtener los banners. Código HTTP: ${response.status}`
    );
  }

  const data: unknown = await response.json();

  return normalizarRespuestaHome(data);
}

/**
 * Este endpoint es público y no debe bloquear la navegación.
 * Si el registro estadístico falla, el usuario igualmente podrá abrir el enlace.
 */
export async function registrarEventoBanner(
  request: RegistrarEventoBannerRequest
): Promise<void> {
  try {
    const response = await fetch(construirUrl(ENDPOINTS.registrarEvento), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        bannerPublicitarioId: request.bannerPublicitarioId,
        tipoEvento: request.tipoEvento,
      }),
      keepalive: true,
    });

    if (!response.ok) {
      console.warn(
        `No se pudo registrar el evento del banner. Código HTTP: ${response.status}`
      );
    }
  } catch (error) {
    console.warn("No se pudo registrar el evento del banner.", error);
  }
}
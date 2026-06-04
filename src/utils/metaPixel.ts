export interface MetaPublicacion {
  id: number;
  titulo?: string | null;
  nombre?: string | null;
  precio?: number | null;
  moneda?: string | null;
  categoria?: string | null;
}

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

// Pixel que ya existía para el marketplace normal.
const META_PIXEL_MARKETPLACE_ID = "2481924878902980";

// Pixel exclusivo para la vitrina inmobiliaria de Angela.
const META_PIXEL_ANGELA_ID = "984027957428661";

const ANGELA_SLUG = "angelacaceres";

// El Pixel del marketplace ya se inicializa desde index.html.
const pixelsInicializados = new Set<string>([META_PIXEL_MARKETPLACE_ID]);

// Evita duplicar PageView en desarrollo cuando StrictMode ejecuta efectos dos veces.
let ultimaRutaPageView: string | null = null;

// Evita duplicar ViewContent de la misma publicación durante una sesión.
const contenidosRegistrados = new Set<string>();

const obtenerFbq = () => {
  if (typeof window === "undefined") return null;
  if (typeof window.fbq !== "function") return null;

  return window.fbq;
};

const inicializarPixel = (pixelId: string) => {
  const fbq = obtenerFbq();

  if (!fbq) return null;

  if (!pixelsInicializados.has(pixelId)) {
    fbq("init", pixelId);
    pixelsInicializados.add(pixelId);
  }

  return fbq;
};

const normalizarMoneda = (moneda?: string | null): string => {
  return moneda?.trim().toUpperCase() === "USD" ? "USD" : "PYG";
};

const construirParametrosPublicacion = (
  publicacion: MetaPublicacion,
): Record<string, unknown> => {
  const precio = Number(publicacion.precio ?? 0);

  const parametros: Record<string, unknown> = {
    content_ids: [String(publicacion.id)],
    content_name:
      publicacion.titulo?.trim() ||
      publicacion.nombre?.trim() ||
      `Publicación ${publicacion.id}`,
    content_type: "product",
  };

  if (publicacion.categoria?.trim()) {
    parametros.content_category = publicacion.categoria.trim();
  }

  if (Number.isFinite(precio) && precio > 0) {
    parametros.value = precio;
    parametros.currency = normalizarMoneda(publicacion.moneda);
  }

  return parametros;
};

const enviarEventoEstandar = (
  pixelId: string,
  nombreEvento: string,
  parametros?: Record<string, unknown>,
): boolean => {
  const fbq = inicializarPixel(pixelId);

  if (!fbq) return false;

  if (parametros) {
    fbq("trackSingle", pixelId, nombreEvento, parametros);
  } else {
    fbq("trackSingle", pixelId, nombreEvento);
  }

  return true;
};

const enviarEventoPersonalizado = (
  pixelId: string,
  nombreEvento: string,
  parametros?: Record<string, unknown>,
): boolean => {
  const fbq = inicializarPixel(pixelId);

  if (!fbq) return false;

  if (parametros) {
    fbq("trackSingleCustom", pixelId, nombreEvento, parametros);
  } else {
    fbq("trackSingleCustom", pixelId, nombreEvento);
  }

  return true;
};

const esRutaPublicaMarketplace = (pathname: string): boolean => {
  return (
    pathname === "/" ||
    pathname.startsWith("/producto/") ||
    pathname.startsWith("/bridge/")
  );
};

const esRutaVitrinaAngela = (pathname: string): boolean => {
  return pathname
    .toLowerCase()
    .startsWith(`/vendedor/${ANGELA_SLUG.toLowerCase()}`);
};

// Navegación general de la SPA.
export const registrarMetaPageViewPorRuta = (pathname: string) => {
  if (!pathname || ultimaRutaPageView === pathname) return;

  let registrado = false;

  if (esRutaVitrinaAngela(pathname)) {
    registrado = enviarEventoEstandar(META_PIXEL_ANGELA_ID, "PageView");
  } else if (esRutaPublicaMarketplace(pathname)) {
    registrado = enviarEventoEstandar(META_PIXEL_MARKETPLACE_ID, "PageView");
  }

  if (registrado) {
    ultimaRutaPageView = pathname;
  }
};

// Eventos del marketplace normal.
export const registrarMetaMarketplaceViewContent = (
  publicacion: MetaPublicacion,
) => {
  const clave = `marketplace:${publicacion.id}`;

  if (contenidosRegistrados.has(clave)) return;

  const registrado = enviarEventoEstandar(
    META_PIXEL_MARKETPLACE_ID,
    "ViewContent",
    construirParametrosPublicacion(publicacion),
  );

  if (registrado) {
    contenidosRegistrados.add(clave);
  }
};

export const registrarMetaMarketplaceContactoWhatsapp = (
  publicacion: MetaPublicacion,
) => {
  enviarEventoEstandar(
    META_PIXEL_MARKETPLACE_ID,
    "Contact",
    construirParametrosPublicacion(publicacion),
  );
};

// Eventos exclusivos de la vitrina inmobiliaria de Angela.
export const registrarMetaAngelaViewContent = (
  publicacion: MetaPublicacion,
) => {
  const clave = `angela:${publicacion.id}`;

  if (contenidosRegistrados.has(clave)) return;

  const registrado = enviarEventoEstandar(
    META_PIXEL_ANGELA_ID,
    "ViewContent",
    construirParametrosPublicacion(publicacion),
  );

  if (registrado) {
    contenidosRegistrados.add(clave);
  }
};

export const registrarMetaAngelaContactoWhatsapp = (
  publicacion: MetaPublicacion,
) => {
  enviarEventoEstandar(
    META_PIXEL_ANGELA_ID,
    "Contact",
    construirParametrosPublicacion(publicacion),
  );
};

export const registrarMetaAngelaAperturaAgendaVisita = (
  publicacion: MetaPublicacion,
) => {
  enviarEventoPersonalizado(
    META_PIXEL_ANGELA_ID,
    "VisitRequestStarted",
    construirParametrosPublicacion(publicacion),
  );
};

export const registrarMetaAngelaLeadSolicitudVisita = (
  publicacion: MetaPublicacion,
) => {
  enviarEventoEstandar(
    META_PIXEL_ANGELA_ID,
    "Lead",
    construirParametrosPublicacion(publicacion),
  );
};
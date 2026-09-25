import axiosInstance from "./axiosInstance";

import {
  ActualizarMiPerfilVendedorRequest,
  ApiResponse,
  PerfilPublicoVendedor,
  PublicacionPerfilVendedor,
} from "../types/perfilVendedor.types";

const obtenerData = <T>(response: any): T => {
  return (response?.Data ?? response?.data) as T;
};

const normalizarImagen = (img: any) => {
  if (!img) return null;

  if (typeof img === "string") {
    return {
      mainUrl: img,
      thumbUrl: img,
    };
  }

  const mainUrl =
    img?.mainUrl || img?.MainUrl || img?.url || img?.Url || img?.thumbUrl || "";

  const thumbUrl =
    img?.thumbUrl ||
    img?.ThumbUrl ||
    img?.mainUrl ||
    img?.MainUrl ||
    img?.url ||
    img?.Url ||
    "";

  if (!mainUrl && !thumbUrl) {
    return null;
  }

  return {
    mainUrl: mainUrl || thumbUrl,

    thumbUrl: thumbUrl || mainUrl,
  };
};

const normalizarPlanCredito = (valor: any) => {
  if (!valor) {
    return null;
  }

  const opcionesOriginales = Array.isArray(valor)
    ? valor
    : valor?.opciones || valor?.Opciones || [];

  if (!Array.isArray(opcionesOriginales) || opcionesOriginales.length === 0) {
    return null;
  }

  const opciones = opcionesOriginales
    .map((item: any) => ({
      cuotas: Number(item?.cuotas ?? item?.Cuotas ?? 0),

      valorCuota: Number(item?.valorCuota ?? item?.ValorCuota ?? 0),
    }))
    .filter((item: any) => item.cuotas > 0 && item.valorCuota > 0);

  if (opciones.length === 0) {
    return null;
  }

  return {
    opciones,
  };
};

const mapearDetallePublicacionPerfil = (p: any): PublicacionPerfilVendedor => {
  const imagenesOriginales = Array.isArray(p?.imagenes || p?.Imagenes)
    ? p.imagenes || p.Imagenes
    : [];

  const imagenes = imagenesOriginales
    .map(normalizarImagen)
    .filter(Boolean) as Array<{
    mainUrl: string;
    thumbUrl?: string;
  }>;

  const imagenPrincipal =
    p?.imagenPrincipal ||
    p?.ImagenPrincipal ||
    imagenes[0]?.mainUrl ||
    p?.thumbUrl ||
    p?.ThumbUrl ||
    "";

  const thumbUrl =
    p?.thumbUrl ||
    p?.ThumbUrl ||
    imagenes[0]?.thumbUrl ||
    imagenPrincipal ||
    "";

  return {
    id: p?.id ?? p?.Id ?? 0,

    titulo: p?.titulo ?? p?.Titulo ?? p?.nombre ?? p?.Nombre ?? "",

    descripcion: p?.descripcion ?? p?.Descripcion ?? "",

    precio: p?.precio ?? p?.Precio ?? 0,

    moneda: p?.moneda ?? p?.Moneda ?? "PYG",

    categoria: p?.categoria ?? p?.Categoria ?? "",

    ubicacion: p?.ubicacion ?? p?.Ubicacion ?? "",

    estado: p?.estado ?? p?.Estado ?? "Activo",

    canalPublicacion: p?.canalPublicacion ?? p?.CanalPublicacion ?? "VITRINA",

    imagenPrincipal,

    thumbUrl,

    imagenes,

    mostrarBotonesCompra:
      p?.mostrarBotonesCompra ?? p?.MostrarBotonesCompra ?? false,

    permiteDelivery: p?.permiteDelivery ?? p?.PermiteDelivery ?? false,

    PermiteDelivery: p?.PermiteDelivery ?? p?.permiteDelivery ?? false,

    esDestacada: p?.esDestacada ?? p?.EsDestacada ?? false,

    fechaFinDestacado: p?.fechaFinDestacado ?? p?.FechaFinDestacado ?? null,

    esTemporada: p?.esTemporada ?? p?.EsTemporada ?? false,

    fechaFinTemporada: p?.fechaFinTemporada ?? p?.FechaFinTemporada ?? null,

    badgeTexto: p?.badgeTexto ?? p?.BadgeTexto ?? null,

    badgeColor: p?.badgeColor ?? p?.BadgeColor ?? null,

    googleMapsUrl: p?.googleMapsUrl ?? p?.GoogleMapsUrl ?? null,

    latitud: p?.latitud ?? p?.Latitud ?? null,

    longitud: p?.longitud ?? p?.Longitud ?? null,

    planCredito: normalizarPlanCredito(p?.planCredito ?? p?.PlanCredito),

    esFavorito: p?.esFavorito ?? p?.EsFavorito ?? false,

    cantidadFavoritos: Number(
      p?.cantidadFavoritos ?? p?.CantidadFavoritos ?? 0,
    ),

    cantidadVistas: Number(p?.cantidadVistas ?? p?.CantidadVistas ?? 0),

    cantidadClicksWhatsapp: Number(
      p?.cantidadClicksWhatsapp ?? p?.CantidadClicksWhatsapp ?? 0,
    ),
  };
};

const mapearPerfilVendedor = (data: any): PerfilPublicoVendedor => {
  const publicacionesOriginales =
    data?.publicaciones ?? data?.Publicaciones ?? [];

  const publicaciones = Array.isArray(publicacionesOriginales)
    ? publicacionesOriginales.map(mapearDetallePublicacionPerfil)
    : [];

  const ofreceDelivery = Boolean(
    data?.ofreceDelivery ?? data?.OfreceDelivery ?? false,
  );

  const zonaDelivery = data?.zonaDelivery ?? data?.ZonaDelivery ?? "";

  const costoDelivery = data?.costoDelivery ?? data?.CostoDelivery ?? "";

  const tiempoEstimadoDelivery =
    data?.tiempoEstimadoDelivery ?? data?.TiempoEstimadoDelivery ?? "";

  return {
    idVendedor: data?.idVendedor ?? data?.IdVendedor ?? 0,

    idUsuario: data?.idUsuario ?? data?.IdUsuario ?? 0,

    slug: data?.slug ?? data?.Slug ?? "",

    nombreNegocio: data?.nombreNegocio ?? data?.NombreNegocio ?? "",

    nombreUsuario: data?.nombreUsuario ?? data?.NombreUsuario ?? "",

    descripcion: data?.descripcion ?? data?.Descripcion ?? "",

    bannerUrl: data?.bannerUrl ?? data?.BannerUrl ?? "",

    bannerTipo: data?.bannerTipo ?? data?.BannerTipo ?? undefined,

    fotoPerfil: data?.fotoPerfil ?? data?.FotoPerfil ?? "",

    rubro: data?.rubro ?? data?.Rubro ?? "",

    ciudadVisible: data?.ciudadVisible ?? data?.CiudadVisible ?? "",

    telefono: data?.telefono ?? data?.Telefono ?? "",

    whatsapp: data?.whatsapp ?? data?.Whatsapp ?? "",

    email: data?.email ?? data?.Email ?? "",

    correoContacto: data?.correoContacto ?? data?.CorreoContacto ?? "",

    instagramUrl: data?.instagramUrl ?? data?.InstagramUrl ?? "",

    facebookUrl: data?.facebookUrl ?? data?.FacebookUrl ?? "",

    esPerfilPublico: data?.esPerfilPublico ?? data?.EsPerfilPublico ?? false,

    esPremium: data?.esPremium ?? data?.EsPremium ?? false,

    mostrarTelefono: data?.mostrarTelefono ?? data?.MostrarTelefono ?? false,

    mostrarEmail: data?.mostrarEmail ?? data?.MostrarEmail ?? false,

    mostrarCorreo: data?.mostrarEmail ?? data?.MostrarEmail ?? false,

    ofreceDelivery,

    OfreceDelivery: ofreceDelivery,

    zonaDelivery,

    ZonaDelivery: zonaDelivery,

    costoDelivery,

    CostoDelivery: costoDelivery,

    tiempoEstimadoDelivery,

    TiempoEstimadoDelivery: tiempoEstimadoDelivery,

    cantidadPublicaciones:
      data?.cantidadPublicaciones ??
      data?.CantidadPublicaciones ??
      publicaciones.length,

    publicaciones,
  };
};

export const obtenerPerfilPublicoVendedor = async (
  slug: string,
): Promise<PerfilPublicoVendedor> => {
  const response = await axiosInstance.get<ApiResponse<PerfilPublicoVendedor>>(
    `/PerfilesVendedores/${slug}`,
  );

  return mapearPerfilVendedor(obtenerData(response.data));
};

export const obtenerMiPerfilVendedor =
  async (): Promise<PerfilPublicoVendedor> => {
    const response = await axiosInstance.get<
      ApiResponse<PerfilPublicoVendedor>
    >("/PerfilesVendedores/mi-perfil");

    return mapearPerfilVendedor(obtenerData(response.data));
  };

export const actualizarMiPerfilVendedor = async (
  request: ActualizarMiPerfilVendedorRequest | FormData,
): Promise<PerfilPublicoVendedor> => {
  const formData =
    request instanceof FormData
      ? request
      : crearFormDataPerfilVendedor(request);

  const response = await axiosInstance.put<ApiResponse<PerfilPublicoVendedor>>(
    "/PerfilesVendedores/mi-perfil",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return mapearPerfilVendedor(obtenerData(response.data));
};

const crearFormDataPerfilVendedor = (
  request: ActualizarMiPerfilVendedorRequest,
): FormData => {
  const formData = new FormData();

  formData.append("NombreNegocio", request.nombreNegocio ?? "");

  formData.append("Slug", request.slug ?? "");

  formData.append("Rubro", request.rubro ?? "");

  formData.append("Descripcion", request.descripcion ?? "");

  formData.append("Whatsapp", request.whatsapp ?? "");

  formData.append("InstagramUrl", request.instagramUrl ?? "");

  formData.append("FacebookUrl", request.facebookUrl ?? "");

  formData.append("CorreoContacto", request.correoContacto ?? "");

  formData.append("MostrarEmail", String(request.mostrarEmail ?? false));

  formData.append("CiudadVisible", request.ciudadVisible ?? "");

  formData.append("EsPerfilPublico", String(request.esPerfilPublico ?? false));

  formData.append("MostrarTelefono", String(request.mostrarTelefono ?? false));

  formData.append("OfreceDelivery", String(request.ofreceDelivery ?? false));

  formData.append("ZonaDelivery", request.zonaDelivery ?? "");

  formData.append("CostoDelivery", request.costoDelivery ?? "");

  formData.append(
    "TiempoEstimadoDelivery",
    request.tiempoEstimadoDelivery ?? "",
  );

  if (request.fotoPerfil) {
    formData.append("FotoPerfil", request.fotoPerfil);
  }

  if (request.banner) {
    formData.append("Banner", request.banner);
  }

  return formData;
};

export const obtenerDetallePublicacionPerfil = async (
  idPublicacion: number,
): Promise<PublicacionPerfilVendedor> => {
  const response = await axiosInstance.get<ApiResponse<any>>(
    `/Publicaciones/obtener-publicacion/${idPublicacion}`,
  );

  return mapearDetallePublicacionPerfil(obtenerData(response.data));
};

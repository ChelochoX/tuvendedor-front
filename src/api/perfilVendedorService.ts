import axiosInstance from "./axiosInstance";
import {
  ActualizarMiPerfilVendedorRequest,
  ApiResponse,
  PerfilPublicoVendedor,
  PublicacionPerfilVendedor,
} from "../types/perfilVendedor.types";

export const obtenerPerfilPublicoVendedor = async (
  slug: string,
): Promise<PerfilPublicoVendedor> => {
  const response = await axiosInstance.get<ApiResponse<PerfilPublicoVendedor>>(
    `/PerfilesVendedores/${slug}`,
  );

  return response.data.Data;
};

export const obtenerMiPerfilVendedor =
  async (): Promise<PerfilPublicoVendedor> => {
    const response = await axiosInstance.get<
      ApiResponse<PerfilPublicoVendedor>
    >("/PerfilesVendedores/mi-perfil");

    return response.data.Data;
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

  return response.data.Data;
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

  if (request.fotoPerfil) {
    formData.append("FotoPerfil", request.fotoPerfil);
  }

  if (request.banner) {
    formData.append("Banner", request.banner);
  }

  return formData;
};

const normalizarImagen = (img: any) => {
  if (!img) return null;

  if (typeof img === "string") {
    return {
      mainUrl: img,
      thumbUrl: img,
    };
  }

  const mainUrl = img?.mainUrl || img?.url || img?.Url || img?.thumbUrl || "";
  const thumbUrl = img?.thumbUrl || img?.mainUrl || img?.url || img?.Url || "";

  if (!mainUrl && !thumbUrl) return null;

  return {
    mainUrl: mainUrl || thumbUrl,
    thumbUrl: thumbUrl || mainUrl,
  };
};

const mapearDetallePublicacionPerfil = (p: any): PublicacionPerfilVendedor => {
  const imagenesOriginales = Array.isArray(p?.imagenes || p?.Imagenes)
    ? p.imagenes || p.Imagenes
    : [];

  const imagenes = imagenesOriginales.map(normalizarImagen).filter(Boolean);

  const imagenPrincipal =
    imagenes[0]?.mainUrl ||
    p?.imagenPrincipal ||
    p?.ImagenPrincipal ||
    p?.thumbUrl ||
    p?.ThumbUrl ||
    "";

  const thumbUrl =
    imagenes[0]?.thumbUrl ||
    p?.thumbUrl ||
    p?.ThumbUrl ||
    imagenPrincipal ||
    "";

  return {
    id: p?.id ?? p?.Id ?? 0,
    titulo: p?.titulo ?? p?.Titulo ?? p?.nombre ?? p?.Nombre ?? "",
    descripcion: p?.descripcion ?? p?.Descripcion ?? "",
    precio: p?.precio ?? p?.Precio ?? 0,
    categoria: p?.categoria ?? p?.Categoria ?? "",
    ubicacion: p?.ubicacion ?? p?.Ubicacion ?? "",
    estado: p?.estado ?? p?.Estado ?? "Activo",
    imagenPrincipal,
    thumbUrl,
    esDestacada: p?.esDestacada ?? p?.EsDestacada ?? false,
    googleMapsUrl: p?.googleMapsUrl ?? p?.GoogleMapsUrl ?? null,
    latitud: p?.latitud ?? p?.Latitud ?? null,
    longitud: p?.longitud ?? p?.Longitud ?? null,
    imagenes,
  } as PublicacionPerfilVendedor;
};

export const obtenerDetallePublicacionPerfil = async (
  idPublicacion: number,
): Promise<PublicacionPerfilVendedor> => {
  const response = await axiosInstance.get<ApiResponse<any>>(
    `/Publicaciones/obtener-publicacion/${idPublicacion}`,
  );

  return mapearDetallePublicacionPerfil(response.data.Data);
};

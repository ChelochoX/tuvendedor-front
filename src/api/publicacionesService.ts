import instance from "./axiosInstance";
import { Producto, Imagen } from "../types/producto";
import { ApiResponse } from "../types/api";
import { Categoria } from "../types/categoria";

const API_URL = "/Publicaciones";

/**
 * Normaliza las imágenes recibidas desde el backend.
 *
 * Importante:
 * - No hacemos transformaciones Cloudinary en el front.
 * - No agregamos /upload/c_pad...
 * - El front solo consume lo que el backend ya dejó preparado.
 */
const normalizeImagenes = (arr?: any[]): Imagen[] => {
  if (!arr || arr.length === 0) return [];

  return arr
    .map((item) => {
      if (typeof item === "string") {
        return {
          mainUrl: item,
          thumbUrl: item,
        };
      }

      return {
        mainUrl:
          item.mainUrl ||
          item.MainUrl ||
          item.url ||
          item.Url ||
          item.imagenPrincipal ||
          item.ImagenPrincipal ||
          "",
        thumbUrl:
          item.thumbUrl ||
          item.ThumbUrl ||
          item.thumbnailUrl ||
          item.ThumbnailUrl ||
          item.url ||
          item.Url ||
          item.mainUrl ||
          item.MainUrl ||
          "",
      };
    })
    .filter((img) => Boolean(img.mainUrl));
};

const mapearProducto = (p: any): Producto => {
  const imagenes = normalizeImagenes(p.imagenes || p.Imagenes);

  const imagenFallback =
    p.imagen ||
    p.Imagen ||
    p.imagenPrincipal ||
    p.ImagenPrincipal ||
    p.url ||
    p.Url ||
    "";

  const imagenesFinales =
    imagenes.length > 0
      ? imagenes
      : imagenFallback
        ? [
            {
              mainUrl: imagenFallback,
              thumbUrl: p.thumbUrl || p.ThumbUrl || imagenFallback,
            },
          ]
        : [];

  return {
    ...p,
    id: p.id ?? p.Id,
    nombre: p.nombre ?? p.Nombre ?? p.titulo ?? p.Titulo ?? "",
    precio: p.precio ?? p.Precio ?? 0,
    moneda: p.moneda ?? p.Moneda ?? "PYG",
    categoria: p.categoria ?? p.Categoria ?? "",
    ubicacion: p.ubicacion ?? p.Ubicacion ?? "",
    descripcion: p.descripcion ?? p.Descripcion ?? "",
    estado: p.estado ?? p.Estado ?? "Activo",

    esDestacada: p.esDestacada ?? p.EsDestacada ?? false,
    fechaFinDestacado: p.fechaFinDestacado ?? p.FechaFinDestacado,

    esTemporada: p.esTemporada ?? p.EsTemporada ?? false,
    badgeTexto: p.badgeTexto ?? p.BadgeTexto,
    badgeColor: p.badgeColor ?? p.BadgeColor,
    fechaFinTemporada: p.fechaFinTemporada ?? p.FechaFinTemporada,

    mostrarBotonesCompra:
      p.mostrarBotonesCompra ?? p.MostrarBotonesCompra ?? false,

    vendedor: {
      nombre:
        p.vendedor?.nombre ??
        p.Vendedor?.Nombre ??
        p.nombreVendedor ??
        p.NombreVendedor ??
        "Tu Vendedor",
      avatar:
        p.vendedor?.avatar ??
        p.Vendedor?.Avatar ??
        p.avatarVendedor ??
        p.AvatarVendedor ??
        "",
      telefono:
        p.vendedor?.telefono ??
        p.Vendedor?.Telefono ??
        p.telefonoVendedor ??
        p.TelefonoVendedor ??
        "",
    },

    planCredito: p.planCredito ?? p.PlanCredito,

    imagenes: imagenesFinales,
  } as Producto;
};

const obtenerMensajeError = (error: any, mensajeDefault: string) => {
  return (
    error?.response?.data?.Message ||
    error?.response?.data?.Errors?.[0] ||
    error?.message ||
    mensajeDefault
  );
};

const validarRespuesta = <T>(
  result: ApiResponse<T>,
  mensajeDefault: string,
): T => {
  if (!result.Success) {
    const mensaje = result.Message || result.Errors?.[0] || mensajeDefault;
    const error = new Error(mensaje);
    (error as any).customErrors = result.Errors;
    throw error;
  }

  return result.Data;
};

/**
 * Crea una publicación.
 *
 * El FormData ya viene armado desde:
 * src/components/publicaciones/crear-publicacion/helper.ts
 */
export const crearPublicacion = async (formData: FormData): Promise<any> => {
  try {
    const response = await instance.post<ApiResponse<any>>(
      `${API_URL}/crear-publicacion`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return validarRespuesta(response.data, "No se pudo crear la publicación.");
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(error, "No se pudo crear la publicación."),
    );
  }
};

/**
 * Obtiene publicaciones del marketplace.
 */
export const obtenerPublicaciones = async (
  categoria?: string,
  nombre?: string,
): Promise<Producto[]> => {
  try {
    const response = await instance.get<ApiResponse<any[]>>(
      `${API_URL}/obtener-publicaciones`,
      {
        params: {
          categoria,
          nombre,
        },
      },
    );

    const data = validarRespuesta(
      response.data,
      "Error al obtener publicaciones.",
    );

    return (data || []).map(mapearProducto);
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(error, "Error al obtener publicaciones."),
    );
  }
};

/**
 * Obtiene publicaciones del usuario autenticado.
 */
export const obtenerMisPublicaciones = async (): Promise<Producto[]> => {
  try {
    const response = await instance.get<ApiResponse<any[]>>(
      `${API_URL}/mis-publicaciones`,
    );

    const data = validarRespuesta(
      response.data,
      "Error al obtener tus publicaciones.",
    );

    return (data || []).map(mapearProducto);
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(error, "Error al obtener tus publicaciones."),
    );
  }
};

/**
 * Elimina una publicación.
 */
export const eliminarPublicacion = async (id: number): Promise<void> => {
  try {
    const response = await instance.delete<ApiResponse<any>>(
      `${API_URL}/eliminar-publicacion/${id}`,
    );

    validarRespuesta(response.data, "Error al eliminar publicación.");
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(error, "Error al eliminar publicación."),
    );
  }
};

/**
 * Lista categorías.
 */
export const obtenerCategorias = async (): Promise<Categoria[]> => {
  try {
    const response = await instance.get<ApiResponse<Categoria[]>>(
      `${API_URL}/listar-categorias`,
    );

    return validarRespuesta(response.data, "Error al obtener categorías.");
  } catch (error: any) {
    throw new Error(obtenerMensajeError(error, "Error al obtener categorías."));
  }
};

/**
 * Destaca una publicación.
 */
export const destacarPublicacion = async (
  idPublicacion: number,
  duracionDias: number = 7,
): Promise<void> => {
  try {
    const response = await instance.post<ApiResponse<any>>(
      `${API_URL}/destacar-publicacion`,
      {
        idPublicacion,
        duracionDias,
      },
    );

    validarRespuesta(response.data, "Error al destacar publicación.");
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(error, "Error al destacar publicación."),
    );
  }
};

/**
 * Quita destacado de una publicación.
 */
export const quitarDestacadoPublicacion = async (
  idPublicacion: number,
): Promise<void> => {
  try {
    const response = await instance.post<ApiResponse<any>>(
      `${API_URL}/quitar-destacado-publicacion`,
      {
        idPublicacion,
      },
    );

    validarRespuesta(response.data, "Error al quitar destacado.");
  } catch (error: any) {
    throw new Error(obtenerMensajeError(error, "Error al quitar destacado."));
  }
};

/**
 * Lista temporadas activas/configuradas.
 */
export const obtenerTemporadas = async (): Promise<any[]> => {
  try {
    const response = await instance.get<ApiResponse<any[]>>(
      `${API_URL}/listar-temporadas`,
    );

    return validarRespuesta(response.data, "Error al obtener temporadas.");
  } catch (error: any) {
    throw new Error(obtenerMensajeError(error, "Error al obtener temporadas."));
  }
};

/**
 * Activa temporada para una publicación.
 */
export const activarTemporada = async (
  idPublicacion: number,
  idTemporada: number,
): Promise<void> => {
  try {
    const response = await instance.post<ApiResponse<any>>(
      `${API_URL}/activar-temporada`,
      {
        idPublicacion,
        idTemporada,
      },
    );

    validarRespuesta(response.data, "Error al activar temporada.");
  } catch (error: any) {
    throw new Error(obtenerMensajeError(error, "Error al activar temporada."));
  }
};

/**
 * Desactiva temporada de una publicación.
 */
export const desactivarTemporada = async (
  idPublicacion: number,
): Promise<void> => {
  try {
    const response = await instance.post<ApiResponse<any>>(
      `${API_URL}/desactivar-temporada`,
      {
        idPublicacion,
      },
    );

    validarRespuesta(response.data, "Error al desactivar temporada.");
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(error, "Error al desactivar temporada."),
    );
  }
};

/**
 * Envía sugerencia.
 */
export const enviarSugerencia = async (comentario: string): Promise<void> => {
  try {
    const response = await instance.post<ApiResponse<any>>(
      `${API_URL}/crear-sugerencia`,
      {
        comentario,
      },
    );

    validarRespuesta(response.data, "No se pudo enviar la sugerencia.");
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(error, "No se pudo enviar la sugerencia."),
    );
  }
};

/**
 * Marca publicación como vendida.
 */
export const marcarComoVendido = async (
  idPublicacion: number,
): Promise<void> => {
  try {
    const response = await instance.post<ApiResponse<any>>(
      `${API_URL}/marcar-vendido`,
      {
        idPublicacion,
      },
    );

    validarRespuesta(response.data, "No se pudo marcar como vendido.");
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(error, "No se pudo marcar como vendido."),
    );
  }
};

export const actualizarPublicacion = async (
  id: number,
  request: FormData,
): Promise<void> => {
  await instance.put(`/Publicaciones/actualizar-publicacion/${id}`, request, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const obtenerPublicacionPorId = async (id: number): Promise<any> => {
  try {
    const response = await instance.get<ApiResponse<any>>(
      `${API_URL}/obtener-publicacion/${id}`,
    );

    return validarRespuesta(
      response.data,
      "Error al obtener detalle de la publicación.",
    );
  } catch (error: any) {
    throw new Error(
      obtenerMensajeError(error, "Error al obtener detalle de la publicación."),
    );
  }
};

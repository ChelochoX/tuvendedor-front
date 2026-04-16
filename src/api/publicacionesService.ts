import instance from "./axiosInstance";
import { Producto } from "../types/producto";
import { ApiResponse } from "../types/api";
import { Categoria } from "../types/categoria";

const API_URL = "/Publicaciones";

/**
 * ✅ Normaliza "imagenes" desde backend al formato del front:
 * [{ mainUrl, thumbUrl }]
 *
 * Soporta:
 * 1) Nuevo: [{ mainUrl, thumbUrl }] o PascalCase [{ MainUrl, ThumbUrl }]
 * 2) Legacy: ["url1", "url2"]
 *
 * Regla:
 * - thumbUrl: si no viene, se usa mainUrl (para no romper UI)
 */
const normalizeImagenes = (
  raw: any,
): { mainUrl: string; thumbUrl: string }[] => {
  if (!raw) return [];

  // Caso nuevo: array de objetos
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object") {
    return raw
      .map((x: any) => {
        const mainUrl = x.mainUrl || x.MainUrl || x.url || x.Url || "";
        const thumbUrl =
          x.thumbUrl ||
          x.ThumbUrl ||
          x.thumbnailUrl ||
          x.ThumbnailUrl ||
          mainUrl;

        return { mainUrl, thumbUrl };
      })
      .filter((x) => !!x.mainUrl);
  }

  // Caso viejo: array de strings
  if (Array.isArray(raw) && (raw.length === 0 || typeof raw[0] === "string")) {
    return raw
      .map((url: string) => ({ mainUrl: url, thumbUrl: url }))
      .filter((x) => !!x.mainUrl);
  }

  return [];
};

/**
 * ✅ Mapea item del backend a Producto del front
 * - Respeta lo que viene del back (thumbUrl ya viene listo)
 * - Mantiene compatibilidad por si algún componente usa p.imagen o p.miniatura
 */
const mapearProducto = (p: any): Producto => {
  const imagenes = normalizeImagenes(p.imagenes ?? p.Imagenes);

  const imagenPrincipal = imagenes[0]?.mainUrl || p.imagen || p.Imagen || "";
  const miniaturaPrincipal =
    imagenes[0]?.thumbUrl || p.miniatura || p.Miniatura || imagenPrincipal;

  return {
    id: p.id ?? p.Id,
    nombre: p.nombre ?? p.Nombre ?? p.titulo ?? p.Titulo,
    precio: p.precio ?? p.Precio ?? 0,
    categoria: p.categoria ?? p.Categoria ?? "",
    ubicacion: p.ubicacion ?? p.Ubicacion ?? "",
    descripcion: p.descripcion ?? p.Descripcion ?? "",
    estado: p.estado ?? p.Estado ?? "Activo",

    mostrarBotonesCompra: p.mostrarBotonesCompra ?? p.MostrarBotonesCompra,

    esDestacada: p.esDestacada ?? p.EsDestacada,
    fechaFinDestacado: p.fechaFinDestacado ?? p.FechaFinDestacado,

    esTemporada: p.esTemporada ?? p.EsTemporada,
    badgeTexto: p.badgeTexto ?? p.BadgeTexto,
    badgeColor: p.badgeColor ?? p.BadgeColor,
    fechaFinTemporada: p.fechaFinTemporada ?? p.FechaFinTemporada,

    vendedor: {
      nombre:
        p.vendedor?.nombre ??
        p.Vendedor?.Nombre ??
        p.vendedorNombre ??
        p.VendedorNombre ??
        "Sin nombre",
      avatar: p.vendedor?.avatar ?? p.Vendedor?.Avatar ?? "",
      telefono:
        p.vendedor?.telefono ??
        p.Vendedor?.Telefono ??
        p.vendedorTelefono ??
        p.VendedorTelefono ??
        "",
    },

    planCredito: p.planCredito ?? p.PlanCredito,

    // ✅ clave
    imagenes,

    // ✅ compatibilidad por si el front aún usa estos campos
    imagen: imagenPrincipal,
    miniatura: miniaturaPrincipal,
  } as Producto;
};

export const crearPublicacion = async (payload: {
  titulo: string;
  descripcion: string;
  precio: string;
  categoria: string;
  imagenes: File[];
  mostrarBotonesCompra: boolean;
  planCredito?: { cuotas: number; valorCuota: number }[];
}): Promise<any> => {
  const formData = new FormData();

  formData.append("Titulo", payload.titulo);
  formData.append("Descripcion", payload.descripcion);
  formData.append("Precio", payload.precio);
  formData.append("Categoria", payload.categoria);
  formData.append(
    "MostrarBotonesCompra",
    payload.mostrarBotonesCompra.toString(),
  );

  payload.imagenes.forEach((img) => {
    formData.append("Imagenes", img);
  });

  if (payload.mostrarBotonesCompra && payload.planCredito) {
    payload.planCredito.forEach((plan, i) => {
      formData.append(`PlanCredito[${i}].Cuotas`, plan.cuotas.toString());
      formData.append(
        `PlanCredito[${i}].ValorCuota`,
        plan.valorCuota.toString(),
      );
    });
  }

  const response = await instance.post<ApiResponse<any>>(
    `${API_URL}/crear-publicacion`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  const result = response.data;

  if (!result.Success) {
    const mensaje =
      result.Message || result.Errors?.[0] || "Error desconocido.";
    const error = new Error(mensaje);
    (error as any).customErrors = result.Errors;
    throw error;
  }

  return result.Data;
};

// 🚀 obtener publicaciones
export const obtenerPublicaciones = async (
  categoria?: string,
  nombre?: string,
): Promise<Producto[]> => {
  const response = await instance.get<ApiResponse<any[]>>(
    `${API_URL}/obtener-publicaciones`,
    { params: { categoria, nombre } },
  );

  const result = response.data;
  if (!result.Success) {
    throw new Error(result.Errors?.[0] || "Error al obtener publicaciones");
  }

  return (result.Data || []).map(mapearProducto);
};

// 🚀 obtener mis publicaciones
export const obtenerMisPublicaciones = async (): Promise<Producto[]> => {
  const response = await instance.get<ApiResponse<any[]>>(
    `${API_URL}/mis-publicaciones`,
  );

  const result = response.data;
  if (!result.Success) {
    throw new Error(result.Errors?.[0] || "Error al obtener tus publicaciones");
  }

  return (result.Data || []).map(mapearProducto);
};

// 🗑️ eliminar publicación
export const eliminarPublicacion = async (id: number): Promise<void> => {
  const response = await instance.delete<ApiResponse<any>>(
    `${API_URL}/eliminar-publicacion/${id}`,
  );

  const result = response.data;
  if (!result.Success) {
    const mensaje =
      result.Message || result.Errors?.[0] || "Error al eliminar publicación.";
    const error = new Error(mensaje);
    (error as any).customErrors = result.Errors;
    throw error;
  }
};

export const obtenerCategorias = async (): Promise<Categoria[]> => {
  const response = await instance.get("/Publicaciones/listar-categorias");
  const result = response.data;

  if (!result.Success) {
    throw new Error(result.Message || "Error al obtener categorías");
  }

  return result.Data;
};

export const destacarPublicacion = async (
  idPublicacion: number,
  duracionDias: number = 7,
): Promise<void> => {
  try {
    const { data } = await instance.post<ApiResponse<any>>(
      "/Publicaciones/destacar-publicacion",
      { idPublicacion, duracionDias },
    );

    if (!data.Success) {
      throw new Error(data.Message || data.Errors?.[0] || "Error al destacar");
    }
  } catch (error: any) {
    const backendMsg =
      error.response?.data?.Message ||
      error.response?.data?.Errors?.[0] ||
      error.message ||
      "Error desconocido";

    throw new Error(backendMsg);
  }
};

// ⭐ temporadas
export const obtenerTemporadas = async () => {
  const response = await instance.get<ApiResponse<any[]>>(
    "/Publicaciones/listar-temporadas",
  );

  const result = response.data;
  if (!result.Success) {
    throw new Error(result.Message || "Error al obtener temporadas.");
  }

  return result.Data;
};

export const activarTemporada = async (
  idPublicacion: number,
  idTemporada: number,
) => {
  try {
    const { data } = await instance.post<ApiResponse<any>>(
      "/Publicaciones/activar-temporada",
      { idPublicacion, idTemporada },
    );

    if (!data.Success) {
      throw new Error(data.Message || data.Errors?.[0]);
    }
  } catch (error: any) {
    const backendMsg =
      error.response?.data?.Message ||
      error.response?.data?.Errors?.[0] ||
      "Error al activar temporada";

    throw new Error(backendMsg);
  }
};

export const desactivarTemporada = async (idPublicacion: number) => {
  try {
    const { data } = await instance.post<ApiResponse<any>>(
      "/Publicaciones/desactivar-temporada",
      { idPublicacion },
    );

    if (!data.Success) throw new Error(data.Message || data.Errors?.[0]);
  } catch (error: any) {
    const backendMsg =
      error.response?.data?.Message ||
      error.response?.data?.Errors?.[0] ||
      "Error al desactivar temporada";

    throw new Error(backendMsg);
  }
};

/**
 * ✅ Publicaciones especiales (temporada)
 * - Solo fallback (sin llamar a /listar-especiales) para evitar 404
 */
export const obtenerPublicacionesEspeciales = async (): Promise<Producto[]> => {
  const response = await instance.get<ApiResponse<any[]>>(
    `${API_URL}/obtener-publicaciones`,
  );

  const result = response.data;
  if (!result.Success) {
    throw new Error(result.Errors?.[0] || "Error al obtener especiales");
  }

  const ahora = new Date();

  const especiales = (result.Data || []).filter((p: any) => {
    const esTemporada = p.esTemporada ?? p.EsTemporada;
    if (!esTemporada) return false;

    const finRaw = p.fechaFinTemporada ?? p.FechaFinTemporada;
    if (finRaw) {
      const fin = new Date(finRaw);
      return fin >= ahora;
    }
    return true;
  });

  return especiales.map(mapearProducto);
};

export const enviarSugerencia = async (comentario: string): Promise<void> => {
  try {
    const { data } = await instance.post<ApiResponse<any>>(
      `${API_URL}/crear-sugerencia`,
      { comentario },
    );

    if (!data.Success) {
      const mensaje =
        data.Message || data.Errors?.[0] || "No se pudo enviar la sugerencia.";
      throw new Error(mensaje);
    }
  } catch (error: any) {
    const backendMsg =
      error.response?.data?.Message ||
      error.response?.data?.Errors?.[0] ||
      error.message ||
      "Error al enviar la sugerencia.";

    throw new Error(backendMsg);
  }
};

export const marcarComoVendido = async (
  idPublicacion: number,
): Promise<void> => {
  try {
    const { data } = await instance.post<ApiResponse<any>>(
      "/Publicaciones/marcar-vendido",
      { idPublicacion },
    );

    if (!data.Success) {
      throw new Error(
        data.Message || data.Errors?.[0] || "No se pudo marcar como vendido.",
      );
    }
  } catch (error: any) {
    const backendMsg =
      error.response?.data?.Message ||
      error.response?.data?.Errors?.[0] ||
      error.message;

    throw new Error(backendMsg);
  }
};

export const quitarDestacadoPublicacion = async (
  idPublicacion: number,
): Promise<void> => {
  try {
    const { data } = await instance.post<ApiResponse<any>>(
      "/Publicaciones/quitar-destacado-publicacion",
      { idPublicacion },
    );

    if (!data.Success) {
      throw new Error(data.Message || data.Errors?.[0]);
    }
  } catch (error: any) {
    const backendMsg =
      error.response?.data?.Message ||
      error.response?.data?.Errors?.[0] ||
      error.message ||
      "Error al quitar destacado";

    throw new Error(backendMsg);
  }
};

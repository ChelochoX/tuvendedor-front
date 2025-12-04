import instance from "./axiosInstance";
import { Producto } from "../types/producto";
import { ApiResponse } from "../types/api";
import { Categoria } from "../types/categoria";

const API_URL = "/Publicaciones";

// helper: convierte una URL normal en miniatura WebP 300x300 (con Cloudinary)
const toThumbUrl = (url: string) => {
  if (!url) return "";
  return url.replace("/upload/", "/upload/c_pad,b_white,w_300,h_300/");
};

// helper: normaliza array de strings a array de objetos { mainUrl, thumbUrl }
const normalizeImagenes = (arr?: string[]) => {
  if (!arr || arr.length === 0) return [];

  return arr.map((url) => ({
    mainUrl: url,
    thumbUrl: toThumbUrl(url),
  }));
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
    payload.mostrarBotonesCompra.toString()
  );

  // Agregamos imágenes
  payload.imagenes.forEach((img) => {
    formData.append("Imagenes", img);
  });

  // Agregamos plan de crédito si viene
  if (payload.mostrarBotonesCompra && payload.planCredito) {
    payload.planCredito.forEach((plan, i) => {
      formData.append(`PlanCredito[${i}].Cuotas`, plan.cuotas.toString());
      formData.append(
        `PlanCredito[${i}].ValorCuota`,
        plan.valorCuota.toString()
      );
    });
  }

  const response = await instance.post<ApiResponse<any>>(
    `${API_URL}/crear-publicacion`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
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

// 🚀 USO PRINCIPAL: obtener publicaciones con imágenes normalizadas
export const obtenerPublicaciones = async (
  categoria?: string,
  nombre?: string
): Promise<Producto[]> => {
  const response = await instance.get<ApiResponse<any[]>>(
    `${API_URL}/obtener-publicaciones`,
    {
      params: { categoria, nombre },
    }
  );

  const result = response.data;

  if (!result.Success) {
    throw new Error(result.Errors?.[0] || "Error al obtener publicaciones");
  }

  // normalizamos los datos recibidos
  const productos = result.Data || [];

  return productos.map((p) => {
    const imagenes = normalizeImagenes(p.imagenes);
    return {
      ...p,
      estado: p.estado,
      imagenes,
      imagen: imagenes[0]?.mainUrl || "", // compatibilidad
    } as Producto;
  });
};

// 🗑️ Eliminar publicación
export const eliminarPublicacion = async (id: number): Promise<void> => {
  const response = await instance.delete<ApiResponse<any>>(
    `${API_URL}/eliminar-publicacion/${id}`
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

// 🚀 Obtener solo las publicaciones del usuario autenticado
export const obtenerMisPublicaciones = async (): Promise<Producto[]> => {
  const response = await instance.get<ApiResponse<any[]>>(
    `${API_URL}/mis-publicaciones`
  );

  const result = response.data;

  if (!result.Success) {
    throw new Error(result.Errors?.[0] || "Error al obtener tus publicaciones");
  }

  const productos = result.Data || [];

  return productos.map((p) => {
    const imagenes = normalizeImagenes(p.imagenes);
    return {
      ...p,
      imagenes,
      imagen: imagenes[0]?.mainUrl || "",
    } as Producto;
  });
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
  duracionDias: number = 7
): Promise<void> => {
  try {
    const { data } = await instance.post<ApiResponse<any>>(
      "/Publicaciones/destacar-publicacion",
      { idPublicacion, duracionDias }
    );

    if (!data.Success) {
      throw new Error(data.Message || data.Errors?.[0] || "Error al destacar");
    }
  } catch (error: any) {
    // ⬅️ AQUÍ interpretamos el error del backend REAL
    const backendMsg =
      error.response?.data?.Message ||
      error.response?.data?.Errors?.[0] ||
      error.message ||
      "Error desconocido";

    throw new Error(backendMsg);
  }
};

// ⭐ Obtener lista de temporadas activas
export const obtenerTemporadas = async () => {
  const response = await instance.get<ApiResponse<any[]>>(
    "/Publicaciones/listar-temporadas"
  );

  const result = response.data;

  if (!result.Success) {
    throw new Error(result.Message || "Error al obtener temporadas.");
  }

  return result.Data; // array de TemporadaDto
};

// ⭐ Activar temporada
export const activarTemporada = async (
  idPublicacion: number,
  idTemporada: number
) => {
  try {
    const { data } = await instance.post<ApiResponse<any>>(
      "/Publicaciones/activar-temporada",
      {
        idPublicacion,
        idTemporada,
      }
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

// ⛔ Desactivar temporada
export const desactivarTemporada = async (idPublicacion: number) => {
  try {
    const { data } = await instance.post<ApiResponse<any>>(
      "/Publicaciones/desactivar-temporada",
      { idPublicacion }
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

// ⬇️ pegá esto en publicacionesService.ts (debajo de tus helpers estaría bien)

// Mapea y normaliza un item del backend a Producto con miniaturas
const mapearProducto = (p: any): Producto => {
  const imagenes = normalizeImagenes(p.imagenes);
  return {
    ...p,
    imagenes,
    imagen: imagenes[0]?.mainUrl || "",
  } as Producto;
};

/**
 * Obtiene SIEMPRE las publicaciones "especiales" (temporada) para el carrusel,
 * independientemente de la categoría que esté seleccionada en la UI.
 *
 * 1) Intenta usar un endpoint opcional del backend (/Publicaciones/listar-especiales).
 * 2) Si no existe, hace fallback a /Publicaciones/obtener-publicaciones y filtra en el cliente.
 */
export const obtenerPublicacionesEspeciales = async (): Promise<Producto[]> => {
  // 1) intento (silencioso) con endpoint dedicado
  try {
    const resp = await instance.get<ApiResponse<any[]>>(
      `${API_URL}/listar-especiales`
    );
    if (resp.data?.Success && Array.isArray(resp.data.Data)) {
      return (resp.data.Data || []).map(mapearProducto);
    }
  } catch {
    // ignoramos y pasamos al fallback
  }

  // 2) fallback: traemos todo y filtramos en front por esTemporada + fecha vigente
  const response = await instance.get<ApiResponse<any[]>>(
    `${API_URL}/obtener-publicaciones`
  );

  const result = response.data;
  if (!result.Success) {
    throw new Error(result.Errors?.[0] || "Error al obtener especiales");
  }

  const ahora = new Date();

  const especiales = (result.Data || []).filter((p: any) => {
    if (!p.esTemporada) return false;

    // si el back envía fechaFinTemporada, validamos que siga vigente
    if (p.fechaFinTemporada) {
      const fin = new Date(p.fechaFinTemporada);
      return fin >= ahora;
    }
    return true; // si no viene fecha, lo consideramos activo
  });

  return especiales.map(mapearProducto);
};

export const enviarSugerencia = async (comentario: string): Promise<void> => {
  try {
    const { data } = await instance.post<ApiResponse<any>>(
      `${API_URL}/crear-sugerencia`,
      { comentario }
    );

    if (!data.Success) {
      const mensaje =
        data.Message || data.Errors?.[0] || "No se pudo enviar la sugerencia.";
      throw new Error(mensaje);
    }
  } catch (error: any) {
    console.error(
      "Error en petición API:",
      error.response?.data || error.message || error
    );

    const backendMsg =
      error.response?.data?.Message ||
      error.response?.data?.Errors?.[0] ||
      error.message ||
      "Error al enviar la sugerencia.";

    throw new Error(backendMsg);
  }
};

export const marcarComoVendido = async (
  idPublicacion: number
): Promise<void> => {
  try {
    const { data } = await instance.post<ApiResponse<any>>(
      "/Publicaciones/marcar-vendido",
      { idPublicacion }
    );

    if (!data.Success) {
      throw new Error(
        data.Message || data.Errors?.[0] || "No se pudo marcar como vendido."
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

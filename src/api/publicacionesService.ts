import instance from "./axiosInstance";
import { Producto } from "../types/producto";
import { ApiResponse } from "../types/api";

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
      imagenes,
      imagen: imagenes[0]?.mainUrl || "", // compatibilidad
    } as Producto;
  });
};

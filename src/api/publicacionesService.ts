import instance from "./axiosInstance";
import { ApiResponse } from "../types/api";

const API_URL = "/Publicaciones";

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
    throw new Error(result.Errors?.[0] || "Error al crear la publicación");
  }

  return result.Data;
};

import axiosInstance from "./axiosInstance";
import {
  ActualizarMiPerfilVendedorRequest,
  ApiResponse,
  PerfilPublicoVendedor,
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
  request: ActualizarMiPerfilVendedorRequest,
): Promise<PerfilPublicoVendedor> => {
  const formData = new FormData();

  formData.append("NombreNegocio", request.nombreNegocio ?? "");
  formData.append("Slug", request.slug ?? "");
  formData.append("Rubro", request.rubro ?? "");
  formData.append("Descripcion", request.descripcion ?? "");

  formData.append("Whatsapp", request.whatsapp ?? "");
  formData.append("InstagramUrl", request.instagramUrl ?? "");
  formData.append("FacebookUrl", request.facebookUrl ?? "");

  // Nuevo correo
  formData.append("CorreoContacto", request.correoContacto ?? "");
  formData.append("MostrarEmail", String(request.mostrarEmail));

  formData.append("CiudadVisible", request.ciudadVisible ?? "");

  formData.append("EsPerfilPublico", String(request.esPerfilPublico));
  formData.append("MostrarTelefono", String(request.mostrarTelefono));

  if (request.fotoPerfil) {
    formData.append("FotoPerfil", request.fotoPerfil);
  }

  if (request.banner) {
    formData.append("Banner", request.banner);
  }

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

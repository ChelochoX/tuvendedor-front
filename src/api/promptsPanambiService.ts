import instance from "./axiosInstance";

export type PromptCatalogo = {
  codigo: string;
  titulo: string;
  descripcion: string;
  contenido: string;
  version: number;
  origen: "EDITOR" | "LEGADO" | "PREDETERMINADO";
};

export type PromptVersion = {
  id: number;
  codigo: string;
  version: number;
  contenido: string;
  estado: string;
  fechaCreacionUtc: string;
  idUsuario: number | null;
};

const base = "/admin/prompts-panambi";

const extraer = <T,>(res: { data: { success?: boolean; data: T; message?: string } }): T => {
  if (res.data?.success === false) throw new Error(res.data.message || "Error de administración de prompts");
  return res.data.data;
};

export const listarPrompts = async () => extraer<PromptCatalogo[]>(await instance.get(base));
export const versionesPrompt = async (codigo: string) =>
  extraer<PromptVersion[]>(await instance.get(`${base}/${encodeURIComponent(codigo)}/historial`));
export const publicarPrompt = async (codigo: string, contenido: string, versionEsperada: number) =>
  extraer<PromptVersion>(await instance.put(`${base}/${encodeURIComponent(codigo)}`, { contenido, versionEsperada }));
export const restaurarPrompt = async (codigo: string, version: number, versionEsperada: number) =>
  extraer<PromptVersion>(await instance.post(`${base}/${encodeURIComponent(codigo)}/restaurar`, { version, versionEsperada }));

export const textoErrorPrompt = (e: unknown): string => {
  const error = e as { response?: { data?: { message?: string }; status?: number }; message?: string };
  if (error?.response?.status === 403) return "No tenés permisos de administrador para modificar los prompts.";
  if (error?.response?.status === 401) return "Tu sesión expiró. Volvé a iniciar sesión.";
  return error?.response?.data?.message || error?.message || "No se pudo completar la operación.";
};

import instance from "./axiosInstance";

export interface CanalWhatsapp {
  id: string;
  nombre: string;
  principal: boolean;
  editable: boolean;
  controlable?: boolean;
  operativo?: boolean;
  puedeQr?: boolean;
  activo: boolean;
  listo: boolean;
  numero: string | null;
  estado: "CONECTADO" | "ESPERANDO_QR" | "INICIANDO" | "DESCONECTADO" | "DESCONECTADO_MANUAL" | "SIN_ACCESO";
  motivoDesconexion?: string | null;
}

type Envoltura<T> = { success: boolean; data: T; message?: string };
const BASE = "/admin/canales-whatsapp";

export async function listarCanalesWhatsapp() {
  const r = await instance.get<Envoltura<CanalWhatsapp[]>>(BASE);
  return r.data.data ?? [];
}
export async function crearCanalWhatsapp(nombre: string) {
  const r = await instance.post<Envoltura<{ id: string }>>(BASE, { nombre });
  return r.data.data;
}
export async function obtenerQrCanalWhatsapp(id: string) {
  const r = await instance.get<Envoltura<{ imagen: string | null; listo: boolean }>>(
    `${BASE}/${encodeURIComponent(id)}/qr`,
  );
  return r.data;
}
export async function configurarIaCanalWhatsapp(id: string, activo: boolean) {
  const r = await instance.put(`${BASE}/${encodeURIComponent(id)}/atencion`, { activo });
  return r.data;
}
export async function reiniciarCanalWhatsapp(id: string) {
  const r = await instance.post(`${BASE}/${encodeURIComponent(id)}/reiniciar`);
  return r.data;
}

export async function configurarConexionCanalWhatsapp(id: string, conectar: boolean) {
  const r = await instance.post(`${BASE}/${encodeURIComponent(id)}/conexion`, {conectar});
  return r.data;
}
export async function cerrarSesionCanalWhatsapp(id: string) {
  const r = await instance.post(`${BASE}/${encodeURIComponent(id)}/cerrar-sesion`);
  return r.data;
}

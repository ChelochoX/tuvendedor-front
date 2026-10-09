import axiosInstance from "./axiosInstance";

export type ModoSeguimiento = "SIMULACION" | "REAL";
export type UnidadDemora = "MINUTO" | "HORA" | "DIA";

export interface ReglaSeguimiento {
  id?: number;
  orden: number;
  demoraValor: number;
  demoraUnidad: UnidadDemora;
  mensaje: string;
  activo: boolean;
}
export interface ConfiguracionSeguimiento {
  activo: boolean;
  modoEnvio: ModoSeguimiento;
  separacionEnviosMinutos: number;
  horaInicio: string;
  horaFin: string;
  fechaDesdeElegibilidad: string | null;
  minutosReintentoTecnico: number;
  maximoReintentosTecnicos: number;
  reglas: ReglaSeguimiento[];
}
export interface EnvioSeguimiento {
  id: number;
  cliente: string;
  telefono: string;
  productoInteres?: string | null;
  numeroSeguimiento: number;
  programadoPara: string;
  estado: string;
  mensaje: string;
  ultimoError?: string | null;
  motivoCancelacion?: string | null;
}
interface Respuesta<T> {
  success: boolean;
  message?: string;
  data: T;
}
const RUTA = "/clientes/seguimiento-whatsapp";

function extraer<T>(respuesta: Respuesta<T>): T {
  const resultado = respuesta as Respuesta<T> & {
    Success?: boolean;
    Data?: T;
    Message?: string;
  };

  const success = resultado.Success ?? resultado.success;
  const data = resultado.Data ?? resultado.data;
  const message = resultado.Message ?? resultado.message;

  if (success !== true) {
    throw new Error(message || "Operación rechazada por el servidor.");
  }

  return data;
}
export async function obtenerConfiguracionSeguimiento() {
  const { data } = await axiosInstance.get<Respuesta<ConfiguracionSeguimiento>>(
    `${RUTA}/configuracion`,
  );
  return extraer(data);
}
export async function guardarConfiguracionSeguimiento(
  config: ConfiguracionSeguimiento,
) {
  const { data } = await axiosInstance.put<Respuesta<ConfiguracionSeguimiento>>(
    `${RUTA}/configuracion`,
    config,
  );
  return extraer(data);
}
export async function obtenerEnviosSeguimiento() {
  const { data } = await axiosInstance.get<Respuesta<EnvioSeguimiento[]>>(
    `${RUTA}/envios?limite=200`,
  );
  return extraer(data);
}
export async function procesarSeguimientosAhora() {
  const { data } = await axiosInstance.post<Respuesta<EnvioSeguimiento[]>>(
    `${RUTA}/procesar-ahora`,
  );
  return extraer(data);
}

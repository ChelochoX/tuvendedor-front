import instance from "./axiosInstance";

export type RubroProspectos = "INMUEBLES" | "MOTOS";
export type EstadoProspecto = "NUEVO" | "EN_REVISION" | "CONTACTADO" | "DESCARTADO";

export interface ProspectoDrive {
  id: number;
  rubro: string;
  solicitudCompra: string;
  distrito: string | null;
  departamento: string | null;
  presupuestoConfirmadoGs: string | null;
  importeMostradoGs: string | null;
  fechaDeteccionOriginal: string | null;
  fechaPublicacionOriginal: string | null;
  fuente: string | null;
  urlOriginal: string | null;
  confianza: string | null;
  motivoConfianza: string | null;
  prioridad: string | null;
  estadoFuente: string | null;
  observaciones: string | null;
  archivoOrigen: string | null;
  urlPlanilla: string | null;
  estadoGestion: EstadoProspecto;
  notasGestion: string | null;
  fechaPrimerRegistroUtc: string;
  fechaUltimaDeteccionUtc: string;
  fechaGestionUtc: string | null;
}

export interface ListadoProspectosDrive {
  items: ProspectoDrive[];
  total: number;
  nuevos: number;
  enRevision: number;
  contactados: number;
  totalUltimas24Horas: number;
  ultimaSincronizacionUtc: string | null;
  ultimaSincronizacionExitosa: boolean;
  ultimoError: string | null;
  pagina: number;
  porPagina: number;
}

export interface ResumenImportacion {
  planillas: number;
  filasLeidas: number;
  filasNuevas: number;
  filasRepetidas: number;
  filasOmitidas: number;
}

export async function listarProspectosDrive(params: {
  rubro: RubroProspectos;
  estado?: EstadoProspecto | "";
  buscar?: string;
  pagina?: number;
  porPagina?: number;
}): Promise<ListadoProspectosDrive> {
  const { data } = await instance.get("/admin/prospectos", { params });
  return data.data ?? data.Data;
}

export async function sincronizarProspectosDrive(): Promise<ResumenImportacion> {
  const { data } = await instance.post("/admin/prospectos/sincronizar");
  return data.data ?? data.Data;
}

export async function cambiarGestionProspecto(
  id: number,
  rubro: RubroProspectos,
  estadoGestion: EstadoProspecto,
  notasGestion: string,
): Promise<void> {
  await instance.patch(`/admin/prospectos/${id}/gestion`, {
    estadoGestion,
    notasGestion,
  }, { params: { rubro } });
}

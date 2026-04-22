import axiosInstance from "./axiosInstance";
import {
  ApiResponse,
  CrearSolicitudVisitaRequest,
  ResultadoSolicitudVisitaDto,
} from "../types/solicitudVisita.types";

export const crearSolicitudVisita = async (
  request: CrearSolicitudVisitaRequest,
): Promise<ResultadoSolicitudVisitaDto> => {
  const response = await axiosInstance.post<
    ApiResponse<ResultadoSolicitudVisitaDto>
  >("/SolicitudesVisita/crear", request);

  return response.data.Data;
};

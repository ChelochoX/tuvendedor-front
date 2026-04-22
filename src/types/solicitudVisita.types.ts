export interface CrearSolicitudVisitaRequest {
  idPublicacion: number;
  nombreInteresado: string;
  telefonoInteresado: string;
  fechaVisita: string;
  horaVisita: string;
  mensaje?: string;
}

export interface ResultadoSolicitudVisitaDto {
  idSolicitudVisita: number;
  notificadoVendedor: boolean;
  estado: string;
}

export interface ApiResponse<T> {
  Success: boolean;
  Data: T;
  Errors?: string[];
  StatusCode?: number;
  Message?: string;
}

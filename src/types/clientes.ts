// 🧩 Datos para registrar un interesado
export interface InteresadoRequest {
  nombre: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  productoInteres?: string;
  fechaProximoContacto?: string; // formato 'YYYY-MM-DD'
  descripcion?: string;
  aportaIPS: boolean;
  cantidadAportes: number;
  archivoConversacion?: File | null;
}

// 🧩 Datos retornados por el backend (según tabla Interesados)
export interface Interesado {
  id: number;
  nombre: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  productoInteres?: string;
  fechaRegistro: string;
  fechaProximoContacto?: string;
  estado?: string;
  descripcion?: string;
  usuarioResponsable?: string;
  aportaIPS: boolean;
  cantidadAportes: number;
  archivoUrl?: string;
}

// 🧩 Datos para registrar un seguimiento
export interface SeguimientoRequest {
  idInteresado: number;
  comentario: string;
}

// 🧩 Datos retornados por el backend (según tabla Seguimientos)
export interface Seguimiento {
  id: number;
  idInteresado: number;
  fecha: string;
  comentario: string;
  usuario: string;
}

// 🧩 Filtros (para listado de interesados)
export interface FiltroInteresadosRequest {
  nombre?: string;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  numeroPagina: number;
  registrosPorPagina: number;
}
// 🔹 Representa los datos que vienen del backend (DTO)
export interface InteresadoDto {
  id: number;
  nombre: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  productoInteres?: string;
  aportaIPS: boolean;
  cantidadAportes: number;
  estado?: string;
  fechaRegistro: string;
  fechaProximoContacto?: string;
  descripcion?: string;
  archivoUrl?: string;
  usuarioResponsable?: string;
}

// 🔹 Representa los datos de seguimientos que vienen del backend
export interface SeguimientoDto {
  id: number;
  idInteresado: number;
  comentario: string;
  fecha: string;
  usuario?: string;
}

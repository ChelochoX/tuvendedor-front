export interface Marca {
  id: number;
  nombre: string;
  estado: "Activo" | "Inactivo" | string;
}

export interface CrearMarcaRequest {
  nombre: string;
}

export interface EditarMarcaRequest {
  id: number;
  nombre: string;
}

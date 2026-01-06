export interface ModeloProducto {
  id: number;
  idMarca: number;
  marca: string;
  rubro: string;
  codigoReferencia: string;
  nombreModelo: string;
  estado: "Activo" | "Inactivo" | string;
}

export interface CrearModeloProductoRequest {
  idMarca: number;
  rubro: string;
  codigoReferencia: string;
  nombreModelo: string;
}

export interface EditarModeloProductoRequest {
  id: number;
  idMarca: number;
  nombreModelo: string;
  codigoReferencia?: string;
}

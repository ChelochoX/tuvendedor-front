// src/types/producto.ts

export interface Imagen {
  mainUrl: string;
  thumbUrl: string;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  ubicacion: string;
  descripcion?: string;
  esDestacada?: boolean;
  fechaFinDestacado?: string;

  vendedor: {
    nombre: string;
    avatar: string;
    telefono: string;
  };

  planCredito?: {
    opciones: {
      cuotas: number;
      valorCuota: number;
    }[];
  };

  imagenes: Imagen[];

  mostrarBotonesCompra?: boolean;
}

// src/types/producto.ts

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  ubicacion: string;
  imagen: string;
  imagenes: string[];

  descripcion?: string;

  vendedor: {
    nombre: string;
    avatar: string;
  };

  planCredito?: {
    opciones: {
      cuotas: number;
      valorCuota: number;
    }[];
  };

  mostrarBotonesCompra?: boolean;
}

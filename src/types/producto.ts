// src/types/producto.ts

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  ubicacion: string;
  imagen: string; // imagen principal
  imagenes: string[]; // galería de imágenes

  descripcion?: string;

  vendedor: {
    nombre: string;
    avatar: string;
  };

  planCredito?: {
    cuotas: number;
    valorCuota: number;
    total: number;
  };
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  ubicacion: string;
  imagen: string;
  vendedor: {
    nombre: string;
    avatar: string;
  };
}

// src/api/productosService.ts
import { productosMock } from "../mocks/productos.mock";
import type { Producto } from "../types/producto";

export const obtenerProductos = async (): Promise<Producto[]> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(productosMock), 500)
  );
};

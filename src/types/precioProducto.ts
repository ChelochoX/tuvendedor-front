// src/types/precioProducto.ts

export type PrecioBlock = {
  idListaPrecio?: number;
  idPlan?: number;

  esPromo: boolean;
  estado?: "Activo" | "Inactivo" | "Nuevo";

  precioPublico: string;
  precioDistribuidor: string;
  precioBase: string;

  fechaDesde?: string;
  fechaHasta?: string;

  entregaInicial: string;
  importeCuota: string;
  interes: string;
  codigoPlan: string;

  error?: string;
};

export type PrecioModelo = {
  normal: PrecioBlock;
  promo?: PrecioBlock;
};

export const emptyPrecioBlock = (esPromo: boolean): PrecioBlock => ({
  esPromo,
  estado: "Nuevo",

  precioPublico: "",
  precioDistribuidor: "",
  precioBase: "",

  fechaDesde: "",
  fechaHasta: "",

  entregaInicial: "",
  importeCuota: "",
  interes: "",
  codigoPlan: "",
});

// Lista de precios (vigente o promo)
export interface ListaPrecioProducto {
  id: number;
  idModeloProducto: number;

  precioPublico: number;
  precioBase: number;

  fechaDesde: string;
  fechaHasta?: string;

  estado: "Activo" | "Inactivo";

  // ⭐ opcional (si backend lo soporta)
  observacion?: string;
}

// Plan de financiación
export interface PlanFinanciacionProducto {
  id: number;
  idListaPrecio: number;

  entregaInicial: number;
  cantidadCuotas: number;
  importeCuota: number;

  codigoPlan?: string;
}

export type PrecioBlock = {
  idListaPrecio?: number;
  esPromo: boolean;

  precioPublico: string;
  precioDistribuidor: string;
  precioBase: string;

  fechaDesde: string;
  fechaHasta: string;

  entregaInicial: string;
  importeCuota: string;
  interes: string;
  codigoPlan: string;

  guardando?: boolean;
  mensaje?: string;
  error?: string;
};

export type PrecioModelo = {
  normal: PrecioBlock;
  promo?: PrecioBlock;
};

export const emptyPrecioBlock = (esPromo: boolean): PrecioBlock => ({
  esPromo,
  precioPublico: "",
  precioDistribuidor: "",
  precioBase: "",
  fechaDesde: new Date().toISOString().slice(0, 10),
  fechaHasta: "",
  entregaInicial: "",
  importeCuota: "",
  interes: "",
  codigoPlan: "",
});

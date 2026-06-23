export interface PlanCreditoForm {
  cuotas: string;
  valorCuota: string;
}

export interface CamposInmobiliariosForm {
  tipoOperacion: string;
  tipoPropiedad: string;
  moneda: "PYG" | "USD" | string;
  ciudad: string;
  barrio: string;
  superficieTerreno: string;
  superficieConstruida: string;
  dormitorios: string;
  banos: string;
  cocheras: string;
}

export interface CrearPublicacionForm {
  titulo: string;
  descripcion: string;
  precio: string;
  moneda: "PYG" | "USD" | string;
  categoria: string;
  ubicacion: string;
  mostrarBotonesCompra: boolean;
  permiteDelivery: boolean;
  planCredito: PlanCreditoForm[];
  archivos: File[];
  camposInmuebles: CamposInmobiliariosForm;
}

export interface CategoriaPublicacionOption {
  id?: number;
  nombre: string;
  icono?: string;
}

export interface ImagenExistenteEditable {
  mainUrl: string;
  thumbUrl?: string;
}

export interface PublicacionEditable {
  id: number;
  titulo?: string;
  descripcion?: string;
  precio?: number;
  moneda?: "PYG" | "USD" | string | null;
  categoria?: string;
  ubicacion?: string;
  mostrarBotonesCompra?: boolean;
  permiteDelivery?: boolean;
  planCredito?: Array<{
    cuotas?: number;
    valorCuota?: number;
  }>;
  latitud?: number | null;
  longitud?: number | null;
  googleMapsUrl?: string | null;
  imagenesExistentes?: ImagenExistenteEditable[];
}

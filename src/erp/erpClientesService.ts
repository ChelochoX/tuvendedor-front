import axios from "@api/axiosInstance";

export interface ERPCliente {
  clienteId: number;
  tipoDocumento: string;
  numeroDocumento: string;
  razonSocial: string;
  nombreFantasia?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}

export interface CrearERPClienteRequest {
  tipoDocumento: string;
  numeroDocumento: string;
  razonSocial: string;
  nombreFantasia?: string;
  telefono?: string;
  email?: string;
  crmInteresadoId?: number;
}

export interface DireccionCliente {
  direccionId: number;
  tipoDireccion: string;
  direccion: string;
  ciudad?: string;
  esPrincipal: boolean;
}

export interface AgregarDireccionRequest {
  clienteId: number;
  tipoDireccion: string;
  direccion: string;
  ciudad?: string;
  latitud?: number;
  longitud?: number;
  esPrincipal: boolean;
}

export const erpClientesService = {
  listar: async (): Promise<ERPCliente[]> => {
    const { data } = await axios.get("/erp/clientes/listar");
    return data.data;
  },

  obtenerPorId: async (clienteId: number): Promise<ERPCliente> => {
    const { data } = await axios.get(`/erp/clientes/${clienteId}`);
    return data.data;
  },

  crear: async (request: CrearERPClienteRequest): Promise<number> => {
    const { data } = await axios.post("/erp/clientes/crear", request);
    return data.data.clienteId;
  },

  desactivar: async (clienteId: number) => {
    await axios.delete(`/erp/clientes/desactivar/${clienteId}`);
  },

  obtenerDirecciones: async (
    clienteId: number
  ): Promise<DireccionCliente[]> => {
    const { data } = await axios.get(`/erp/clientes/${clienteId}/direcciones`);
    return data.data;
  },

  agregarDireccion: async (request: AgregarDireccionRequest) => {
    await axios.post("/erp/clientes/agregar-direccion", request);
  },
};

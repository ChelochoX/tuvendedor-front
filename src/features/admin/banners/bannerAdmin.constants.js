export const BANNER_LOCATIONS = Object.freeze([
  {
    value: "HOME_TOP",
    label: "Inicio - banner superior",
    description: "Banner principal ubicado arriba del contenido.",
  },
  {
    value: "HOME_INLINE",
    label: "Inicio - banner intermedio",
    description: "Banner insertado entre los productos o publicaciones.",
  },
]);

export const EMPTY_BANNER_FORM = Object.freeze({
  clienteNombre: "",
  titulo: "",
  descripcion: "",
  ubicacion: "HOME_TOP",
  orden: 1,
  fechaInicio: "",
  fechaFin: "",
  urlDestino: "",
  whatsappUrl: "",
  textoBoton: "Ver más",
  abrirNuevaPestana: true,
  activo: true,
});

export function createEmptyBannerForm() {
  return {
    ...EMPTY_BANNER_FORM,
  };
}
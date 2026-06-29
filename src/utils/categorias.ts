import type { Categoria } from "../types/categoria";
import type { CategoriaPublicacionOption } from "../types/publicacion.types";
import { obtenerIconoCategoria } from "./categoriaIconos";

export const CATEGORIA_TODOS: Categoria = {
  id: 0,
  nombre: "Todos",
  icono: "🌐",
};

export const normalizarCategoria = (valor?: string | null): string => {
  return (valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const compararPorNombre = <T extends { nombre: string }>(a: T, b: T): number => {
  return a.nombre.localeCompare(b.nombre, "es");
};

const nombreCategoriaEsValido = (nombre?: string | null): nombre is string => {
  const limpio = nombre?.trim();

  return Boolean(limpio && normalizarCategoria(limpio) !== "todos");
};

export const prepararCategoriasMarketplace = (
  categorias: Categoria[] = [],
): Categoria[] => {
  const categoriasUnicas = categorias.reduce<Categoria[]>((acc, categoria) => {
    if (!nombreCategoriaEsValido(categoria.nombre)) {
      return acc;
    }

    const nombre = categoria.nombre.trim();
    const clave = normalizarCategoria(nombre);

    const yaExiste = acc.some((item) => {
      return normalizarCategoria(item.nombre) === clave;
    });

    if (!yaExiste) {
      acc.push({
        ...categoria,
        nombre,
        icono: categoria.icono || obtenerIconoCategoria(nombre),
      });
    }

    return acc;
  }, []);

  return [
    CATEGORIA_TODOS,
    ...categoriasUnicas.sort(compararPorNombre),
  ];
};

export const prepararCategoriasPublicacion = (
  categorias: CategoriaPublicacionOption[] = [],
  categoriasFallback: string[] = [],
): CategoriaPublicacionOption[] => {
  const fuente: CategoriaPublicacionOption[] =
    categorias.length > 0
      ? categorias
      : categoriasFallback.map((nombre) => ({
          nombre,
        }));

  const categoriasUnicas = fuente.reduce<CategoriaPublicacionOption[]>(
    (acc, categoria) => {
      if (!nombreCategoriaEsValido(categoria.nombre)) {
        return acc;
      }

      const nombre = categoria.nombre.trim();
      const clave = normalizarCategoria(nombre);

      const yaExiste = acc.some((item) => {
        return normalizarCategoria(item.nombre) === clave;
      });

      if (!yaExiste) {
        acc.push({
          ...categoria,
          nombre,
          icono: categoria.icono || obtenerIconoCategoria(nombre),
        });
      }

      return acc;
    },
    [],
  );

  return categoriasUnicas.sort(compararPorNombre);
};
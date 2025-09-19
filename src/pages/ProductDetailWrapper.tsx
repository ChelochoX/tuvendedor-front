// src/pages/ProductDetailWrapper.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductDetail from "../components/ProductDetail";
import { productosMock } from "../mocks/productos.mock"; // Asegúrate de esta importación
import { Producto } from "../types/producto";

const ProductDetailWrapper = () => {
  const { productos, setProductos } = useProductos();
  const { id } = useParams<{ id: string }>();
  const [producto, setProducto] = useState<Producto | null>(null);

  useEffect(() => {
    if (!id) return;

    // 1) buscar en el contexto
    const encontrado = productos.find((p) => p.id === Number(id));
    if (encontrado) {
      setProducto(encontrado);
    } else {
      // 2) fallback a la API
      obtenerPublicaciones().then((data) => {
        setProductos(data);
        setProducto(data.find((p) => p.id === Number(id)) ?? null);
      });
    }
  }, [id, productos, setProductos]);

  if (!producto) return <p style={{ padding: "2rem" }}>Cargando producto...</p>;

  return (
    <ProductDetail
      producto={producto}
      isFavorite={false}
      onToggleFavorite={() => {}}
    />
  );
};

export default ProductDetailWrapper;

// src/pages/ProductDetailWrapper.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductDetail from "../components/ProductDetail";
import { productosMock } from "../mocks/productos.mock"; // Asegúrate de esta importación
import { Producto } from "../types/producto";

const ProductDetailWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const [producto, setProducto] = useState<Producto | null>(null);

  useEffect(() => {
    if (id) {
      const encontrado = productosMock.find((p) => p.id === parseInt(id));
      setProducto(encontrado ?? null);
    }
  }, [id]);

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

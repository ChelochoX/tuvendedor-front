// src/pages/ProductDetailWrapper.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductDetail from "../components/ProductDetail";
import { obtenerPublicaciones } from "../api/publicacionesService";
import { Producto } from "../types/producto";

const ProductDetailWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);

  const productos: Producto[] = [];
  const setProductos = (data: Producto[]) => {};

  useEffect(() => {
    if (!id) return;

    setCargando(true);

    // 1️⃣ Mostrar rápido lo que ya haya en memoria
    const encontrado = productos.find((p) => p.id === Number(id));
    if (encontrado) {
      setProducto(encontrado);
      setCargando(false);
    }

    // 2️⃣ Refrescar desde la API para asegurarnos
    obtenerPublicaciones()
      .then((data) => {
        setProductos(data); // actualiza global
        const actualizado = data.find((p) => p.id === Number(id));
        if (actualizado) setProducto(actualizado);
      })
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <p style={{ padding: "2rem" }}>Cargando producto...</p>;

  if (!producto)
    return (
      <p style={{ padding: "2rem", color: "red" }}>Producto no encontrado 😥</p>
    );

  return (
    <ProductDetail
      producto={producto}
      isFavorite={false}
      onToggleFavorite={() => {}}
    />
  );
};

export default ProductDetailWrapper;

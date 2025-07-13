// src/router/index.tsx
import { Routes, Route } from "react-router-dom";
import Marketplace from "../pages/Marketplace";
import ProductDetailWrapper from "../pages/ProductDetailWrapper";

const RoutesHandler = () => (
  <Routes>
    <Route path="/" element={<Marketplace />} />
    <Route path="/producto/:id" element={<ProductDetailWrapper />} />
  </Routes>
);

export default RoutesHandler;

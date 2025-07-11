// src/components/ProductDetail.tsx
import React from "react";
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ImageGallery from "./ProductGallery";
import { Producto } from "../types/producto";

interface Props {
  producto: Producto;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ProductDetail: React.FC<Props> = ({
  producto,
  isFavorite,
  onToggleFavorite,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      display="flex"
      flexDirection={isMobile ? "column" : "row"}
      gap={4}
      padding={isMobile ? 2 : 4}
    >
      <Box flex={1}>
        <ImageGallery imagenes={producto.imagenes} />
      </Box>

      <Box flex={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            {producto.nombre}
          </Typography>
          <Button onClick={onToggleFavorite}>
            {isFavorite ? (
              <FavoriteIcon color="error" />
            ) : (
              <FavoriteBorderIcon />
            )}
          </Button>
        </Box>

        <Typography variant="subtitle2" color="text.secondary" mt={1}>
          Ubicación: {producto.ubicacion}
        </Typography>

        <Box mt={3}>
          <Typography variant="h6" color="green">
            Contado: {producto.precio.toLocaleString()} ₲
          </Typography>
        </Box>

        {producto.planCredito && (
          <div className="bg-yellow-50 p-4 rounded-md mb-4">
            <h4 className="font-bold">Plan de Crédito</h4>
            <p className="text-sm">12 cuotas de 750.000 ₲</p>
            <p className="text-sm font-semibold">Total: 9.000.000 ₲</p>
          </div>
        )}

        {producto.descripcion && (
          <Box mt={3}>
            <Typography variant="body1" mb={1} fontWeight="bold">
              Descripción del producto
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {producto.descripcion}
            </Typography>
          </Box>
        )}

        <Box mt={4} display="flex" alignItems="center" gap={2}>
          <img
            src={producto.vendedor.avatar}
            alt={producto.vendedor.nombre}
            className="w-10 h-10 rounded-full object-cover"
          />
          <Typography variant="body2" color="text.secondary">
            Vendedor: <strong>{producto.vendedor.nombre}</strong>
          </Typography>
        </Box>

        <Box mt={4}>
          <Button fullWidth variant="contained" color="primary">
            Contactar vendedor
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductDetail;

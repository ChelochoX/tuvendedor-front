import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? producto.imagenes.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === producto.imagenes.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Box
      display="flex"
      flexDirection={isMobile ? "column" : "row"}
      gap={4}
      padding={isMobile ? 2 : 4}
    >
      {/* Galería de imágenes con fondo difuminado */}
      <Box flex={isMobile ? undefined : 2} position="relative">
        <Box
          position="relative"
          width="100%"
          height={isMobile ? "70vh" : "80vh"}
          borderRadius={2}
          overflow="hidden"
        >
          {/* Fondo desenfocado */}
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundImage: `url(${producto.imagenes[selectedImageIndex]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(20px)",
              transform: "scale(1.1)",
              zIndex: 0,
            }}
          />

          {/* Imagen principal */}
          <Box
            component="img"
            src={producto.imagenes[selectedImageIndex]}
            alt={producto.nombre}
            sx={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />

          {/* Flechas navegación */}
          {producto.imagenes.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 10,
                  transform: "translateY(-50%)",
                  zIndex: 2,
                  backgroundColor: "#000",
                  border: "2px solid #FFD700",
                  color: "#FFD700",
                  width: 48,
                  height: 48,
                  "&:hover": {
                    backgroundColor: "#fff",
                    borderColor: "#000",
                    color: "#000",
                  },
                }}
              >
                <ArrowBackIosNewIcon />
              </IconButton>

              <IconButton
                onClick={handleNextImage}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 10,
                  transform: "translateY(-50%)",
                  zIndex: 2,
                  backgroundColor: "#000",
                  border: "2px solid #FFD700",
                  color: "#FFD700",
                  width: 48,
                  height: 48,
                  "&:hover": {
                    backgroundColor: "#fff",
                    borderColor: "#000",
                    color: "#000",
                  },
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </>
          )}
        </Box>

        {/* Miniaturas */}
        <Box mt={2} display="flex" gap={1} overflow="auto">
          {producto.imagenes.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Miniatura ${i + 1}`}
              onClick={() => setSelectedImageIndex(i)}
              style={{
                width: 60,
                height: 60,
                objectFit: "cover",
                borderRadius: 8,
                border:
                  selectedImageIndex === i
                    ? "2px solid #2196f3"
                    : "1px solid #ccc",
                cursor: "pointer",
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Información del producto */}
      <Box
        flex={1}
        mt={isMobile ? 2 : 0}
        p={isMobile ? 2 : 0}
        bgcolor={isMobile ? "#f9f9f9" : "transparent"}
        borderRadius={2}
      >
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
          <Box mt={2} bgcolor="yellow" p={2} borderRadius={2}>
            <Typography variant="subtitle1" fontWeight="bold">
              Plan de Crédito
            </Typography>
            <Typography variant="body2">
              {producto.planCredito.cuotas} cuotas de{" "}
              {producto.planCredito.valorCuota.toLocaleString()} ₲
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              Total: {producto.planCredito.total.toLocaleString()} ₲
            </Typography>
          </Box>
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

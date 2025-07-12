// ProductDetail ajustado para múltiples cuotas dinámicas
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const cuotas =
    producto.planCredito?.opciones.map(
      (op) => `${op.cuotas} X Gs. ${op.valorCuota.toLocaleString()}`
    ) || [];

  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(cuotas[0] || "");

  const mostrarBotonesCompra = producto.mostrarBotonesCompra === true;

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
      position="relative"
      display="flex"
      flexDirection={isMobile ? "column" : "row"}
      gap={4}
      padding={isMobile ? 2 : 4}
      bgcolor="#111"
      color="#fff"
    >
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: "absolute",
          top: 24,
          left: 24,
          color: "#FFD700",
          zIndex: 10,
          "&:hover": {
            backgroundColor: "transparent",
            transform: "scale(1.1)",
          },
        }}
      >
        <CloseIcon sx={{ fontSize: 32 }} />
      </IconButton>

      <Box flex={isMobile ? undefined : 2} position="relative">
        <Box
          position="relative"
          width="100%"
          height={isMobile ? "70vh" : "80vh"}
          borderRadius={2}
          overflow="hidden"
        >
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
                    ? "2px solid #FFD700"
                    : "1px solid #333",
                cursor: "pointer",
              }}
            />
          ))}
        </Box>
      </Box>

      <Box flex={1} mt={isMobile ? 2 : 0} p={isMobile ? 2 : 0} maxWidth={320}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold" color="#fff">
            {producto.nombre}
          </Typography>
          <Button onClick={onToggleFavorite}>
            {isFavorite ? (
              <FavoriteIcon color="error" />
            ) : (
              <FavoriteBorderIcon sx={{ color: "#FFD700" }} />
            )}
          </Button>
        </Box>

        <Typography variant="subtitle2" sx={{ color: "#ccc" }} mt={1}>
          Ubicación: {producto.ubicacion}
        </Typography>

        <Box mt={3} display="flex" flexDirection="column" gap={2}>
          <Box
            p={2}
            borderRadius={2}
            sx={{ backgroundColor: "#ffd70022", backdropFilter: "blur(5px)" }}
          >
            <Typography variant="subtitle2" fontWeight="bold" color="#FFD700">
              Precio CONTADO
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="#fff">
              Gs. {producto.precio.toLocaleString()}
            </Typography>
            {mostrarBotonesCompra && (
              <Button
                variant="contained"
                fullWidth
                sx={{
                  mt: 1,
                  bgcolor: "#FFD700",
                  color: "#000",
                  fontWeight: "bold",
                }}
              >
                COMPRAR CONTADO
              </Button>
            )}
          </Box>

          {producto.planCredito && cuotas.length > 0 && (
            <Box
              p={2}
              borderRadius={2}
              sx={{ backgroundColor: "#ffd70022", backdropFilter: "blur(5px)" }}
            >
              <Typography variant="subtitle2" fontWeight="bold" color="#FFD700">
                ¿Preferís comprar en CUOTAS?
              </Typography>
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel sx={{ color: "#FFD700" }}>Cuotas</InputLabel>
                <Select
                  value={cuotaSeleccionada}
                  onChange={(e) => setCuotaSeleccionada(e.target.value)}
                  fullWidth
                  sx={{
                    color: "#fff",
                    backgroundColor: "#222",
                    borderRadius: 2,
                    border: "1px solid #2196f3",
                    "& .MuiSelect-icon": { color: "#fff" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "#111",
                        color: "#fff",
                      },
                    },
                  }}
                >
                  {cuotas.map((opcion, index) => (
                    <MenuItem key={index} value={opcion} sx={{ color: "#fff" }}>
                      {opcion}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {mostrarBotonesCompra && (
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 2,
                    bgcolor: "#F28500",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  SOLICITAR CRÉDITO
                </Button>
              )}
            </Box>
          )}
        </Box>

        {producto.descripcion && (
          <Box mt={4}>
            <Typography variant="body1" mb={1} fontWeight="bold" color="#fff">
              Descripción del producto
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#ccc", whiteSpace: "pre-line" }}
            >
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
          <Typography variant="body2" color="#ccc">
            Vendedor: <strong>{producto.vendedor.nombre}</strong>
          </Typography>
        </Box>

        <Box mt={4}>
          <Button
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: "#FFD700",
              color: "#000",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#e6c200",
              },
            }}
          >
            Contactar vendedor
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductDetail;

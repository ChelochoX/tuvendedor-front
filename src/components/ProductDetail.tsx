// ProductDetail con soporte híbrido imágenes + videos, manteniendo diseño original
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
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { Producto } from "../types/producto";
import Swal from "sweetalert2";

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

  const currentUrl = producto.imagenes[selectedImageIndex].mainUrl;
  const isVideo = currentUrl?.toLowerCase().endsWith(".mp4");

  const handleContactarVendedor = () => {
    const numeroCrudo = producto.vendedor.telefono?.trim();

    if (!numeroCrudo) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: "El vendedor no configuró un número de WhatsApp.",
        background: "#1e1e1e",
        color: "#fff",
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    // 🟡 Normalización automática a formato WhatsApp
    // Si empieza con 0 → quitamos el 0 y agregamos +595
    let numero = numeroCrudo;

    if (numero.startsWith("0")) {
      numero = "595" + numero.slice(1);
    }

    // Si ya empieza con 595 → lo usamos directo
    if (!numero.startsWith("595")) {
      numero = "595" + numero;
    }

    const mensaje = `¡Hola! Vi tu publicación *${producto.nombre}* en TuVendedor y quiero más información.`;

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
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
      {/* 🔸 Botón Cerrar */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: "absolute",
          top: 24,
          left: 24,
          color: "#FFD700",
          zIndex: 20,
          "&:hover": {
            backgroundColor: "transparent",
            transform: "scale(1.1)",
          },
        }}
      >
        <CloseIcon sx={{ fontSize: 32 }} />
      </IconButton>

      {/* 🔸 Galería principal */}
      <Box flex={isMobile ? undefined : 2} position="relative">
        <Box
          position="relative"
          width="100%"
          height={isMobile ? "65vh" : "80vh"}
          borderRadius={2}
          overflow="hidden"
        >
          {/* Fondo difuminado solo si es imagen */}
          {!isVideo && (
            <Box
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundImage: `url(${currentUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(20px)",
                transform: "scale(1.1)",
                zIndex: 0,
              }}
            />
          )}

          {/* Contenido dinámico */}
          {isVideo ? (
            <video
              key={currentUrl} // fuerza reinicio si cambiás de video
              src={currentUrl}
              autoPlay
              loop
              playsInline
              controls={false} // lo ocultamos si querés que se vea automático, o ponelo true si preferís visible
              className="relative z-10 w-full h-full object-contain bg-black"
              style={{
                maxHeight: isMobile ? "65vh" : "80vh",
              }}
              onEnded={(e) => {
                const vid = e.currentTarget;
                vid.currentTime = 0;
                vid.play();
              }}
            />
          ) : (
            <Box
              component="img"
              src={currentUrl}
              alt={producto.nombre}
              sx={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          )}

          {/* Flechas de navegación */}
          {producto.imagenes.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 10,
                  transform: "translateY(-50%)",
                  zIndex: 15,
                  backgroundColor: "#000",
                  border: "2px solid #FFD700",
                  color: "#FFD700",
                  width: 42,
                  height: 42,
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
                  zIndex: 15,
                  backgroundColor: "#000",
                  border: "2px solid #FFD700",
                  color: "#FFD700",
                  width: 42,
                  height: 42,
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

        {/* 🔸 Miniaturas (imágenes + videos) */}
        <Box mt={2} display="flex" gap={1} overflow="auto" pb={1}>
          {producto.imagenes.map((img, i) => {
            const isVid = img.mainUrl.toLowerCase().endsWith(".mp4");
            return (
              <Box
                key={i}
                onClick={() => setSelectedImageIndex(i)}
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 1.5,
                  overflow: "hidden",
                  border:
                    selectedImageIndex === i
                      ? "2px solid #FFD700"
                      : "1px solid #333",
                  cursor: "pointer",
                  position: "relative",
                  flexShrink: 0,
                  backgroundColor: "#000",
                }}
              >
                {isVid ? (
                  <video
                    src={img.mainUrl}
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ opacity: 0.85 }}
                  />
                ) : (
                  <img
                    src={img.thumbUrl || img.mainUrl}
                    alt={`Miniatura ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* 🔸 Lado derecho: descripción, precio, cuotas, vendedor */}
      <Box
        flex={1}
        mt={isMobile ? 2 : 0}
        p={isMobile ? 2 : 0}
        maxWidth={isMobile ? "100%" : 320}
      >
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

        {/* 🔸 Precio y cuotas */}
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
              <Box mt={1} display="flex" flexDirection="column" gap={1}>
                {cuotas.map((opcion, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      color: "#fff",
                      backgroundColor: "#222",
                      padding: "6px 12px",
                      borderRadius: 2,
                      border: "1px solid #FFD700",
                    }}
                  >
                    {opcion}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* 🔸 Descripción */}
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

        {/* 🔸 Botón de contacto */}
        <Box
          mt={4}
          mb={isMobile ? 4 : 0} // 🔥 espacio adicional debajo del vendedor
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Button
            variant="contained"
            sx={{
              width: "90%",
              maxWidth: "350px",
              margin: "10px auto 0 auto",
              backgroundColor: "#25D366",
              color: "#fff",
              fontWeight: "600",
              padding: "10px 14px",
              fontSize: "0.9rem",
              borderRadius: "40px",
              display: isMobile ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              "&:hover": { backgroundColor: "#1ebe5d" },
            }}
            onClick={handleContactarVendedor}
          >
            <svg width="18" height="18" viewBox="0 0 32 32" fill="white">
              <path d="M16 3C9.4 3 4 8.4 4 15c0 2.5.8 4.9 2.1 6.9L4 29l7.3-2.1c1.9 1 4.1 1.5 6.7 1.5 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 22.5c-2.2 0-4.2-.6-5.9-1.7l-.4-.2-4.3 1.2 1.2-4.2-.3-.4C5.2 18.5 4.5 16.8 4.5 15c0-6.2 5-11.3 11.5-11.3S27.5 8.8 27.5 15 22.5 25.5 16 25.5zm6-7.8c-.3-.1-1.8-.9-2.1-1s-.5-.1-.7.1-.8 1-.9 1.1-.3.2-.6.1c-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.4.1-.5.1-.1.3-.3.4-.4.1-.1.2-.2.3-.4.1-.2.1-.3.2-.5.1-.2.1-.4 0-.6s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.2c.2.3 2.2 3.4 5.5 4.7.8.3 1.4.5 1.9.6.8.3 1.5.2 2 .1.6-.1 1.8-.8 2-1.6.3-.8.3-1.5.2-1.6-.1-.1-.3-.2-.6-.3z" />
            </svg>
            CONTACTAR POR WHATSAPP
          </Button>
        </Box>
        {isMobile && (
          <Box
            sx={{
              position: "fixed",
              bottom: 40, // 🔥 más arriba todavía
              left: 0,
              right: 0,
              zIndex: 200,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              sx={{
                width: "70%", // 🔥 mucho más corto
                maxWidth: "300px", // 🔥 límite profesional
                backgroundColor: "#25D366",
                color: "#fff",
                fontWeight: "600",
                padding: "10px 14px",
                fontSize: "0.9rem",
                borderRadius: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.25)",
                "&:hover": { backgroundColor: "#1ebe5d" },
              }}
              onClick={handleContactarVendedor}
            >
              <svg width="18" height="18" viewBox="0 0 32 32" fill="white">
                <path d="M16 3C9.4 3 4 8.4 4 15c0 2.5.8 4.9 2.1 6.9L4 29l7.3-2.1c1.9 1 4.1 1.5 6.7 1.5 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 22.5c-2.2 0-4.2-.6-5.9-1.7l-.4-.2-4.3 1.2 1.2-4.2-.3-.4C5.2 18.5 4.5 16.8 4.5 15c0-6.2 5-11.3 11.5-11.3S27.5 8.8 27.5 15 22.5 25.5 16 25.5zm6-7.8c-.3-.1-1.8-.9-2.1-1s-.5-.1-.7.1-.8 1-.9 1.1-.3.2-.6.1c-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.4.1-.5.1-.1.3-.3.4-.4.1-.1.2-.2.3-.4.1-.2.1-.3.2-.5.1-.2.1-.4 0-.6s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.2c.2.3 2.2 3.4 5.5 4.7.8.3 1.4.5 1.9.6.8.3 1.5.2 2 .1.6-.1 1.8-.8 2-1.6.3-.8.3-1.5.2-1.6-.1-.1-.3-.2-.6-.3z" />
              </svg>
              CONTACTAR POR WHATSAPP
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProductDetail;

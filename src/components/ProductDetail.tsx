import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
  Chip,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { Producto } from "../types/producto";
import { obtenerPublicaciones } from "../api/publicacionesService";
import {
  registrarClickWhatsapp,
  registrarVistaPublicacion,
} from "../api/publicacionInteraccionesService";
import {
  registrarMetaMarketplaceContactoWhatsapp,
  registrarMetaMarketplaceViewContent,
} from "../utils/metaPixel";
import { buildProductoShareUrl } from "../config/appConfig";
import { generarMensajeConsultaWhatsapp } from "../utils/whatsappConsulta";

interface Props {
  producto: Producto;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const formatearPrecio = (
  precio?: number | null,
  moneda?: string | null,
): string => {
  if (!precio || precio <= 0) return "Consultar precio";

  const monedaNormalizada = moneda?.trim().toUpperCase() || "PYG";

  if (monedaNormalizada === "USD") {
    return `USD ${Number(precio).toLocaleString("es-PY", {
      maximumFractionDigits: 0,
    })}`;
  }

  return `Gs. ${Number(precio).toLocaleString("es-PY", {
    maximumFractionDigits: 0,
  })}`;
};

const obtenerUrlMedia = (media: any): string => {
  if (!media) return "";
  if (typeof media === "string") return media;
  return media.mainUrl || media.url || media.thumbUrl || "";
};

const obtenerThumbMedia = (media: any): string => {
  if (!media) return "";
  if (typeof media === "string") return media;
  return media.thumbUrl || media.mainUrl || media.url || "";
};

const esVideoUrl = (url?: string): boolean => {
  if (!url) return false;

  const limpia = url.split("?")[0].toLowerCase();

  return (
    limpia.includes("/video/upload/") ||
    /\.(mp4|mov|webm|avi|mkv)$/i.test(limpia)
  );
};

const obtenerPosterVideo = (media: any): string => {
  const url = obtenerUrlMedia(media);
  const thumb = obtenerThumbMedia(media);

  if (thumb && !esVideoUrl(thumb)) {
    return thumb;
  }

  if (!url || !esVideoUrl(url)) {
    return "";
  }

  const urlSinQuery = url.split("?")[0];

  /*
    Si es Cloudinary, generamos una imagen JPG del primer frame del video.
    Esto evita que la miniatura salga rota.
  */
  if (urlSinQuery.includes("/video/upload/")) {
    return urlSinQuery
      .replace(
        "/video/upload/",
        "/video/upload/so_0,w_300,h_220,c_fill,q_auto,f_jpg/",
      )
      .replace(/\.(mp4|mov|webm|avi|mkv)$/i, ".jpg");
  }

  return "";
};

const MiniaturaMedia: React.FC<{
  media: any;
  alt: string;
}> = ({ media, alt }) => {
  const url = obtenerUrlMedia(media);
  const thumb = obtenerThumbMedia(media);
  const esVideo = esVideoUrl(url) || esVideoUrl(thumb);
  const poster = obtenerPosterVideo(media);

  if (esVideo) {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          bgcolor: "#020617",
        }}
      >
        <Box
          component="video"
          src={url}
          poster={poster || undefined}
          muted
          playsInline
          preload="metadata"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            bgcolor: "#020617",
          }}
          onLoadedMetadata={(event) => {
            try {
              event.currentTarget.currentTime = 0.15;
            } catch {
              // Algunos navegadores no permiten mover el frame antes de cargar.
            }
          }}
        />

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.25))",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "999px",
              bgcolor: "rgba(0,0,0,0.68)",
              border: "1px solid rgba(250,204,21,0.75)",
              color: "#facc15",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.72rem",
              fontWeight: 950,
              boxShadow: "0 8px 18px rgba(0,0,0,0.35)",
            }}
          >
            ▶
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={thumb || url}
      alt={alt}
      sx={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        bgcolor: "#111827",
      }}
    />
  );
};

const obtenerIniciales = (nombre?: string | null): string => {
  const limpio = nombre?.trim() || "TV";
  const partes = limpio.split(/\s+/).filter(Boolean);

  return partes
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
};

const limpiarTituloParaVista = (titulo: string): string => {
  return titulo
    .replace(/^\s*promo\s*/i, "")
    .replace(/^\s*publicaci[oó]n\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
};

const obtenerSlugVendedor = (producto: Producto): string => {
  const origen: any = producto as any;
  const vendedor: any = producto.vendedor || {};

  const slug =
    vendedor.slug ||
    vendedor.Slug ||
    vendedor.slugVendedor ||
    vendedor.SlugVendedor ||
    origen.slugVendedor ||
    origen.SlugVendedor ||
    origen.vendedorSlug ||
    origen.VendedorSlug ||
    origen.perfilVendedorSlug ||
    origen.PerfilVendedorSlug ||
    origen.perfilVendedor?.slug ||
    origen.PerfilVendedor?.Slug ||
    origen.vendedor?.slug ||
    origen.Vendedor?.Slug ||
    "";

  return String(slug || "").trim();
};

const obtenerRubroVendedor = (producto: Producto): string => {
  const origen: any = producto as any;
  const vendedor: any = producto.vendedor || {};

  return (
    vendedor.rubro ||
    vendedor.Rubro ||
    origen.rubroVendedor ||
    origen.RubroVendedor ||
    origen.perfilVendedor?.rubro ||
    origen.PerfilVendedor?.Rubro ||
    origen.Vendedor?.rubro ||
    origen.Vendedor?.Rubro ||
    producto.categoria ||
    "Marketplace"
  );
};

const obtenerCiudadVendedor = (producto: Producto): string => {
  const origen: any = producto as any;
  const vendedor: any = producto.vendedor || {};

  return (
    vendedor.ciudadVisible ||
    vendedor.CiudadVisible ||
    vendedor.ciudad ||
    vendedor.Ciudad ||
    origen.ciudadVisibleVendedor ||
    origen.CiudadVisibleVendedor ||
    origen.perfilVendedor?.ciudadVisible ||
    origen.PerfilVendedor?.CiudadVisible ||
    origen.Vendedor?.ciudadVisible ||
    origen.Vendedor?.CiudadVisible ||
    producto.ubicacion ||
    "Ubicación no especificada"
  );
};

const obtenerCantidadPublicacionesVendedor = (producto: Producto): number => {
  const origen: any = producto as any;
  const vendedor: any = producto.vendedor || {};

  return Number(
    vendedor.cantidadPublicaciones ??
      vendedor.CantidadPublicaciones ??
      origen.cantidadPublicacionesVendedor ??
      origen.CantidadPublicacionesVendedor ??
      origen.perfilVendedor?.cantidadPublicaciones ??
      origen.PerfilVendedor?.CantidadPublicaciones ??
      origen.Vendedor?.cantidadPublicaciones ??
      origen.Vendedor?.CantidadPublicaciones ??
      0,
  );
};

const obtenerDestacadosRapidos = (producto: Producto): string[] => {
  const textoOriginal = `${producto.nombre || ""} ${producto.descripcion || ""} ${
    producto.categoria || ""
  } ${producto.ubicacion || ""}`;

  const texto = textoOriginal
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const destacados: string[] = [];

  const agregar = (valor: string) => {
    const limpio = valor.trim();

    if (!limpio) return;

    const yaExiste = destacados.some(
      (item) => item.toLowerCase() === limpio.toLowerCase(),
    );

    if (!yaExiste && destacados.length < 5) {
      destacados.push(limpio);
    }
  };

  const esInmobiliario =
    texto.includes("inmueble") ||
    texto.includes("casa") ||
    texto.includes("departamento") ||
    texto.includes("duplex") ||
    texto.includes("terreno") ||
    texto.includes("lote") ||
    texto.includes("quinta") ||
    texto.includes("oficina") ||
    texto.includes("salon") ||
    texto.includes("local") ||
    texto.includes("alquiler") ||
    texto.includes("venta sobre");

  const esVehiculo =
    texto.includes("moto") ||
    texto.includes("vehiculo") ||
    texto.includes("auto") ||
    texto.includes("camioneta") ||
    texto.includes("kenton") ||
    texto.includes("yamaha") ||
    texto.includes("honda") ||
    texto.includes("cc");

  if (esInmobiliario) {
    if (texto.includes("duplex")) agregar("Dúplex");
    else if (texto.includes("casa")) agregar("Casa");
    else if (texto.includes("departamento")) agregar("Departamento");
    else if (texto.includes("terreno") || texto.includes("lote")) {
      agregar("Terreno / Lote");
    } else {
      agregar(producto.categoria || "Inmueble");
    }

    const matchM2 = textoOriginal.match(/(\d+(?:[.,]\d+)?)\s*m[²2]/i);
    if (matchM2?.[1]) {
      agregar(`${matchM2[1]} m²`);
    }

    const matchDormitorios = texto.match(
      /(\d+)\s*(dormitorio|habitacion|habitaciones)/i,
    );
    if (matchDormitorios?.[1]) {
      agregar(`${matchDormitorios[1]} dormitorios`);
    }

    const matchBanos = texto.match(/(\d+)\s*(bano|banos|baño|baños)/i);
    if (matchBanos?.[1]) {
      agregar(`${matchBanos[1]} baños`);
    }

    if (
      texto.includes("cochera") ||
      texto.includes("garage") ||
      texto.includes("garaje")
    ) {
      agregar("Con cochera");
    }

    if (producto.ubicacion) {
      agregar("Buena ubicación");
    }

    return destacados;
  }

  if (esVehiculo) {
    const matchCc = texto.match(/(\d{2,4})\s*cc/);
    if (matchCc?.[1]) agregar(`${matchCc[1]} cc`);

    if (texto.includes("freno") && texto.includes("disco")) {
      agregar("Freno a disco");
    }

    const matchTanque = texto.match(/tanque\D{0,12}(\d{1,2})\s*l/);
    if (matchTanque?.[1]) agregar(`Tanque ${matchTanque[1]} L`);

    if (texto.includes("doble proposito")) {
      agregar("Doble propósito");
    }

    if (texto.includes("ciudad") || texto.includes("ruta")) {
      agregar("Ciudad y ruta");
    }

    if (producto.categoria) agregar(producto.categoria);

    return destacados;
  }

  if (producto.categoria) agregar(producto.categoria);
  if (producto.ubicacion) agregar("Ubicación visible");
  if (producto.precio && producto.precio > 0) agregar("Precio publicado");
  if (producto.vendedor?.telefono) agregar("WhatsApp disponible");

  return destacados;
};

const esPublicacionInmobiliaria = (producto: Producto): boolean => {
  const texto = `${producto.nombre || ""} ${producto.categoria || ""} ${
    producto.descripcion || ""
  }`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return (
    texto.includes("inmueble") ||
    texto.includes("casa") ||
    texto.includes("departamento") ||
    texto.includes("duplex") ||
    texto.includes("terreno") ||
    texto.includes("lote") ||
    texto.includes("quinta") ||
    texto.includes("oficina") ||
    texto.includes("salon") ||
    texto.includes("local") ||
    texto.includes("alquiler") ||
    texto.includes("venta sobre")
  );
};

const obtenerEtiquetaPrecioPrincipal = (producto: Producto): string => {
  if (producto.mostrarBotonesCompra) {
    return "Precio contado";
  }

  if (esPublicacionInmobiliaria(producto)) {
    return "Precio de venta";
  }

  return "Precio publicado";
};

const ProductDetail: React.FC<Props> = ({
  producto,
  isFavorite,
  onToggleFavorite,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const usarLayoutCompacto = useMediaQuery("(max-width:1180px)");

  const anchoMaximoCompacto = isMobile ? 420 : 760;

  const navigate = useNavigate();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [relacionadas, setRelacionadas] = useState<Producto[]>([]);

  const imagenes = Array.isArray(producto.imagenes) ? producto.imagenes : [];
  const totalMedia = imagenes.length;
  const mediaActual = imagenes[selectedImageIndex];
  const currentUrl = obtenerUrlMedia(mediaActual);
  const currentThumb = obtenerThumbMedia(mediaActual);
  const isVideo = esVideoUrl(currentUrl);

  const tituloOriginal =
    producto.nombre?.trim() ||
    (producto as any).titulo?.trim() ||
    "Publicación disponible";

  const tituloProducto =
    limpiarTituloParaVista(tituloOriginal) || tituloOriginal;

  const esPromo =
    /^\s*promo/i.test(tituloOriginal) ||
    Boolean(producto.esDestacada) ||
    Boolean(producto.esTemporada);

  const vendedorNombre = producto.vendedor?.nombre || "Tu Vendedor";
  const vendedorAvatar = producto.vendedor?.avatar || "";
  const vendedorTelefono = producto.vendedor?.telefono || "";
  const rubroVendedor = obtenerRubroVendedor(producto);
  const ciudadVendedor = obtenerCiudadVendedor(producto);
  const slugVendedor = obtenerSlugVendedor(producto);
  const cantidadPublicaciones = obtenerCantidadPublicacionesVendedor(producto);
  const destacados = obtenerDestacadosRapidos(producto);

  const precioTexto = formatearPrecio(producto.precio, producto.moneda);
  const urlVitrina = slugVendedor ? `/vendedor/${slugVendedor}` : "";
  const etiquetaPrecioPrincipal = obtenerEtiquetaPrecioPrincipal(producto);

  const cuotas = useMemo(() => {
    return (
      producto.planCredito?.opciones?.map(
        (opcion) =>
          `${opcion.cuotas} cuotas de ${formatearPrecio(
            opcion.valorCuota,
            producto.moneda,
          )}`,
      ) || []
    );
  }, [producto.planCredito, producto.moneda]);

  useEffect(() => {
    if (!producto?.id) return;

    registrarVistaPublicacion(producto.id).catch((error) => {
      console.error("No se pudo registrar la vista de la publicación", error);
    });

    registrarMetaMarketplaceViewContent(producto);
  }, [producto?.id]);

  useEffect(() => {
    let cancelado = false;

    const cargarRelacionadas = async () => {
      try {
        const data = await obtenerPublicaciones();

        if (cancelado) return;

        const vendedorActual = producto.vendedor?.nombre?.trim().toLowerCase();
        const categoriaActual = producto.categoria?.trim().toLowerCase();

        const filtradas = data
          .filter((item) => item.id !== producto.id)
          .filter((item) => {
            const mismoVendedor =
              vendedorActual &&
              item.vendedor?.nombre?.trim().toLowerCase() === vendedorActual;

            const mismaCategoria =
              categoriaActual &&
              item.categoria?.trim().toLowerCase() === categoriaActual;

            return mismoVendedor || mismaCategoria;
          })
          .slice(0, 4);

        setRelacionadas(filtradas);
      } catch (error) {
        console.error(
          "No se pudieron cargar publicaciones relacionadas",
          error,
        );
        setRelacionadas([]);
      }
    };

    void cargarRelacionadas();

    return () => {
      cancelado = true;
    };
  }, [producto.id, producto.categoria, producto.vendedor?.nombre]);

  const handlePrevImage = () => {
    if (totalMedia === 0) return;

    setSelectedImageIndex((actual) =>
      actual === 0 ? totalMedia - 1 : actual - 1,
    );
  };

  const handleNextImage = () => {
    if (totalMedia === 0) return;

    setSelectedImageIndex((actual) =>
      actual === totalMedia - 1 ? 0 : actual + 1,
    );
  };

  const handleContactarVendedor = () => {
    const numeroCrudo = vendedorTelefono.trim();

    if (!numeroCrudo) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: "El vendedor no configuró un número de WhatsApp.",
        background: "#111827",
        color: "#fff",
        showConfirmButton: false,
        timer: 2500,
      });

      return;
    }

    let numero = numeroCrudo.replace(/\D/g, "");

    if (numero.startsWith("0")) {
      numero = `595${numero.slice(1)}`;
    }

    if (!numero.startsWith("595")) {
      numero = `595${numero}`;
    }

    const mensaje = generarMensajeConsultaWhatsapp(
      {
        id: producto.id,
        titulo: tituloProducto,
        precioTexto: precioTexto,
      },
      slugVendedor,
    );

    registrarClickWhatsapp(producto.id).catch((error) => {
      console.error("No se pudo registrar el click de WhatsApp", error);
    });

    registrarMetaMarketplaceContactoWhatsapp(producto);

    window.open(
      `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleCompartir = async () => {
    const url = buildProductoShareUrl(producto.id, slugVendedor);

    try {
      if (navigator.share) {
        await navigator.share({
          title: tituloProducto,
          text: `Mirá esta publicación en Tu Vendedor: ${tituloProducto}`,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Link copiado",
        background: "#111827",
        color: "#fff",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: "No se pudo compartir la publicación.",
        background: "#111827",
        color: "#fff",
        showConfirmButton: false,
        timer: 1800,
      });
    }
  };

  const irAVitrina = () => {
    if (!urlVitrina) return;
    navigate(urlVitrina);
  };

  if (totalMedia === 0 || !currentUrl) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#07090c",
          color: "#fff",
          p: 4,
        }}
      >
        <Button
          onClick={() => navigate("/")}
          sx={{
            color: "#facc15",
            textTransform: "none",
            fontWeight: 800,
            mb: 2,
          }}
        >
          🏠 Ver todos los productos
        </Button>

        <Typography>
          No hay imágenes o videos disponibles para este producto.
        </Typography>
      </Box>
    );
  }

  const cardSx = {
    border: "1px solid rgba(250, 204, 21, 0.14)",
    background:
      "linear-gradient(145deg, rgba(8,15,32,0.95), rgba(3,7,18,0.98))",
    boxShadow: "0 18px 48px rgba(0,0,0,0.28)",
  };

  const botonWhatsapp = (
    <Button
      fullWidth
      onClick={handleContactarVendedor}
      sx={{
        minHeight: isMobile ? 42 : 46,
        borderRadius: "999px",
        bgcolor: "#22c55e",
        color: "#fff",
        fontWeight: 950,
        textTransform: "none",
        fontSize: isMobile ? "0.82rem" : "0.88rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.8,
        boxShadow: "0 12px 26px rgba(34,197,94,0.25)",
        "&:hover": {
          bgcolor: "#16a34a",
        },
      }}
    >
      <WhatsAppIcon sx={{ fontSize: 18 }} />
      Consultar por WhatsApp
    </Button>
  );

  const precioPrincipalCard = (
    <Box
      sx={{
        borderRadius: 2,
        p: isMobile ? 1.15 : 1.4,
        bgcolor: "rgba(250,204,21,0.10)",
        border: "1px solid rgba(250,204,21,0.18)",
      }}
    >
      <Typography
        sx={{
          color: "#facc15",
          fontWeight: 950,
          fontSize: isMobile ? "0.68rem" : "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {etiquetaPrecioPrincipal}
      </Typography>

      <Typography
        sx={{
          mt: 0.35,
          color: "#fff",
          fontWeight: 950,
          fontSize: isMobile ? "0.95rem" : "1.08rem",
          letterSpacing: "-0.02em",
        }}
      >
        {precioTexto}
      </Typography>
    </Box>
  );

  const cuotasCard =
    producto.mostrarBotonesCompra && cuotas.length > 0 ? (
      <Box
        sx={{
          borderRadius: 2,
          p: isMobile ? 1.15 : 1.4,
          bgcolor: "rgba(250,204,21,0.055)",
          border: "1px solid rgba(250,204,21,0.22)",
        }}
      >
        <Typography
          sx={{
            color: "#facc15",
            fontWeight: 950,
            fontSize: isMobile ? "0.68rem" : "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            mb: 0.75,
          }}
        >
          ¿Preferís comprar en cuotas?
        </Typography>

        <Box display="grid" gap={0.7}>
          {cuotas.map((cuota) => (
            <Box
              key={cuota}
              sx={{
                borderRadius: 1.5,
                border: "1px solid rgba(250,204,21,0.85)",
                px: isMobile ? 1 : 1.2,
                py: isMobile ? 0.75 : 0.8,
                color: "#fff",
                fontSize: isMobile ? "0.72rem" : "0.78rem",
                fontWeight: 850,
                lineHeight: 1.25,
              }}
            >
              {cuota}
            </Box>
          ))}
        </Box>
      </Box>
    ) : null;

  const VendedorAvatar = vendedorAvatar ? (
    <Box
      component="img"
      src={vendedorAvatar}
      alt={vendedorNombre}
      sx={{
        width: isMobile ? 46 : 56,
        height: isMobile ? 46 : 56,
        borderRadius: "50%",
        objectFit: "cover",
        border: "2px solid rgba(250,204,21,0.85)",
      }}
    />
  ) : (
    <Box
      sx={{
        width: isMobile ? 46 : 56,
        height: isMobile ? 46 : 56,
        borderRadius: "50%",
        border: "2px solid rgba(250,204,21,0.85)",
        background:
          "radial-gradient(circle at top, rgba(250,204,21,0.25), rgba(0,0,0,0.94))",
        color: "#facc15",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 950,
        fontSize: "0.84rem",
      }}
    >
      {obtenerIniciales(vendedorNombre)}
    </Box>
  );

  const destacadosCard =
    destacados.length > 0 ? (
      <Box
        sx={{
          ...cardSx,
          borderRadius: 3,
          p: isMobile ? 1.25 : 1.7,
        }}
      >
        <Typography
          sx={{
            mb: 1,
            color: "rgba(255,255,255,0.7)",
            fontSize: isMobile ? "0.72rem" : "0.78rem",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Resumen rápido
        </Typography>

        <Box
          display="grid"
          gridTemplateColumns="repeat(2, minmax(0,1fr))"
          gap={0.85}
        >
          {destacados.map((item, index) => (
            <Box
              key={`${item}-${index}`}
              sx={{
                minHeight: isMobile ? 30 : 34,
                borderRadius: 2,
                px: isMobile ? 0.9 : 1.05,
                py: isMobile ? 0.7 : 0.85,
                display: "flex",
                alignItems: "center",
                gap: 0.7,
                bgcolor: "rgba(255,255,255,0.045)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: "#facc15",
                  boxShadow: "0 0 10px rgba(250,204,21,0.45)",
                  flexShrink: 0,
                }}
              />

              <Typography
                sx={{
                  color: "#fff",
                  fontSize: isMobile ? "0.68rem" : "0.72rem",
                  fontWeight: 800,
                  lineHeight: 1.15,
                }}
              >
                {item}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    ) : null;

  const vendedorCard = (
    <Box
      sx={{
        ...cardSx,
        borderRadius: 3,
        p: isMobile ? 1.5 : 2,
      }}
    >
      <Box display="flex" alignItems="center" gap={1.2}>
        {VendedorAvatar}

        <Box flex={1} minWidth={0}>
          <Box display="flex" alignItems="center" gap={0.6}>
            <Typography
              noWrap
              sx={{
                color: "#fff",
                fontWeight: 950,
                fontSize: isMobile ? "0.88rem" : "1rem",
                lineHeight: 1.1,
              }}
            >
              {vendedorNombre}
            </Typography>

            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                bgcolor: "#2563eb",
                color: "#fff",
                fontSize: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ✓
            </Box>
          </Box>

          <Typography
            noWrap
            sx={{
              mt: 0.25,
              color: "rgba(255,255,255,0.72)",
              fontSize: "0.74rem",
            }}
          >
            {rubroVendedor}
          </Typography>

          <Box mt={0.2} display="flex" alignItems="center" gap={0.45}>
            <LocationOnRoundedIcon sx={{ color: "#facc15", fontSize: 14 }} />
            <Typography
              noWrap
              sx={{
                color: "rgba(255,255,255,0.62)",
                fontSize: "0.72rem",
              }}
            >
              {ciudadVendedor}
            </Typography>
          </Box>
        </Box>

        {urlVitrina && (
          <Button
            onClick={irAVitrina}
            sx={{
              flexShrink: 0,
              borderRadius: "999px",
              border: "1px solid rgba(250,204,21,0.75)",
              color: "#facc15",
              px: isMobile ? 1.2 : 1.8,
              py: 0.7,
              fontSize: isMobile ? "0.68rem" : "0.76rem",
              fontWeight: 900,
              textTransform: "none",
              minWidth: isMobile ? 86 : 120,
              "&:hover": {
                bgcolor: "rgba(250,204,21,0.12)",
              },
            }}
          >
            Ver vitrina
          </Button>
        )}
      </Box>

      <Box
        mt={1.3}
        display="grid"
        gridTemplateColumns="repeat(2, minmax(0, 1fr))"
        gap={1}
      >
        <Box
          sx={{
            borderRadius: 2,
            px: 1.1,
            py: 0.85,
            bgcolor: "rgba(250,204,21,0.08)",
            border: "1px solid rgba(250,204,21,0.13)",
          }}
        >
          <Box display="flex" alignItems="center" gap={0.55}>
            <ShieldRoundedIcon sx={{ color: "#facc15", fontSize: 14 }} />
            <Typography
              sx={{
                color: "#fff",
                fontSize: "0.69rem",
                fontWeight: 850,
              }}
            >
              Contacto directo
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            borderRadius: 2,
            px: 1.1,
            py: 0.85,
            bgcolor: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Box display="flex" alignItems="center" gap={0.55}>
            <Inventory2RoundedIcon sx={{ color: "#facc15", fontSize: 14 }} />
            <Typography
              sx={{
                color: "#fff",
                fontSize: "0.69rem",
                fontWeight: 850,
              }}
            >
              {cantidadPublicaciones > 0
                ? `${cantidadPublicaciones} publicaciones`
                : "Más publicaciones"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const descripcionCard = producto.descripcion ? (
    <Box
      sx={{
        ...cardSx,
        borderRadius: 3,
        p: isMobile ? 1.4 : 2,
        width: "100%",
        height: "auto",
        minHeight: 0,
        maxHeight: "none",
        overflow: "visible",
      }}
    >
      <Typography
        sx={{
          color: "#fff",
          fontSize: "0.9rem",
          fontWeight: 950,
        }}
      >
        Descripción
      </Typography>

      <Typography
        component="div"
        sx={{
          mt: 0.9,
          width: "100%",
          height: "auto",
          minHeight: 0,
          maxHeight: "none",
          overflow: "visible",
          display: "block",
          color: "rgba(255,255,255,0.82)",
          fontSize: isMobile ? "0.76rem" : "0.84rem",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
          WebkitLineClamp: "unset",
          WebkitBoxOrient: "unset",
        }}
      >
        {producto.descripcion}
      </Typography>
    </Box>
  ) : null;

  const relacionadasSection =
    relacionadas.length > 0 ? (
      <Box
        sx={{
          ...cardSx,
          borderRadius: 3,
          p: isMobile ? 1.4 : 2,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1.2}
        >
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 950,
              fontSize: isMobile ? "0.92rem" : "1.05rem",
            }}
          >
            {isMobile ? "Más del vendedor" : "Más publicaciones del vendedor"}
          </Typography>

          {urlVitrina && (
            <Button
              onClick={irAVitrina}
              sx={{
                color: "#facc15",
                fontSize: "0.75rem",
                fontWeight: 900,
                textTransform: "none",
                p: 0,
              }}
            >
              Ver todas
            </Button>
          )}
        </Box>

        <Box
          display="flex"
          gap={1.1}
          sx={{
            overflowX: "auto",
            pb: 0.5,
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(250,204,21,.75) transparent",
          }}
        >
          {relacionadas.map((item) => {
            const img = item.imagenes?.[0];

            return (
              <Box
                key={item.id}
                onClick={() => navigate(`/producto/${item.id}`)}
                sx={{
                  minWidth: isMobile ? 136 : 240,
                  cursor: "pointer",
                  borderRadius: 2.2,
                  overflow: "hidden",
                  bgcolor: "rgba(255,255,255,0.045)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "transform .16s ease, border-color .16s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    borderColor: "rgba(250,204,21,0.45)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: isMobile ? 86 : 108,
                    overflow: "hidden",
                    bgcolor: "#111827",
                  }}
                >
                  <MiniaturaMedia media={img} alt={item.nombre} />
                </Box>

                <Box p={1}>
                  <Typography
                    sx={{
                      color: "#fff",
                      fontSize: isMobile ? "0.72rem" : "0.8rem",
                      fontWeight: 850,
                      lineHeight: 1.15,
                      minHeight: isMobile ? 32 : 38,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.nombre}
                  </Typography>

                  <Typography
                    noWrap
                    sx={{
                      mt: 0.55,
                      color: "#facc15",
                      fontSize: "0.73rem",
                      fontWeight: 950,
                    }}
                  >
                    {formatearPrecio(item.precio, item.moneda)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    ) : null;

  const mainMedia = isVideo ? (
    <Box
      component="video"
      src={currentUrl}
      poster={currentThumb}
      controls
      autoPlay
      muted
      loop
      playsInline
      sx={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        bgcolor: "#000",
      }}
    />
  ) : (
    <Box
      component="img"
      src={currentUrl}
      alt={tituloProducto}
      sx={{
        width: "100%",
        height: "100%",
        display: "block",
        objectFit: isMobile ? "cover" : "cover",
        bgcolor: "#111827",
      }}
    />
  );

  if (usarLayoutCompacto) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#121212",
          background:
            "linear-gradient(180deg, #161616 0%, #0b0f17 20%, #07090c 100%)",
          pb: "calc(88px + env(safe-area-inset-bottom))",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: anchoMaximoCompacto,
            mx: "auto",
            px: 1.4,
            py: 2,
          }}
        >
          <Box
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid rgba(250,204,21,0.12)",
              background:
                "linear-gradient(180deg, rgba(5,10,20,0.98) 0%, rgba(2,7,17,0.98) 100%)",
              boxShadow: "0 18px 48px rgba(0,0,0,0.34)",
            }}
          >
            {/* Header mobile */}
            <Box
              sx={{
                px: 1.5,
                pt: 1.4,
                pb: 1.2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Button
                onClick={() => navigate("/")}
                sx={{
                  color: "#facc15",
                  bgcolor: "rgba(255,255,255,0.08)",
                  borderRadius: 1.8,
                  px: 1.4,
                  py: 0.8,
                  minWidth: 0,
                  fontWeight: 900,
                  fontSize: "0.8rem",
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "rgba(250,204,21,0.14)",
                  },
                }}
              >
                🏠 Ver todos
              </Button>

              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  bgcolor: "rgba(255,255,255,0.10)",
                  color: "#facc15",
                  width: 40,
                  height: 40,
                  "&:hover": {
                    bgcolor: "rgba(250,204,21,0.14)",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Imagen principal mobile */}
            <Box sx={{ px: 1.2 }}>
              <Box
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 2.2,
                  bgcolor: "#111827",
                  border: "1px solid rgba(255,255,255,0.08)",
                  width: "100%",
                  aspectRatio: "1 / 0.95",
                }}
              >
                {esPromo && (
                  <Chip
                    icon={
                      <CampaignRoundedIcon
                        sx={{ color: "#111827 !important" }}
                      />
                    }
                    label="Publicación"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      zIndex: 3,
                      bgcolor: "#facc15",
                      color: "#111827",
                      fontWeight: 950,
                      fontSize: "0.68rem",
                      boxShadow: "0 8px 22px rgba(0,0,0,0.22)",
                    }}
                  />
                )}

                {mainMedia}

                {totalMedia > 1 && (
                  <>
                    <IconButton
                      onClick={handlePrevImage}
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: 10,
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(5,10,20,0.92)",
                        color: "#facc15",
                        border: "2px solid #facc15",
                        width: 42,
                        height: 42,
                        zIndex: 3,
                        "&:hover": {
                          bgcolor: "#1f2937",
                        },
                      }}
                    >
                      <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      onClick={handleNextImage}
                      sx={{
                        position: "absolute",
                        top: "50%",
                        right: 10,
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(5,10,20,0.92)",
                        color: "#facc15",
                        border: "2px solid #facc15",
                        width: 42,
                        height: 42,
                        zIndex: 3,
                        "&:hover": {
                          bgcolor: "#1f2937",
                        },
                      }}
                    >
                      <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>

                    <Box
                      sx={{
                        position: "absolute",
                        right: 10,
                        bottom: 10,
                        px: 1.15,
                        py: 0.5,
                        borderRadius: "999px",
                        bgcolor: "rgba(0,0,0,0.62)",
                        color: "#fff",
                        fontSize: "0.72rem",
                        fontWeight: 900,
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {selectedImageIndex + 1} / {totalMedia}
                    </Box>
                  </>
                )}
              </Box>
            </Box>

            {/* Miniaturas mobile */}
            {totalMedia > 1 && (
              <Box
                sx={{
                  px: 1.2,
                  pt: 1.2,
                  pb: 1.1,
                  display: "flex",
                  gap: 0.9,
                  overflowX: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(250,204,21,.75) transparent",
                }}
              >
                {imagenes.map((media, index) => {
                  const url =
                    obtenerThumbMedia(media) || obtenerUrlMedia(media);
                  const activa = index === selectedImageIndex;

                  return (
                    <Box
                      key={`${url}-${index}`}
                      onClick={() => setSelectedImageIndex(index)}
                      sx={{
                        width: 62,
                        minWidth: 62,
                        maxWidth: 62,
                        height: 56,
                        flexShrink: 0,
                        borderRadius: 1.5,
                        overflow: "hidden",
                        cursor: "pointer",
                        border: activa
                          ? "3px solid #facc15"
                          : "1px solid rgba(255,255,255,0.16)",
                        opacity: activa ? 1 : 0.84,
                        bgcolor: "#111827",
                        transition: "all .16s ease",
                      }}
                    >
                      <MiniaturaMedia
                        media={media}
                        alt={`Miniatura ${index + 1}`}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Bloque principal info mobile */}
            <Box sx={{ px: 1.2, pb: 1.4 }}>
              <Box
                sx={{
                  ...cardSx,
                  borderRadius: 3,
                  p: 1.45,
                }}
              >
                <Box display="flex" alignItems="flex-start" gap={1}>
                  <Box flex={1} minWidth={0}>
                    <Chip
                      label="Publicación"
                      size="small"
                      sx={{
                        bgcolor: "rgba(250,204,21,0.10)",
                        color: "#facc15",
                        border: "1px solid rgba(250,204,21,0.28)",
                        fontWeight: 950,
                        fontSize: "0.64rem",
                        height: 24,
                        mb: 1,
                      }}
                    />

                    <Typography
                      component="h2"
                      sx={{
                        color: "#fff",
                        fontWeight: 950,
                        lineHeight: 1.16,
                        letterSpacing: "-0.025em",
                        fontSize: "0.92rem",
                        display: "block",
                        width: "100%",
                        whiteSpace: "normal",
                        overflow: "visible",
                        textOverflow: "clip",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                        WebkitLineClamp: "unset",
                        WebkitBoxOrient: "unset",
                      }}
                    >
                      {tituloProducto}
                    </Typography>
                  </Box>

                  <IconButton
                    onClick={onToggleFavorite}
                    sx={{
                      mt: -0.25,
                      mr: -0.4,
                      color: isFavorite ? "#facc15" : "rgba(255,255,255,0.92)",
                      flexShrink: 0,
                    }}
                  >
                    {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Box>

                <Box mt={0.9} display="flex" alignItems="center" gap={0.55}>
                  <LocationOnRoundedIcon
                    sx={{
                      color: "#facc15",
                      fontSize: 17,
                    }}
                  />
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "0.76rem",
                      fontWeight: 650,
                      lineHeight: 1.2,
                    }}
                  >
                    {producto.ubicacion || "Ubicación no especificada"}
                  </Typography>
                </Box>

                <Box mt={1.15} display="grid" gap={0.9}>
                  {precioPrincipalCard}
                  {cuotasCard}
                </Box>
              </Box>
            </Box>

            {/* Destacados */}
            {destacadosCard && (
              <Box sx={{ px: 1.2, pb: 1.2 }}>{destacadosCard}</Box>
            )}

            {/* Vendedor */}
            <Box sx={{ px: 1.2, pb: 1.2 }}>{vendedorCard}</Box>

            {/* Descripcion */}
            {descripcionCard && (
              <Box sx={{ px: 1.2, pb: 1.2 }}>{descripcionCard}</Box>
            )}

            {/* Relacionadas */}
            {relacionadasSection && (
              <Box sx={{ px: 1.2, pb: 1.6 }}>{relacionadasSection}</Box>
            )}
          </Box>
        </Box>

        {/* Barra fija abajo mobile */}
        <Box
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 80,
            px: 1.2,
            pt: 1,
            pb: "calc(0.85rem + env(safe-area-inset-bottom))",
            bgcolor: "rgba(5, 8, 13, 0.88)",
            borderTop: "1px solid rgba(250,204,21,0.16)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 -18px 45px rgba(0,0,0,0.42)",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: anchoMaximoCompacto,
              mx: "auto",
              borderRadius: "22px",
              border: "1px solid rgba(250,204,21,0.18)",
              background:
                "linear-gradient(135deg, rgba(9,14,25,0.96) 0%, rgba(5,10,18,0.98) 100%)",
              boxShadow:
                "0 12px 34px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.04)",
              p: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0, pl: 0.5 }}>
              <Typography
                noWrap
                sx={{
                  color: "rgba(255,255,255,0.62)",
                  fontSize: "0.67rem",
                  fontWeight: 800,
                  lineHeight: 1.1,
                }}
              >
                Consultá directo con el vendedor
              </Typography>

              <Typography
                noWrap
                sx={{
                  mt: 0.25,
                  color: "#fff",
                  fontSize: "0.88rem",
                  fontWeight: 950,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                {precioTexto}
              </Typography>
            </Box>

            <Button
              onClick={handleContactarVendedor}
              sx={{
                minWidth: urlVitrina ? 118 : 146,
                height: 44,
                borderRadius: "999px",
                bgcolor: "#22c55e",
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                color: "#fff",
                fontWeight: 950,
                textTransform: "none",
                fontSize: "0.82rem",
                display: "flex",
                alignItems: "center",
                gap: 0.65,
                boxShadow:
                  "0 10px 22px rgba(34,197,94,0.25), inset 0 1px 0 rgba(255,255,255,0.18)",
                "&:hover": {
                  bgcolor: "#16a34a",
                  background:
                    "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                },
              }}
            >
              <WhatsAppIcon sx={{ fontSize: 18 }} />
              WhatsApp
            </Button>

            {urlVitrina && (
              <Button
                onClick={irAVitrina}
                sx={{
                  minWidth: 84,
                  height: 44,
                  borderRadius: "999px",
                  border: "1px solid rgba(250,204,21,0.75)",
                  color: "#facc15",
                  fontWeight: 950,
                  textTransform: "none",
                  fontSize: "0.78rem",
                  "&:hover": {
                    bgcolor: "rgba(250,204,21,0.1)",
                  },
                }}
              >
                Vitrina
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  // DESKTOP
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#07090c",
        color: "#fff",
        pb: 3,
        background:
          "radial-gradient(circle at top left, rgba(250,204,21,0.045), transparent 28%), linear-gradient(180deg, #07090c 0%, #0b111c 100%)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1480,
          mx: "auto",
          px: 3,
          py: 3,
        }}
      >
        <Box
          mb={2}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          <Button
            onClick={() => navigate("/")}
            sx={{
              color: "#facc15",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 2,
              px: 1.6,
              py: 0.9,
              fontWeight: 900,
              fontSize: "0.8rem",
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(250,204,21,0.14)",
              },
            }}
          >
            🏠 Ver todos los productos
          </Button>

          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              color: "#facc15",
              bgcolor: "rgba(255,255,255,0.08)",
              "&:hover": {
                bgcolor: "rgba(250,204,21,0.14)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          display="grid"
          gridTemplateColumns="minmax(0, 1.9fr) 420px"
          gap={3}
          alignItems="start"
        >
          <Box minWidth={0}>
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 3,
                bgcolor: "#111827",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 22px 70px rgba(0,0,0,0.35)",
                aspectRatio: "16 / 10.2",
              }}
            >
              {esPromo && (
                <Chip
                  icon={
                    <CampaignRoundedIcon sx={{ color: "#111827 !important" }} />
                  }
                  label={
                    producto.esDestacada
                      ? "Publicación destacada"
                      : "Publicación"
                  }
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    zIndex: 3,
                    bgcolor: "#facc15",
                    color: "#111827",
                    fontWeight: 950,
                    fontSize: "0.68rem",
                    boxShadow: "0 8px 22px rgba(0,0,0,0.24)",
                  }}
                />
              )}

              {mainMedia}

              {totalMedia > 1 && (
                <>
                  <IconButton
                    onClick={handlePrevImage}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: 16,
                      transform: "translateY(-50%)",
                      bgcolor: "#111827",
                      color: "#facc15",
                      border: "2px solid #facc15",
                      width: 46,
                      height: 46,
                      zIndex: 3,
                      "&:hover": {
                        bgcolor: "#1f2937",
                      },
                    }}
                  >
                    <ArrowBackIosNewIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    onClick={handleNextImage}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      right: 16,
                      transform: "translateY(-50%)",
                      bgcolor: "#111827",
                      color: "#facc15",
                      border: "2px solid #facc15",
                      width: 46,
                      height: 46,
                      zIndex: 3,
                      "&:hover": {
                        bgcolor: "#1f2937",
                      },
                    }}
                  >
                    <ArrowForwardIosIcon fontSize="small" />
                  </IconButton>

                  <Box
                    sx={{
                      position: "absolute",
                      right: 14,
                      bottom: 14,
                      px: 1.3,
                      py: 0.6,
                      borderRadius: "999px",
                      bgcolor: "rgba(0,0,0,0.58)",
                      color: "#fff",
                      fontSize: "0.75rem",
                      fontWeight: 850,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {selectedImageIndex + 1} / {totalMedia}
                  </Box>
                </>
              )}
            </Box>

            {totalMedia > 1 && (
              <Box
                mt={1.4}
                display="flex"
                gap={1}
                sx={{
                  overflowX: "auto",
                  pb: 0.5,
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(250,204,21,.7) transparent",
                }}
              >
                {imagenes.map((media, index) => {
                  const url =
                    obtenerThumbMedia(media) || obtenerUrlMedia(media);
                  const activo = index === selectedImageIndex;

                  return (
                    <Box
                      key={`${url}-${index}`}
                      onClick={() => setSelectedImageIndex(index)}
                      sx={{
                        width: 76,
                        height: 72,
                        flexShrink: 0,
                        borderRadius: 1.5,
                        overflow: "hidden",
                        cursor: "pointer",
                        border: activo
                          ? "3px solid #facc15"
                          : "1px solid rgba(255,255,255,0.16)",
                        opacity: activo ? 1 : 0.74,
                        bgcolor: "#111827",
                        transition: "all .16s ease",
                      }}
                    >
                      <MiniaturaMedia
                        media={media}
                        alt={`Miniatura ${index + 1}`}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}

            <Box mt={2} display="flex" flexDirection="column" gap={2}>
              {descripcionCard}
              {relacionadasSection}

              <Box
                sx={{
                  ...cardSx,
                  borderRadius: 3,
                  p: 1.35,
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(230px, 280px)",
                  alignItems: "center",
                  gap: 1.2,
                  "@media (max-width: 1100px)": {
                    gridTemplateColumns: "1fr",
                  },
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{
                    minWidth: 0,
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    onClick={handleCompartir}
                    startIcon={<ShareRoundedIcon />}
                    sx={{
                      minHeight: 42,
                      borderRadius: "999px",
                      px: 1.4,
                      color: "rgba(255,255,255,0.78)",
                      bgcolor: "rgba(255,255,255,0.045)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      fontWeight: 850,
                      fontSize: "0.78rem",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.08)",
                        color: "#fff",
                      },
                    }}
                  >
                    Compartir
                  </Button>

                  <Button
                    onClick={onToggleFavorite}
                    startIcon={
                      isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />
                    }
                    sx={{
                      minHeight: 42,
                      borderRadius: "999px",
                      px: 1.4,
                      color: isFavorite ? "#facc15" : "rgba(255,255,255,0.78)",
                      bgcolor: isFavorite
                        ? "rgba(250,204,21,0.10)"
                        : "rgba(255,255,255,0.045)",
                      border: isFavorite
                        ? "1px solid rgba(250,204,21,0.26)"
                        : "1px solid rgba(255,255,255,0.08)",
                      fontWeight: 850,
                      fontSize: "0.78rem",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: isFavorite
                          ? "rgba(250,204,21,0.16)"
                          : "rgba(255,255,255,0.08)",
                      },
                    }}
                  >
                    Guardar
                  </Button>
                </Box>

                <Button
                  fullWidth
                  onClick={handleContactarVendedor}
                  sx={{
                    minHeight: 46,
                    borderRadius: "999px",
                    bgcolor: "#22c55e",
                    background:
                      "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    color: "#fff",
                    fontWeight: 950,
                    textTransform: "none",
                    fontSize: "0.84rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.75,
                    whiteSpace: "nowrap",
                    boxShadow:
                      "0 12px 26px rgba(34,197,94,0.22), inset 0 1px 0 rgba(255,255,255,0.16)",
                    "&:hover": {
                      bgcolor: "#16a34a",
                      background:
                        "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    },
                  }}
                >
                  <WhatsAppIcon sx={{ fontSize: 18 }} />
                  Consultar por WhatsApp
                </Button>
              </Box>
            </Box>
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            gap={1.6}
            sx={{
              position: "sticky",
              top: 20,
            }}
          >
            <Box
              sx={{
                ...cardSx,
                borderRadius: 3,
                p: 2.3,
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Chip
                  label={
                    producto.esDestacada
                      ? "Publicación destacada"
                      : "Publicación"
                  }
                  size="small"
                  sx={{
                    bgcolor: "rgba(250,204,21,0.12)",
                    color: "#facc15",
                    border: "1px solid rgba(250,204,21,0.3)",
                    fontWeight: 950,
                    fontSize: "0.66rem",
                    height: 24,
                    textTransform: "uppercase",
                  }}
                />

                <Box flex={1} />

                <IconButton
                  onClick={onToggleFavorite}
                  sx={{
                    color: isFavorite ? "#facc15" : "rgba(255,255,255,0.86)",
                  }}
                >
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Box>

              <Typography
                component="h2"
                sx={{
                  color: "#fff",
                  fontWeight: 950,
                  lineHeight: 1.08,
                  letterSpacing: "-0.035em",
                  fontSize: "clamp(1.18rem, 1.45vw, 1.55rem)",
                  display: "block",
                  width: "100%",
                  whiteSpace: "normal",
                  overflow: "visible",
                  textOverflow: "clip",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                  WebkitLineClamp: "unset",
                  WebkitBoxOrient: "unset",
                }}
              >
                {tituloProducto}
              </Typography>

              <Box mt={1.1} display="flex" alignItems="center" gap={0.7}>
                <LocationOnRoundedIcon
                  sx={{
                    color: "#facc15",
                    fontSize: 18,
                  }}
                />

                <Typography
                  noWrap
                  sx={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: "0.82rem",
                    fontWeight: 650,
                  }}
                >
                  {producto.ubicacion || "Ubicación no especificada"}
                </Typography>
              </Box>

              <Box mt={1.4}>{botonWhatsapp}</Box>

              <Box mt={1.4} display="grid" gap={1}>
                {precioPrincipalCard}
                {cuotasCard}
              </Box>
            </Box>

            {destacadosCard}
            {vendedorCard}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductDetail;

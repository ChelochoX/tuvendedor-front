import { useEffect, useMemo, useState } from "react";
import { registrarEventoBanner } from "../../api/bannersPublicitariosService";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useRegistrarImpresionBanner } from "../../hooks/useRegistrarImpresionBanner";
import {
  BANNER_EVENTOS,
  BANNER_UBICACIONES,
  type BannerEventoTipo,
  type BannerPublicitario,
  type BannerUbicacion,
} from "../../types/bannerPublicitario";
import "../../styles/banners-publicitarios.css";

interface BannerPublicidadCarouselProps {
  banners: BannerPublicitario[];
  ubicacion: BannerUbicacion;
  intervaloMs?: number;
  className?: string;
}

function obtenerUrlSegura(valor?: string | null): string | null {
  if (!valor) {
    return null;
  }

  const url = valor.trim();

  if (url.length === 0) {
    return null;
  }

  if (
    url.startsWith("https://") ||
    url.startsWith("http://") ||
    url.startsWith("/")
  ) {
    return url;
  }

  return `https://${url}`;
}

function obtenerWhatsappUrl(valor?: string | null): string | null {
  if (!valor) {
    return null;
  }

  const texto = valor.trim();

  if (texto.length === 0) {
    return null;
  }

  if (
    texto.startsWith("https://") ||
    texto.startsWith("http://")
  ) {
    return texto;
  }

  const numero = texto.replace(/\D/g, "");

  if (numero.length === 0) {
    return null;
  }

  return `https://wa.me/${numero}`;
}

export function BannerPublicidadCarousel({
  banners,
  ubicacion,
  intervaloMs = 7000,
  className = "",
}: BannerPublicidadCarouselProps) {
  const [indiceActivo, setIndiceActivo] = useState(0);
  const [pausado, setPausado] = useState(false);

  const esMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    setIndiceActivo(0);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1 || pausado) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setIndiceActivo((indiceActual) => {
        return (indiceActual + 1) % banners.length;
      });
    }, intervaloMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [banners.length, intervaloMs, pausado]);

  const bannerActivo = banners[indiceActivo];

  const referenciaImpresion = useRegistrarImpresionBanner({
    bannerPublicitarioId: bannerActivo?.id,
    ubicacion,
  });

  const urlDestino = useMemo(() => {
    return obtenerUrlSegura(bannerActivo?.urlDestino);
  }, [bannerActivo?.urlDestino]);

  const whatsappUrl = useMemo(() => {
    return obtenerWhatsappUrl(bannerActivo?.whatsappUrl);
  }, [bannerActivo?.whatsappUrl]);

  if (!bannerActivo) {
    return null;
  }

  const imagenActual =
    esMobile && bannerActivo.imagenMobileUrl
      ? bannerActivo.imagenMobileUrl
      : bannerActivo.imagenDesktopUrl;

  const imagenTieneAccion = Boolean(urlDestino || whatsappUrl);

  const registrarYAbrirDestino = (
    destino: string,
    tipoEvento: BannerEventoTipo
  ) => {
    void registrarEventoBanner({
      bannerPublicitarioId: bannerActivo.id,
      tipoEvento,
    });

    if (bannerActivo.abrirNuevaPestana) {
      window.open(destino, "_blank", "noopener,noreferrer");
      return;
    }

    window.location.assign(destino);
  };

  const manejarClickImagen = () => {
    if (urlDestino) {
      registrarYAbrirDestino(urlDestino, BANNER_EVENTOS.CLICK);
      return;
    }

    if (whatsappUrl) {
      registrarYAbrirDestino(whatsappUrl, BANNER_EVENTOS.WHATSAPP);
    }
  };

  const irAnterior = () => {
    setIndiceActivo((indiceActual) => {
      return indiceActual === 0 ? banners.length - 1 : indiceActual - 1;
    });
  };

  const irSiguiente = () => {
    setIndiceActivo((indiceActual) => {
      return (indiceActual + 1) % banners.length;
    });
  };

  const esHomeTop = ubicacion === BANNER_UBICACIONES.HOME_TOP;

  return (
    <section
      ref={referenciaImpresion}
      className={[
        "banner-publicidad",
        esHomeTop
          ? "banner-publicidad--home-top"
          : "banner-publicidad--home-inline",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Publicidad"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <div className="banner-publicidad__contenedor">
        <span className="banner-publicidad__etiqueta">Publicidad</span>

        <button
          type="button"
          className={[
            "banner-publicidad__imagen-boton",
            imagenTieneAccion
              ? "banner-publicidad__imagen-boton--clickeable"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={manejarClickImagen}
          disabled={!imagenTieneAccion}
          aria-label={
            bannerActivo.titulo
              ? `Abrir publicidad: ${bannerActivo.titulo}`
              : "Abrir publicidad"
          }
        >
          <img
            src={imagenActual}
            alt={bannerActivo.titulo ?? "Banner publicitario"}
            className="banner-publicidad__imagen"
            loading={esHomeTop ? "eager" : "lazy"}
            onError={(event) => {
              const imagen = event.currentTarget;

              if (
                bannerActivo.imagenDesktopUrl &&
                imagen.src !== bannerActivo.imagenDesktopUrl
              ) {
                imagen.onerror = null;
                imagen.src = bannerActivo.imagenDesktopUrl;
              }
            }}
          />
        </button>

        {banners.length > 1 && (
          <>
            <button
              type="button"
              className="banner-publicidad__flecha banner-publicidad__flecha--izquierda"
              aria-label="Ver banner anterior"
              onClick={irAnterior}
            >
              ‹
            </button>

            <button
              type="button"
              className="banner-publicidad__flecha banner-publicidad__flecha--derecha"
              aria-label="Ver banner siguiente"
              onClick={irSiguiente}
            >
              ›
            </button>

            <div
              className="banner-publicidad__indicadores"
              aria-label="Seleccionar publicidad"
            >
              {banners.map((banner, indice) => (
                <button
                  key={String(banner.id)}
                  type="button"
                  aria-label={`Ver publicidad ${indice + 1}`}
                  className={[
                    "banner-publicidad__indicador",
                    indice === indiceActivo
                      ? "banner-publicidad__indicador--activo"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setIndiceActivo(indice)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {(urlDestino || whatsappUrl) && (
        <div className="banner-publicidad__acciones">
          <div className="banner-publicidad__informacion">
            {bannerActivo.titulo && (
              <strong className="banner-publicidad__titulo">
                {bannerActivo.titulo}
              </strong>
            )}

            {bannerActivo.descripcion && (
              <span className="banner-publicidad__descripcion">
                {bannerActivo.descripcion}
              </span>
            )}
          </div>

          <div className="banner-publicidad__botones">
            {urlDestino && (
              <button
                type="button"
                className="banner-publicidad__boton banner-publicidad__boton--principal"
                onClick={() =>
                  registrarYAbrirDestino(urlDestino, BANNER_EVENTOS.CLICK)
                }
              >
                {bannerActivo.textoBoton || "Conocer más"}
              </button>
            )}

            {whatsappUrl && (
              <button
                type="button"
                className="banner-publicidad__boton banner-publicidad__boton--whatsapp"
                onClick={() =>
                  registrarYAbrirDestino(
                    whatsappUrl,
                    BANNER_EVENTOS.WHATSAPP
                  )
                }
              >
                Escribir por WhatsApp
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
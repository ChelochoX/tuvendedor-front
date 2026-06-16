import { useEffect, useMemo, useState } from "react";

import { registrarEventoBanner } from "../../api/bannersPublicitariosService";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useRegistrarImpresionBanner } from "../../hooks/useRegistrarImpresionBanner";

import {
  BANNER_EVENTOS,
  BANNER_TIPOS_DESTINO,
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
  if (!valor?.trim()) {
    return null;
  }

  const url = valor.trim();

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
  if (!valor?.trim()) {
    return null;
  }

  const texto = valor.trim();

  if (texto.startsWith("https://") || texto.startsWith("http://")) {
    return texto;
  }

  const numero = texto.replace(/\D/g, "");

  return numero ? `https://wa.me/${numero}` : null;
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
      setIndiceActivo((indiceActual) => (indiceActual + 1) % banners.length);
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

  const urlDestino = useMemo(
    () => obtenerUrlSegura(bannerActivo?.urlDestino),
    [bannerActivo?.urlDestino],
  );

  const whatsappUrl = useMemo(
    () => obtenerWhatsappUrl(bannerActivo?.whatsappUrl),
    [bannerActivo?.whatsappUrl],
  );

  if (!bannerActivo) {
    return null;
  }

  const tipoDestino =
    bannerActivo.tipoDestino ??
    (urlDestino ? BANNER_TIPOS_DESTINO.URL : BANNER_TIPOS_DESTINO.WHATSAPP);

  const destinoPrincipal =
    tipoDestino === BANNER_TIPOS_DESTINO.WHATSAPP ? whatsappUrl : urlDestino;

  const eventoPrincipal: BannerEventoTipo =
    tipoDestino === BANNER_TIPOS_DESTINO.WHATSAPP
      ? BANNER_EVENTOS.WHATSAPP
      : BANNER_EVENTOS.CLICK;

  const mostrarWhatsappSecundario =
    Boolean(whatsappUrl) &&
    tipoDestino !== BANNER_TIPOS_DESTINO.WHATSAPP &&
    bannerActivo.mostrarBotonWhatsapp;

  const imagenActual =
    esMobile && bannerActivo.imagenMobileUrl
      ? bannerActivo.imagenMobileUrl
      : bannerActivo.imagenDesktopUrl;

  const imagenTieneAccion = Boolean(destinoPrincipal || whatsappUrl);

  const registrarYAbrirDestino = (
    destino: string,
    tipoEvento: BannerEventoTipo,
  ) => {
    void registrarEventoBanner({
      bannerPublicitarioId: bannerActivo.id,
      tipoEvento,
      ubicacion,
    });

    if (bannerActivo.abrirNuevaPestana) {
      window.open(destino, "_blank", "noopener,noreferrer");

      return;
    }

    window.location.assign(destino);
  };

  const manejarClickImagen = () => {
    if (destinoPrincipal) {
      registrarYAbrirDestino(destinoPrincipal, eventoPrincipal);

      return;
    }

    if (whatsappUrl) {
      registrarYAbrirDestino(whatsappUrl, BANNER_EVENTOS.WHATSAPP);
    }
  };

  const irAnterior = () => {
    setIndiceActivo((indiceActual) =>
      indiceActual === 0 ? banners.length - 1 : indiceActual - 1,
    );
  };

  const irSiguiente = () => {
    setIndiceActivo((indiceActual) => (indiceActual + 1) % banners.length);
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
        <span className="banner-publicidad__etiqueta">
          {bannerActivo.etiqueta || "Publicidad"}
        </span>

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
              <svg
                className="banner-publicidad__flecha-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M15 18 9 12l6-6" />
              </svg>
            </button>

            <button
              type="button"
              className="banner-publicidad__flecha banner-publicidad__flecha--derecha"
              aria-label="Ver banner siguiente"
              onClick={irSiguiente}
            >
              <svg
                className="banner-publicidad__flecha-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
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

      {(bannerActivo.titulo ||
        bannerActivo.subtitulo ||
        bannerActivo.descripcion ||
        destinoPrincipal ||
        mostrarWhatsappSecundario) && (
        <div className="banner-publicidad__acciones">
          <div className="banner-publicidad__informacion">
            {bannerActivo.titulo && (
              <strong className="banner-publicidad__titulo">
                {bannerActivo.titulo}
              </strong>
            )}

            {(bannerActivo.subtitulo || bannerActivo.descripcion) && (
              <span className="banner-publicidad__descripcion">
                {bannerActivo.subtitulo || bannerActivo.descripcion}
              </span>
            )}
          </div>

          <div className="banner-publicidad__botones">
            {destinoPrincipal && (
              <button
                type="button"
                className="banner-publicidad__boton banner-publicidad__boton--principal"
                onClick={() =>
                  registrarYAbrirDestino(destinoPrincipal, eventoPrincipal)
                }
              >
                {bannerActivo.textoBoton ||
                  (tipoDestino === BANNER_TIPOS_DESTINO.WHATSAPP
                    ? "Escribir por WhatsApp"
                    : "Conocer más")}
              </button>
            )}

            {mostrarWhatsappSecundario && whatsappUrl && (
              <button
                type="button"
                className="banner-publicidad__boton banner-publicidad__boton--whatsapp"
                onClick={() =>
                  registrarYAbrirDestino(whatsappUrl, BANNER_EVENTOS.WHATSAPP)
                }
              >
                {bannerActivo.textoBotonWhatsapp || "Escribir por WhatsApp"}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

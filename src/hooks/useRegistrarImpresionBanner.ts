import { useEffect, useRef } from "react";
import { registrarEventoBanner } from "../api/bannersPublicitariosService";
import {
  BANNER_EVENTOS,
  type BannerPublicitarioId,
  type BannerUbicacion,
} from "../types/bannerPublicitario";

interface UseRegistrarImpresionBannerParams {
  bannerPublicitarioId?: BannerPublicitarioId | null;
  ubicacion: BannerUbicacion;
}

function construirClave(
  bannerPublicitarioId: BannerPublicitarioId,
  ubicacion: BannerUbicacion
): string {
  return `tuvendedor:banner:impresion:${ubicacion}:${bannerPublicitarioId}`;
}

function impresionYaRegistrada(clave: string): boolean {
  try {
    return sessionStorage.getItem(clave) === "1";
  } catch {
    return false;
  }
}

function marcarImpresionComoRegistrada(clave: string): void {
  try {
    sessionStorage.setItem(clave, "1");
  } catch {
    // El navegador puede bloquear sessionStorage.
    // Esto no debe impedir que el banner funcione.
  }
}

export function useRegistrarImpresionBanner({
  bannerPublicitarioId,
  ubicacion,
}: UseRegistrarImpresionBannerParams) {
  const referencia = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const elemento = referencia.current;

    if (!elemento || !bannerPublicitarioId) {
      return;
    }

    const clave = construirClave(bannerPublicitarioId, ubicacion);

    if (impresionYaRegistrada(clave)) {
      return;
    }

    let registrado = false;

    const registrar = () => {
      if (registrado || impresionYaRegistrada(clave)) {
        return;
      }

      registrado = true;
      marcarImpresionComoRegistrada(clave);

      void registrarEventoBanner({
        bannerPublicitarioId,
        tipoEvento: BANNER_EVENTOS.IMPRESION,
      });
    };

    if (!("IntersectionObserver" in window)) {
      registrar();
      return;
    }

    const observer = new IntersectionObserver(
      (entradas) => {
        const bannerVisible = entradas.some(
          (entrada) =>
            entrada.isIntersecting && entrada.intersectionRatio >= 0.45
        );

        if (!bannerVisible) {
          return;
        }

        registrar();
        observer.disconnect();
      },
      {
        threshold: [0.45],
      }
    );

    observer.observe(elemento);

    return () => {
      observer.disconnect();
    };
  }, [bannerPublicitarioId, ubicacion]);

  return referencia;
}
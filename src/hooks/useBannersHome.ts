import { useCallback, useEffect, useState } from "react";
import { obtenerBannersHome } from "../api/bannersPublicitariosService";
import type { BannerPublicitario } from "../types/bannerPublicitario";

interface UseBannersHomeResult {
  homeTop: BannerPublicitario[];
  homeInline: BannerPublicitario[];
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

export function useBannersHome(): UseBannersHomeResult {
  const [homeTop, setHomeTop] = useState<BannerPublicitario[]>([]);
  const [homeInline, setHomeInline] = useState<BannerPublicitario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarBanners = useCallback(async (signal?: AbortSignal) => {
    try {
      setCargando(true);
      setError(null);

      const respuesta = await obtenerBannersHome(signal);

      setHomeTop(respuesta.homeTop);
      setHomeInline(respuesta.homeInline);
    } catch (errorDesconocido) {
      if (
        errorDesconocido instanceof DOMException &&
        errorDesconocido.name === "AbortError"
      ) {
        return;
      }

      console.error("No se pudieron cargar los banners.", errorDesconocido);

      setHomeTop([]);
      setHomeInline([]);
      setError("No se pudieron cargar los banners.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void cargarBanners(controller.signal);

    return () => {
      controller.abort();
    };
  }, [cargarBanners]);

  const recargar = useCallback(async () => {
    await cargarBanners();
  }, [cargarBanners]);

  return {
    homeTop,
    homeInline,
    cargando,
    error,
    recargar,
  };
}
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [coincide, setCoincide] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const actualizarValor = () => {
      setCoincide(mediaQuery.matches);
    };

    actualizarValor();

    mediaQuery.addEventListener("change", actualizarValor);

    return () => {
      mediaQuery.removeEventListener("change", actualizarValor);
    };
  }, [query]);

  return coincide;
}
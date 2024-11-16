import { useState, useEffect } from "react";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value); // Actualizar el valor después del retraso
    }, delay);

    return () => {
      clearTimeout(handler); // Limpiar el timeout si el valor cambia antes de que termine el delay
    };
  }, [value, delay]);

  return debouncedValue; // Retorna el valor retrasado
}

export default useDebounce;

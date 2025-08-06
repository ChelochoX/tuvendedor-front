// src/context/UsuarioContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Usuario {
  nombreUsuario: string;
  fotoUrl?: string;
}

interface UsuarioContextType {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;
  cerrarSesion: () => void;
}

const UsuarioContext = createContext<UsuarioContextType | undefined>(undefined);

export const UsuarioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const nombreUsuario = localStorage.getItem("usuario");
    const fotoUrl = localStorage.getItem("fotoUrl");

    if (nombreUsuario) {
      setUsuario({ nombreUsuario, fotoUrl: fotoUrl || undefined });
    }
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("fotoUrl");
    setUsuario(null);
  };

  return (
    <UsuarioContext.Provider value={{ usuario, setUsuario, cerrarSesion }}>
      {children}
    </UsuarioContext.Provider>
  );
};

export const useUsuario = (): UsuarioContextType => {
  const context = useContext(UsuarioContext);
  if (!context) {
    throw new Error("useUsuario debe usarse dentro de UsuarioProvider");
  }
  return context;
};

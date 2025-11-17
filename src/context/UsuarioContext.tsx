// src/context/UsuarioContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Usuario {
  nombreUsuario: string;
  fotoUrl?: string;
  roles?: string[];
}

interface UsuarioContextType {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;
  cerrarSesion: () => void;
  esVisitante: boolean;
  esVendedor: boolean;
  esAdmin: boolean;
  puedePublicar: boolean;
  puedeVerClientes: boolean;
}

const UsuarioContext = createContext<UsuarioContextType | undefined>(undefined);

export const UsuarioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // 🟡 AL MONTAR — FORZAR LOGOUT (no importa lo que haya en localStorage)
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("fotoUrl");
    localStorage.removeItem("roles");

    setUsuario(null);
  }, []);

  // 🔄 Recibir login desde LoginModal
  useEffect(() => {
    const actualizar = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUsuario(null);
        return;
      }

      const nombreUsuario = localStorage.getItem("usuario") || "";
      const fotoUrl = localStorage.getItem("fotoUrl") || "";
      const roles = JSON.parse(localStorage.getItem("roles") || "[]");

      setUsuario({
        nombreUsuario,
        fotoUrl,
        roles,
      });
    };

    window.addEventListener("usuario-actualizado", actualizar);
    return () => window.removeEventListener("usuario-actualizado", actualizar);
  }, []);

  // 🔴 Logout global
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("fotoUrl");
    localStorage.removeItem("roles");
    setUsuario(null);
  };

  const roles = usuario?.roles || [];
  const esVisitante = !usuario;
  const esVendedor = roles.includes("Vendedor");
  const esAdmin = roles.includes("Administrador");
  const puedePublicar = esVendedor || esAdmin;
  const puedeVerClientes = esAdmin;

  return (
    <UsuarioContext.Provider
      value={{
        usuario,
        setUsuario,
        cerrarSesion,
        esVisitante,
        esVendedor,
        esAdmin,
        puedePublicar,
        puedeVerClientes,
      }}
    >
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

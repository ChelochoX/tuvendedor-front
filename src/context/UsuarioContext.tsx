// src/context/UsuarioContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Usuario {
  nombreUsuario: string;
  fotoUrl?: string;
  roles?: string[];
  permisos?: string[];
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

  // ==============================================================
  // 🟡 DETECCIÓN FIABLE:
  // Si sessionStorage está vacío → la pestaña anterior se cerró.
  // ==============================================================

  useEffect(() => {
    const flag = sessionStorage.getItem("ventana-activa");

    if (!flag) {
      // ❌ La pestaña anterior se cerró → BORRAR SESIÓN
      console.log("🚪 Se cerró la pestaña anterior → limpiando sesión");
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      localStorage.removeItem("fotoUrl");
      localStorage.removeItem("roles");
    }

    // 🟢 Registrar esta pestaña como activa
    sessionStorage.setItem("ventana-activa", "1");

    // Cuando la pestaña se cierra, sessionStorage se borra automáticamente
  }, []);

  // ==============================================================
  // 🟢 1) Restaurar usuario desde localStorage al montar (F5 OK)
  // ==============================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUsuario(null);
      return;
    }

    const nombreUsuario = localStorage.getItem("usuario") || "";
    const fotoUrl = localStorage.getItem("fotoUrl") || "";
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");
    const permisos = JSON.parse(localStorage.getItem("permisos") || "[]");

    setUsuario({ nombreUsuario, fotoUrl, roles, permisos });
  }, []);

  // ==============================================================
  // 🔄 2) Escuchar login
  // ==============================================================

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
      const permisos = JSON.parse(localStorage.getItem("permisos") || "[]");

      setUsuario({ nombreUsuario, fotoUrl, roles, permisos });
    };

    window.addEventListener("usuario-actualizado", actualizar);
    return () => window.removeEventListener("usuario-actualizado", actualizar);
  }, []);

  // ==============================================================
  // 🔴 3) Logout manual
  // ==============================================================

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("fotoUrl");
    localStorage.removeItem("roles");
    localStorage.removeItem("permisos");

    setUsuario(null);
  };

  // ==============================================================
  // 🎭 Roles
  // ==============================================================

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
